import { cleanText, newId, nowIso } from './util.js'

const translationCache = new Map()
const dictionaryCache = new Map()

function cacheGet(map, key, max) {
  if (!map.has(key)) return undefined
  const value = map.get(key)
  map.delete(key)
  map.set(key, value)
  while (map.size > max) map.delete(map.keys().next().value)
  return value
}

function cacheSet(map, key, value, max) {
  map.set(key, value)
  while (map.size > max) map.delete(map.keys().next().value)
}

export function modelInfo(ctx) {
  try {
    const selection = ctx.get('agentDefaultModel')?.currentSelection()
    if (!ctx.get('llm') || !selection?.provider || !selection?.model) return null
    return { provider: selection.provider, model: selection.model, label: selection.model }
  } catch {
    return null
  }
}

export async function callModel(ctx, { system, user, maxTokens = 2000, signal }) {
  const info = modelInfo(ctx)
  if (!info) throw new Error('当前没有可用的模型')
  const llm = ctx.get('llm')
  const call = await llm.prepareCall({ provider: info.provider, model: info.model, maxTokens }, signal, (controls, model) => {
    const effort = model.reasoning?.efforts?.[0]?.id
    return effort === undefined ? controls : { ...controls, reasoningEffort: effort }
  })
  let text = ''
  for await (const chunk of call.stream({
    ...call.config,
    system,
    messages: [{ role: 'user', content: [{ type: 'text', text: user }], source: { kind: 'novel-reader' } }],
    signal,
  })) {
    if (chunk.type === 'text-delta') text += chunk.text
    else if (chunk.type === 'finish' && ['error', 'aborted'].includes(chunk.reason?.kind)) {
      throw new Error(chunk.reason.failure?.message || '模型调用失败')
    }
  }
  return { text: text.trim(), model: info.label }
}

async function translateWithModel(ctx, text, targetLanguage) {
  const languageName = /^zh/i.test(targetLanguage) ? 'Simplified Chinese' : targetLanguage
  const { text: translated, model } = await callModel(ctx, {
    system: `You are a translation engine. Translate the user text into ${languageName}. Return only the translation, without explanations or quotes. Preserve the original paragraph breaks.`,
    user: text,
    maxTokens: 1200,
    signal: AbortSignal.timeout(30000),
  })
  return { translation: translated, provider: `model:${model}` }
}

export async function translateText(ctx, { text, targetLanguage = 'zh-CN', engine = 'auto' }) {
  const source = cleanText(text, 4000)
  if (!source) return { translation: '', provider: 'none' }
  const key = `${engine}\u0000${targetLanguage}\u0000${source}`
  const cached = cacheGet(translationCache, key, 400)
  if (cached) return cached

  let result
  if (engine === 'model') {
    result = await translateWithModel(ctx, source, targetLanguage)
  } else {
    const translator = ctx.get('translator')
    if (translator) {
      try {
        const spec = translator.resolve({ text: source, targetLanguage, sourceLanguage: 'en' })
        const translation = await translator.translate(spec, AbortSignal.timeout(15000))
        result = { translation, provider: spec.provider }
      } catch (error) {
        if (engine !== 'auto') throw error
      }
    }
    if (!result) {
      if (!modelInfo(ctx)) throw new Error('翻译服务不可用')
      result = await translateWithModel(ctx, source, targetLanguage)
    }
  }
  cacheSet(translationCache, key, result, 400)
  return result
}

export async function lookupWord(ctx, word, targetLanguage = 'zh-CN', engine = 'auto') {
  const term = cleanText(word, 120).replace(/^[^A-Za-z]+|[^A-Za-z'-]+$/g, '')
  if (!term) throw new Error('没有可查询的单词')
  const cacheKey = `${term.toLowerCase()}\u0000${targetLanguage}`
  const cached = cacheGet(dictionaryCache, cacheKey, 300)
  if (cached) return cached

  let dictionary = { phonetic: '', definitions: [], audio: '' }
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(term)}`, {
      signal: AbortSignal.timeout(3500),
      headers: { accept: 'application/json' },
    })
    if (response.ok) {
      const body = await response.json()
      const entry = Array.isArray(body) ? body[0] : null
      if (entry) {
        const phonetic = entry.phonetic || (Array.isArray(entry.phonetics) ? entry.phonetics.find((row) => row.text)?.text : '') || ''
        const audio = Array.isArray(entry.phonetics) ? entry.phonetics.find((row) => row.audio)?.audio ?? '' : ''
        const definitions = []
        for (const meaning of Array.isArray(entry.meanings) ? entry.meanings : []) {
          const definition = meaning.definitions?.[0]
          if (definition?.definition) {
            definitions.push({
              pos: meaning.partOfSpeech ?? '',
              text: definition.definition,
              example: definition.example ?? '',
            })
          }
          if (definitions.length >= 3) break
        }
        dictionary = { phonetic, definitions, audio }
      }
    }
  } catch {
    // The dictionary is optional; the translation still answers the lookup.
  }

  const translated = await translateText(ctx, { text: term, targetLanguage, engine })
  const result = {
    word: term,
    phonetic: dictionary.phonetic,
    definitions: dictionary.definitions,
    audio: dictionary.audio,
    translation: translated.translation,
    provider: translated.provider,
  }
  cacheSet(dictionaryCache, cacheKey, result, 300)
  return result
}

export async function recordLookup(store, entry) {
  const record = {
    id: newId('lk'),
    kind: entry.kind === 'sentence' ? 'sentence' : 'word',
    text: cleanText(entry.text, 2000),
    translation: cleanText(entry.translation, 4000),
    provider: entry.provider ?? '',
    bookId: entry.bookId ?? null,
    chapterIndex: Number.isInteger(entry.chapterIndex) ? entry.chapterIndex : null,
    chapterTitle: entry.chapterTitle ?? '',
    createdAt: nowIso(),
  }
  return store.mutateHistory((history) => {
    const duplicate = history.lookups
      .slice(-20)
      .some((row) => row.text === record.text && row.bookId === record.bookId && Date.now() - Date.parse(row.createdAt) < 10000)
    if (duplicate) return null
    history.lookups.push(record)
    if (history.lookups.length > 5000) history.lookups = history.lookups.slice(-5000)
    return record
  })
}

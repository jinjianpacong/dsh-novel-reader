import { cleanText } from './util.js'

const cache = new Map()
const MAX_CACHE = 300

function cacheGet(key) {
  if (!cache.has(key)) return undefined
  const value = cache.get(key)
  cache.delete(key)
  cache.set(key, value)
  return value
}

function cacheSet(key, value) {
  cache.set(key, value)
  while (cache.size > MAX_CACHE) cache.delete(cache.keys().next().value)
}

function absoluteAudio(value) {
  const audio = String(value ?? '')
  if (!audio) return ''
  if (/^https?:\/\//i.test(audio)) return audio
  return audio.startsWith('/') ? `https://uapis.cn${audio}` : `https://uapis.cn/${audio}`
}

function normaliseEntry(payload, fallbackWord) {
  const entry = payload?.entry
  if (!entry) return { found: false, word: fallbackWord }
  const uk = entry.phonetics?.uk ?? {}
  const us = entry.phonetics?.us ?? {}
  return {
    found: true,
    word: entry.word || fallbackWord,
    language: entry.language || 'en',
    phonetics: {
      uk: { text: uk.text ?? '', audio: absoluteAudio(uk.audio) },
      us: { text: us.text ?? '', audio: absoluteAudio(us.audio) },
    },
    examTags: Array.isArray(entry.exam_tags) ? entry.exam_tags : [],
    definitions: (Array.isArray(entry.definitions) ? entry.definitions : [])
      .map((row) => ({ pos: row.part_of_speech ?? '', meaning: row.meaning ?? '' }))
      .filter((row) => row.meaning),
    englishDefinitions: (Array.isArray(entry.english_definitions) ? entry.english_definitions : [])
      .map((row) => ({
        pos: row.part_of_speech ?? '',
        definition: row.definition ?? '',
        examples: Array.isArray(row.examples) ? row.examples : [],
      }))
      .filter((row) => row.definition),
    wordForms: Array.isArray(entry.word_forms) ? entry.word_forms : [],
    phrases: Array.isArray(entry.phrases) ? entry.phrases : [],
    synonyms: Array.isArray(entry.synonyms) ? entry.synonyms : [],
    examples: (Array.isArray(entry.examples) ? entry.examples : [])
      .map((row) => ({ source: row.source ?? '', translation: row.translation ?? '' }))
      .filter((row) => row.source),
  }
}

export async function lookupDictionary(word) {
  const term = cleanText(word, 64)
  if (!term || !/[A-Za-z]/.test(term)) {
    const error = new Error('请输入英文单词')
    error.status = 400
    error.code = 'INVALID_WORD'
    throw error
  }
  const key = term.toLowerCase()
  const cached = cacheGet(key)
  if (cached) return cached
  const response = await fetch(`https://uapis.cn/api/v1/dictionary/lookup?word=${encodeURIComponent(term)}&lang=en`, {
    signal: AbortSignal.timeout(12000),
    headers: { accept: 'application/json' },
  })
  if (response.status === 404) {
    const missing = { found: false, word: term }
    cacheSet(key, missing)
    return missing
  }
  if (!response.ok) {
    const error = new Error(`词典接口返回 HTTP ${response.status}`)
    error.status = 502
    error.code = 'DICTIONARY_FAILED'
    throw error
  }
  const payload = await response.json()
  const result = normaliseEntry(payload, term)
  cacheSet(key, result)
  return result
}

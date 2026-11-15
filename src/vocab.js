import { cleanText, newId, nowIso } from './util.js'

const IRREGULAR = new Map(Object.entries({
  children: 'child', mice: 'mouse', men: 'man', women: 'woman', people: 'person',
  went: 'go', gone: 'go', was: 'be', were: 'be', been: 'be', being: 'be',
  has: 'have', had: 'have', does: 'do', did: 'do', done: 'do',
  better: 'good', best: 'good', worse: 'bad', worst: 'bad',
  farther: 'far', furthest: 'far', less: 'little', least: 'little',
  saw: 'see', seen: 'see', made: 'make', took: 'take', taken: 'take',
  came: 'come', thought: 'think', knew: 'know', known: 'know',
}))

export function lemmatize(term) {
  const value = cleanText(term, 120).toLowerCase()
  if (!value || /\s/.test(value)) return value
  if (IRREGULAR.has(value)) return IRREGULAR.get(value)
  if (value.length <= 3) return value
  if (/ies$/.test(value)) return `${value.slice(0, -3)}y`
  if (/ves$/.test(value)) return `${value.slice(0, -3)}f`
  if (/(ches|shes|sses|xes|zes)$/.test(value)) return value.slice(0, -2)
  if (/ied$/.test(value)) return `${value.slice(0, -3)}y`
  if (/ing$/.test(value) && value.length > 5) {
    let stem = value.slice(0, -3)
    if (/([b-df-hj-np-tv-z])\1$/.test(stem)) stem = stem.slice(0, -1)
    return stem
  }
  if (/ed$/.test(value) && value.length > 4) {
    let stem = value.slice(0, -2)
    if (/([b-df-hj-np-tv-z])\1$/.test(stem)) stem = stem.slice(0, -1)
    return stem
  }
  if (/s$/.test(value) && !/ss$/.test(value)) return value.slice(0, -1)
  return value
}

function normaliseContext(context) {
  if (!context || typeof context !== 'object') return null
  const sentence = cleanText(context.sentence ?? '', 600)
  if (!sentence) return null
  return {
    bookId: context.bookId ?? null,
    chapterIndex: Number.isInteger(context.chapterIndex) ? context.chapterIndex : null,
    chapterTitle: context.chapterTitle ?? '',
    sentence,
    start: Number.isInteger(context.start) ? context.start : null,
    end: Number.isInteger(context.end) ? context.end : null,
  }
}

function sameContext(a, b) {
  return a.bookId === b.bookId && a.chapterIndex === b.chapterIndex && a.sentence === b.sentence
}

export async function addVocab(store, input) {
  const term = cleanText(input.term ?? '', 120)
  if (!term) {
    const error = new Error('单词不能为空')
    error.status = 400
    error.code = 'INVALID_INPUT'
    throw error
  }
  const kind = input.kind === 'phrase' || /\s/.test(term) ? 'phrase' : 'word'
  const lemma = kind === 'word' ? lemmatize(term) : term.toLowerCase()
  const context = normaliseContext(input.context)
  const translations = (Array.isArray(input.translations) ? input.translations : [input.translation])
    .map((value) => cleanText(value, 300))
    .filter(Boolean)
    .slice(0, 6)
  const definitions = (Array.isArray(input.definitions) ? input.definitions : [])
    .map((row) => ({
      pos: cleanText(row?.pos ?? '', 20),
      text: cleanText(row?.text ?? '', 600),
      example: cleanText(row?.example ?? '', 600),
    }))
    .filter((row) => row.text)
    .slice(0, 3)

  return store.mutate((state) => {
    const now = nowIso()
    const existing = state.vocab.find((row) => !row.deletedAt && row.lemma === lemma && row.kind === kind)
    if (existing) {
      if (translations.length) {
        const merged = new Set([...(existing.translations ?? []), ...translations])
        existing.translations = [...merged].slice(0, 6)
      }
      if (definitions.length) existing.definitions = definitions
      if (input.phonetic && !existing.phonetic) existing.phonetic = cleanText(input.phonetic, 120)
      if (input.notes) existing.notes = cleanText(input.notes, 2000)
      if (Array.isArray(input.tags)) existing.tags = [...new Set([...(existing.tags ?? []), ...input.tags.map((tag) => cleanText(tag, 40)).filter(Boolean)])]
      if (context && !(existing.contexts ?? []).some((row) => sameContext(row, context))) {
        existing.contexts = [...(existing.contexts ?? []), context].slice(-20)
      }
      existing.updatedAt = now
      return { entry: existing, created: false }
    }
    const entry = {
      id: newId('vw'),
      term,
      lemma,
      kind,
      phonetic: cleanText(input.phonetic ?? '', 120),
      pos: cleanText(input.pos ?? definitions[0]?.pos ?? '', 20),
      definitions,
      translations,
      contexts: context ? [context] : [],
      notes: cleanText(input.notes ?? '', 2000),
      tags: Array.isArray(input.tags) ? [...new Set(input.tags.map((tag) => cleanText(tag, 40)).filter(Boolean))] : [],
      status: 'new',
      srs: { ease: 2.5, intervalDays: 0, dueAt: now, reps: 0, lapses: 0 },
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    }
    state.vocab.push(entry)
    return { entry, created: true }
  })
}

export async function updateVocab(store, id, patch) {
  return store.mutate((state) => {
    const entry = state.vocab.find((row) => row.id === id && !row.deletedAt)
    if (!entry) {
      const error = new Error('生词不存在')
      error.status = 404
      error.code = 'VOCAB_NOT_FOUND'
      throw error
    }
    if (patch.notes !== undefined) entry.notes = cleanText(patch.notes, 4000)
    if (Array.isArray(patch.tags)) entry.tags = [...new Set(patch.tags.map((tag) => cleanText(tag, 40)).filter(Boolean))]
    if (patch.translations !== undefined) {
      entry.translations = (Array.isArray(patch.translations) ? patch.translations : []).map((value) => cleanText(value, 300)).filter(Boolean).slice(0, 6)
    }
    if (patch.status === 'mastered') {
      entry.status = 'mastered'
      entry.srs = { ...entry.srs, intervalDays: 60, dueAt: new Date(Date.now() + 60 * 86400000).toISOString() }
    } else if (patch.status === 'new') {
      entry.status = 'new'
      entry.srs = { ease: 2.5, intervalDays: 0, dueAt: nowIso(), reps: 0, lapses: 0 }
    }
    entry.updatedAt = nowIso()
    return entry
  })
}

export async function deleteVocab(store, id) {
  return store.mutate((state) => {
    const entry = state.vocab.find((row) => row.id === id && !row.deletedAt)
    if (entry) {
      entry.deletedAt = nowIso()
      entry.updatedAt = entry.deletedAt
    }
    return entry
  })
}

export function reviewEntry(entry, rating) {
  const now = Date.now()
  const srs = entry.srs ?? { ease: 2.5, intervalDays: 0, reps: 0, lapses: 0 }
  let ease = Number(srs.ease) || 2.5
  let intervalDays = Number(srs.intervalDays) || 0
  let lapses = Number(srs.lapses) || 0
  const reps = (Number(srs.reps) || 0) + 1

  if (rating === 'again') {
    ease = Math.max(1.3, ease - 0.2)
    intervalDays = 10 / 1440
    lapses += 1
  } else if (rating === 'hard') {
    ease = Math.max(1.3, ease - 0.05)
    intervalDays = Math.max(1 / 24, intervalDays * 1.2)
  } else if (rating === 'easy') {
    ease = Math.min(3.2, ease + 0.15)
    intervalDays = Math.max(2, (intervalDays || 1) * ease * 1.3)
  } else {
    intervalDays = intervalDays < 1 ? 1 : intervalDays * ease
  }

  const dueAt = new Date(now + intervalDays * 86400000).toISOString()
  let status = 'learning'
  if (intervalDays >= 60 && reps >= 3) status = 'mastered'
  else if (intervalDays >= 1) status = 'review'
  else if (reps === 0) status = 'new'
  if (intervalDays === 0) status = 'new'

  entry.srs = { ease: Number(ease.toFixed(2)), intervalDays: Number(intervalDays.toFixed(4)), dueAt, reps, lapses }
  entry.status = status
  entry.updatedAt = nowIso()
  return entry
}

export async function reviewVocab(store, id, rating) {
  return store.mutate((state) => {
    const entry = state.vocab.find((row) => row.id === id && !row.deletedAt)
    if (!entry) {
      const error = new Error('生词不存在')
      error.status = 404
      error.code = 'VOCAB_NOT_FOUND'
      throw error
    }
    return reviewEntry(entry, rating)
  })
}

export function dueCount(vocab) {
  const now = Date.now()
  return vocab.filter((row) => !row.deletedAt && Date.parse(row.srs?.dueAt ?? 0) <= now).length
}

export function filterVocab(vocab, { q = '', status = '', bookId = '', due = false, tag = '' } = {}) {
  const now = Date.now()
  const query = String(q).trim().toLowerCase()
  return vocab
    .filter((row) => !row.deletedAt)
    .filter((row) => !status || row.status === status)
    .filter((row) => !bookId || (row.contexts ?? []).some((context) => context.bookId === bookId))
    .filter((row) => !tag || (row.tags ?? []).includes(tag))
    .filter((row) => !due || Date.parse(row.srs?.dueAt ?? 0) <= now)
    .filter((row) => !query || row.term.toLowerCase().includes(query) || row.translations.some((value) => value.toLowerCase().includes(query)))
    .sort((a, b) => Date.parse(a.srs?.dueAt ?? 0) - Date.parse(b.srs?.dueAt ?? 0) || Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
}

import { callModel, modelInfo } from './translate.js'
import { reviewEntry } from './vocab.js'
import { recordQuizAttempt } from './history.js'
import { cleanText, clamp, newId, nowIso } from './util.js'

const QUIZ_TYPES = ['meaning-en-zh', 'meaning-zh-en', 'cloze', 'spelling', 'context']

function shuffle(list) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function translationOf(entry) {
  return entry.translations?.[0] ?? entry.definitions?.[0]?.text ?? ''
}

function selectEntries(state, scope = {}) {
  const now = Date.now()
  let pool = state.vocab.filter((entry) => !entry.deletedAt)
  if (Array.isArray(scope.vocabIds) && scope.vocabIds.length) {
    const ids = new Set(scope.vocabIds)
    pool = pool.filter((entry) => ids.has(entry.id))
  } else if (scope.type === 'book') {
    pool = pool.filter((entry) => (entry.contexts ?? []).some((context) => context.bookId === scope.bookId))
  } else if (scope.type === 'tag') {
    pool = pool.filter((entry) => (entry.tags ?? []).includes(scope.tag))
  } else if (scope.type === 'due') {
    pool = pool.filter((entry) => Date.parse(entry.srs?.dueAt ?? 0) <= now)
  } else if (scope.type === 'recent') {
    pool = [...pool].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 40)
  }
  if (!pool.length) pool = state.vocab.filter((entry) => !entry.deletedAt)
  return pool
}

function distractors(pool, entry, valueOf, count = 3) {
  const correct = valueOf(entry)
  const values = []
  for (const row of shuffle(pool)) {
    if (row.id === entry.id) continue
    const value = valueOf(row)
    if (!value || value === correct || values.includes(value)) continue
    values.push(value)
    if (values.length >= count) break
  }
  return values
}

function makeQuestion(entry, type, pool) {
  const translation = translationOf(entry)
  const context = entry.contexts?.[0]
  if (type === 'meaning-en-zh') {
    const options = shuffle([translation, ...distractors(pool, entry, translationOf)])
    return {
      type,
      vocabId: entry.id,
      term: entry.term,
      prompt: `“${entry.term}” 最接近的意思是？`,
      options,
      answer: options.indexOf(translation),
      explanation: `${entry.term}：${translation}`,
    }
  }
  if (type === 'meaning-zh-en') {
    const options = shuffle([entry.term, ...distractors(pool, entry, (row) => row.term)])
    return {
      type,
      vocabId: entry.id,
      term: entry.term,
      prompt: `“${translation || entry.term}” 对应的英文单词是？`,
      options,
      answer: options.indexOf(entry.term),
      explanation: `${translation || entry.term} → ${entry.term}`,
    }
  }
  if (type === 'cloze') {
    const sentence = context?.sentence ?? `The word ____ means “${translation}”.`
    const blanked = sentence.replace(new RegExp(`\\b${entry.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i'), '____')
    const options = shuffle([entry.term, ...distractors(pool, entry, (row) => row.term)])
    return {
      type,
      vocabId: entry.id,
      term: entry.term,
      prompt: blanked.includes('____') ? blanked : `The word ____ means “${translation}”.`,
      options,
      answer: options.indexOf(entry.term),
      explanation: `原句：${sentence}`,
      source: context ? { bookId: context.bookId, chapterIndex: context.chapterIndex } : null,
    }
  }
  if (type === 'spelling') {
    return {
      type,
      vocabId: entry.id,
      term: entry.term,
      prompt: `根据中文释义写出单词：${translation || entry.definitions?.[0]?.text || ''}（首字母 ${entry.term[0]?.toUpperCase() ?? ''}，共 ${entry.term.replace(/\s/g, '').length} 个字母）`,
      options: [],
      answerText: entry.term,
      explanation: `${entry.term}：${translation}`,
    }
  }
  const sentence = context?.sentence ?? ''
  const options = shuffle([translation, ...distractors(pool, entry, translationOf)])
  return {
    type: 'context',
    vocabId: entry.id,
    term: entry.term,
    prompt: sentence ? `在句子 “${sentence}” 中，${entry.term} 的意思是？` : `“${entry.term}” 在语境中的意思是？`,
    options,
    answer: options.indexOf(translation),
    explanation: `${entry.term}：${translation}`,
    source: context ? { bookId: context.bookId, chapterIndex: context.chapterIndex } : null,
  }
}

function localQuestions(pool, count, types) {
  const usable = types.filter((type) => QUIZ_TYPES.includes(type))
  const chosenTypes = usable.length ? usable : QUIZ_TYPES.slice(0, 4)
  const questions = []
  for (let i = 0; i < count; i += 1) {
    const entry = pool[i % pool.length]
    if (!entry) break
    let type = chosenTypes[i % chosenTypes.length]
    if (type === 'cloze' && !translationOf(entry)) type = 'meaning-en-zh'
    if (type === 'context' && !entry.contexts?.length) type = 'meaning-en-zh'
    const question = makeQuestion(entry, type, pool)
    if (question.options.length && question.answer < 0) continue
    questions.push({ id: `q${questions.length + 1}`, ...question })
  }
  return questions
}

function extractJson(text) {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(text)
  const body = fenced ? fenced[1] : text
  const start = body.search(/[{[]/)
  const end = Math.max(body.lastIndexOf('}'), body.lastIndexOf(']'))
  if (start < 0 || end < start) throw new Error('模型没有返回 JSON')
  return JSON.parse(body.slice(start, end + 1))
}

function validateQuestions(raw, pool, count) {
  const byId = new Map(pool.map((entry) => [entry.id, entry]))
  const list = Array.isArray(raw) ? raw : Array.isArray(raw?.questions) ? raw.questions : []
  const questions = []
  for (const row of list) {
    if (!row || typeof row !== 'object') continue
    const entry = byId.get(row.vocabId)
    if (!entry) continue
    const type = QUIZ_TYPES.includes(row.type) ? row.type : 'meaning-en-zh'
    const prompt = cleanText(row.prompt, 1200)
    if (!prompt) continue
    if (type === 'spelling') {
      const answerText = cleanText(row.answerText ?? row.answer ?? '', 120)
      if (!answerText) continue
      questions.push({
        id: `q${questions.length + 1}`,
        type,
        vocabId: entry.id,
        term: entry.term,
        prompt,
        options: [],
        answerText,
        explanation: cleanText(row.explanation, 800) || `${entry.term}：${translationOf(entry)}`,
      })
      continue
    }
    const options = (Array.isArray(row.options) ? row.options : []).map((value) => cleanText(value, 300)).filter(Boolean).slice(0, 4)
    if (options.length < 2) continue
    let answer = Number(row.answer)
    if (!Number.isInteger(answer)) {
      answer = options.findIndex((option) => option === cleanText(row.answer, 300))
    }
    if (answer < 0 || answer >= options.length) continue
    questions.push({
      id: `q${questions.length + 1}`,
      type,
      vocabId: entry.id,
      term: entry.term,
      prompt,
      options,
      answer,
      explanation: cleanText(row.explanation, 800) || `${entry.term}：${translationOf(entry)}`,
    })
    if (questions.length >= count) break
  }
  return questions
}

async function modelQuestions(ctx, pool, count, types) {
  const entries = pool.slice(0, 30).map((entry) => ({
    id: entry.id,
    term: entry.term,
    translations: entry.translations,
    definitions: entry.definitions?.map((row) => row.text).slice(0, 2),
    context: entry.contexts?.[0]?.sentence ?? '',
  }))
  const { text } = await callModel(ctx, {
    system: `You write English-vocabulary practice questions for a Chinese learner. Return only JSON: {"questions":[...]}.
Each question: {"type":"meaning-en-zh|meaning-zh-en|cloze|spelling|context","vocabId":"...","term":"...","prompt":"...","options":["..."],"answer":0,"answerText":"","explanation":"..."}.
Rules: use only the supplied vocabId values and terms; for types other than spelling give 3 or 4 options and a zero-based answer index; for spelling give answerText and no options; cloze prompts must contain ____; include a short Chinese explanation. Generate exactly ${count} questions using types: ${types.join(', ')}.`,
    user: JSON.stringify({ entries }),
    maxTokens: 3000,
    signal: AbortSignal.timeout(60000),
  })
  return validateQuestions(extractJson(text), pool, count)
}

export async function generateQuiz(ctx, store, body = {}) {
  const state = await store.read()
  const count = clamp(Number(body.count) || 10, 1, 30)
  const types = Array.isArray(body.types) && body.types.length ? body.types.filter((type) => QUIZ_TYPES.includes(type)) : QUIZ_TYPES.slice(0, 4)
  const pool = selectEntries(state, body.scope ?? {})
  if (pool.length < 2) {
    const error = new Error('生词本里的词太少，至少需要 2 个词')
    error.status = 400
    error.code = 'QUIZ_NOT_ENOUGH_VOCAB'
    throw error
  }

  let questions = []
  let engine = 'local'
  if (modelInfo(ctx)) {
    try {
      questions = await modelQuestions(ctx, pool, count, types)
      if (questions.length) engine = 'model'
    } catch {
      questions = []
    }
  }
  if (questions.length < count) {
    const local = localQuestions(pool, count - questions.length, types)
    questions = [...questions, ...local.map((question, index) => ({ ...question, id: `q${questions.length + index + 1}` }))]
  }
  questions = questions.slice(0, count).map((question, index) => ({ ...question, id: `q${index + 1}` }))

  const quiz = {
    id: newId('qz'),
    createdAt: nowIso(),
    scope: body.scope ?? { type: 'all' },
    count: questions.length,
    types,
    engine,
    questions,
    status: 'active',
    score: null,
  }
  await store.mutate((draft) => {
    draft.quizzes.push(quiz)
    if (draft.quizzes.length > 100) draft.quizzes = draft.quizzes.slice(-100)
  })
  return quiz
}

export async function finishQuiz(store, quizId, answers = []) {
  const result = await store.mutate((state) => {
    const quiz = state.quizzes.find((row) => row.id === quizId)
    if (!quiz) {
      const error = new Error('练习不存在')
      error.status = 404
      error.code = 'QUIZ_NOT_FOUND'
      throw error
    }
    const answerMap = new Map((Array.isArray(answers) ? answers : []).map((row) => [row.questionId, row]))
    const results = quiz.questions.map((question) => {
      const answer = answerMap.get(question.id)
      let correct = false
      if (question.type === 'spelling') {
        correct = cleanText(answer?.text ?? '', 200).toLowerCase() === String(question.answerText).toLowerCase()
      } else {
        correct = Number(answer?.choice) === question.answer
      }
      return { questionId: question.id, vocabId: question.vocabId, correct, choice: answer?.choice ?? null, text: answer?.text ?? '' }
    })
    const score = results.filter((row) => row.correct).length / Math.max(1, results.length)
    quiz.status = 'done'
    quiz.score = score
    quiz.finishedAt = nowIso()

    const touched = new Set()
    for (const row of results) {
      const entry = state.vocab.find((item) => item.id === row.vocabId && !item.deletedAt)
      if (entry && !touched.has(entry.id)) {
        reviewEntry(entry, row.correct ? 'good' : 'again')
        touched.add(entry.id)
      }
    }
    return { quiz, results, score }
  })
  const attempt = {
    id: newId('qa'),
    quizId,
    startedAt: result.quiz.createdAt,
    endedAt: nowIso(),
    answers: result.results,
    score: result.score,
  }
  await recordQuizAttempt(store, attempt)
  return { quiz: result.quiz, results: result.results, score: result.score, attempt }
}

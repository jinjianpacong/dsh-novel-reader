import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Store } from '../src/store.js'
import { importBook } from '../src/library.js'
import { addVocab, reviewVocab } from '../src/vocab.js'
import { generateQuiz, finishQuiz } from '../src/quiz.js'
import { startSession, heartbeat, endSession, computeStats } from '../src/history.js'

const root = await mkdtemp(join(tmpdir(), 'nr-smoke-'))
try {
  const store = new Store(root)
  await store.init()

  const text = [
    'Chapter 1',
    '',
    'It was a bright cold day in April, and the clocks were striking thirteen. Winston Smith slipped quickly through the glass doors.',
    '',
    'The hallway smelt of boiled cabbage and old rag mats. A coloured poster had been tacked to the wall.',
    '',
    'Chapter 2',
    '',
    'Winston turned a switch and the voice sank somewhat, though the words were still distinguishable. The instrument could be dimmed.',
    '',
    'He was a lonely ghost uttering a truth that nobody would ever hear.',
  ].join('\n')

  const imported = await importBook(store, Buffer.from(text, 'utf8'), 'nineteen-eighty-four.txt')
  console.log('book', imported.book.id, imported.book.title, imported.book.chapterCount, imported.book.wordCount)
  const chapter = await store.readChapter(imported.book.id, 0)
  console.log('chapter', chapter.title, chapter.text.slice(0, 50))
  if (!chapter.html.includes('<p>')) throw new Error('chapter html missing p')

  const words = [
    ['bright', '明亮的'],
    ['clocks', '时钟'],
    ['slipped', '溜走'],
    ['hallway', '走廊'],
    ['distinguishable', '可分辨的'],
  ]
  for (const [term, translation] of words) {
    await addVocab(store, {
      term,
      kind: 'word',
      translation,
      context: { bookId: imported.book.id, chapterIndex: 0, chapterTitle: 'Chapter 1', sentence: `Context sentence with ${term}.` },
    })
  }
  const state = await store.read()
  console.log('vocab', state.vocab.length, state.vocab.map((row) => row.lemma).join(','))

  const quiz = await generateQuiz({ get: () => undefined }, store, { scope: { type: 'all' }, count: 5, types: ['meaning-en-zh', 'cloze', 'spelling'] })
  console.log('quiz', quiz.id, quiz.engine, quiz.questions.length, quiz.questions.map((row) => row.type).join(','))
  if (quiz.questions.length !== 5) throw new Error('quiz question count mismatch')
  const answers = quiz.questions.map((row) => row.type === 'spelling' ? { questionId: row.id, text: row.answerText } : { questionId: row.id, choice: row.answer })
  const result = await finishQuiz(store, quiz.id, answers)
  console.log('score', result.score, 'attempt', result.attempt.id)

  await reviewVocab(store, state.vocab[0].id, 'good')
  const session = await startSession(store, { bookId: imported.book.id, chapterIndex: 0 })
  await heartbeat(store, { sessionId: session.id, chapterIndex: 1, wordsReadDelta: 120 })
  await endSession(store, { sessionId: session.id })
  const history = await store.readHistory()
  console.log('history', history.sessions.length, history.lookups.length, history.quizAttempts.length)
  console.log('stats', JSON.stringify(computeStats(history, 7).daily.slice(-1)))
  console.log('SMOKE OK')
} finally {
  await rm(root, { recursive: true, force: true })
}

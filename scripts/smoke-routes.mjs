import { createServer } from 'node:http'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Store } from '../src/store.js'
import { WebDavSync } from '../src/sync.js'
import { createRouter } from '../src/routes.js'

const root = await mkdtemp(join(tmpdir(), 'nr-routes-'))
const store = new Store(root)
await store.init()
const ctx = {
  get(name) {
    if (name === 'connection') return { requestRejection: () => undefined }
    if (name === 'credentials') return undefined
    return undefined
  },
}
const router = createRouter({ ctx, store, sync: new WebDavSync(ctx, store) })
const server = createServer((req, res) => router(req, res))
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
const port = server.address().port
const base = `http://127.0.0.1:${port}`

const text = 'Chapter 1\n\nIt was a bright cold day in April, and the clocks were striking thirteen.\n\nChapter 2\n\nWinston turned a switch and the voice sank somewhat.'
let response = await fetch(`${base}/novel-reader/api/books/import`, { method: 'POST', headers: { 'x-file-name': 'book.txt' }, body: text })
let payload = await response.json()
console.log('import', response.status, payload.ok, payload.data?.book?.title, payload.data?.book?.chapterCount)
const book = payload.data.book
response = await fetch(`${base}/novel-reader/api/state`)
payload = await response.json()
console.log('state', response.status, payload.data.books.length, payload.data.vocabCount)
response = await fetch(`${base}/novel-reader/api/vocab`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ term: 'bright', translation: '明亮的', context: { bookId: book.id, chapterIndex: 0, chapterTitle: 'Chapter 1', sentence: 'It was a bright cold day.' } }) })
payload = await response.json()
console.log('vocab', response.status, payload.data?.entry?.lemma)
for (const [term, translation] of [['clocks', '时钟'], ['switch', '开关'], ['voice', '声音']]) {
  await fetch(`${base}/novel-reader/api/vocab`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ term, translation }) })
}
response = await fetch(`${base}/novel-reader/api/quiz/generate`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ scope: { type: 'all' }, count: 5, types: ['meaning-en-zh', 'spelling'] }) })
payload = await response.json()
console.log('quiz', response.status, payload.ok, payload.data?.quiz?.questions?.length, payload.data?.quiz?.engine)
if (payload.ok) {
  const quiz = payload.data.quiz
  const answers = quiz.questions.map((q) => q.type === 'spelling' ? { questionId: q.id, text: q.answerText } : { questionId: q.id, choice: q.answer })
  response = await fetch(`${base}/novel-reader/api/quiz/${quiz.id}/finish`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ answers }) })
  payload = await response.json()
  console.log('finish', response.status, payload.data?.score)
}
response = await fetch(`${base}/novel-reader/api/history?type=reading`)
payload = await response.json()
console.log('history', response.status, payload.data?.sessions?.length)
response = await fetch(`${base}/novel-reader/api/settings`)
payload = await response.json()
console.log('settings', response.status, payload.data?.dataDir, payload.data?.sync?.passwordConfigured)
response = await fetch(`${base}/novel-reader/api/settings`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ theme: 'night', fontSize: 20 }) })
payload = await response.json()
console.log('settings patch', response.status, payload.data?.theme, payload.data?.fontSize)
response = await fetch(`${base}/novel-reader/api/backup/export`, { method: 'POST' })
const backup = Buffer.from(await response.arrayBuffer())
console.log('backup', response.status, backup.length, backup[0], backup[1])
server.close()
await rm(root, { recursive: true, force: true })
console.log('ROUTES OK')

import { createServer } from 'node:http'
import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { dirname, join, normalize } from 'node:path'
import { tmpdir } from 'node:os'
import { Store } from '../src/store.js'
import { WebDavSync } from '../src/sync.js'
import { importBook } from '../src/library.js'
import { addVocab } from '../src/vocab.js'

const remoteRoot = await mkdtemp(join(tmpdir(), 'nr-dav-'))
const local1 = await mkdtemp(join(tmpdir(), 'nr-local1-'))
const local2 = await mkdtemp(join(tmpdir(), 'nr-local2-'))

const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname)
    const rel = pathname.replace(/^\/novel-reader\/?/, '')
    const full = normalize(join(remoteRoot, rel))
    if (!full.startsWith(normalize(remoteRoot))) { res.statusCode = 403; return res.end() }
    if (req.method === 'PROPFIND') {
      try { await stat(full); res.statusCode = 207; return res.end('<?xml version="1.0"?><d:multistatus xmlns:d="DAV:"/>') } catch { res.statusCode = 404; return res.end() }
    }
    if (req.method === 'MKCOL') {
      try { await mkdir(full, { recursive: true }); res.statusCode = 201; return res.end() } catch { res.statusCode = 405; return res.end() }
    }
    if (req.method === 'PUT') {
      await mkdir(dirname(full), { recursive: true })
      const chunks = []
      for await (const chunk of req) chunks.push(chunk)
      await writeFile(full, Buffer.concat(chunks))
      res.statusCode = 201
      return res.end()
    }
    if (req.method === 'GET') {
      try { res.statusCode = 200; res.end(await readFile(full)) } catch { res.statusCode = 404; res.end() }
      return
    }
    res.statusCode = 405
    res.end()
  } catch (error) {
    res.statusCode = 500
    res.end(error.message)
  }
})
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
const base = `http://127.0.0.1:${server.address().port}`

function fakeCtx() {
  let record = null
  return {
    get(name) {
      if (name !== 'credentials') return undefined
      return {
        async readRecord() { return record },
        async modifyRecord(key, mutate) { record = await mutate(record); return record },
        async deleteRecord() { record = null },
      }
    },
  }
}

try {
  const store1 = new Store(local1)
  await store1.init()
  const imported = await importBook(store1, Buffer.from('Chapter 1\n\nAlpha beta gamma delta epsilon zeta eta theta.', 'utf8'), 'dav-book.txt')
  await addVocab(store1, { term: 'alpha', translation: '阿尔法', context: { bookId: imported.book.id, chapterIndex: 0, chapterTitle: 'Chapter 1', sentence: 'Alpha beta gamma.' } })
  await store1.mutate((state) => { Object.assign(state.settings.sync, { enabled: true, url: base, remoteDir: 'novel-reader', username: 'user' }) })
  const sync1 = new WebDavSync(fakeCtx(), store1)
  await sync1.setPassword('secret')
  console.log('test1', await sync1.test())
  const first = await sync1.sync()
  console.log('first', first.uploaded, first.downloaded, first.skipped)

  const store2 = new Store(local2)
  await store2.init()
  await addVocab(store2, { term: 'beta', translation: '贝塔' })
  await store2.mutate((state) => { Object.assign(state.settings.sync, { enabled: true, url: base, remoteDir: 'novel-reader', username: 'user' }) })
  const sync2 = new WebDavSync(fakeCtx(), store2)
  await sync2.setPassword('secret')
  const second = await sync2.sync()
  console.log('second', second.uploaded, second.downloaded, second.skipped)
  const state2 = await store2.read()
  console.log('state2', state2.books.length, state2.vocab.map((entry) => entry.term).sort().join(','))
  if (state2.books.length !== 1 || !state2.vocab.some((entry) => entry.term === 'alpha') || !state2.vocab.some((entry) => entry.term === 'beta')) throw new Error('merge failed')
  console.log('WEBDAV OK')
} finally {
  server.close()
  await rm(remoteRoot, { recursive: true, force: true })
  await rm(local1, { recursive: true, force: true })
  await rm(local2, { recursive: true, force: true })
}

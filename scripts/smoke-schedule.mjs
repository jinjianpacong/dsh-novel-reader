import { createServer } from 'node:http'
import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { dirname, join, normalize } from 'node:path'
import { tmpdir } from 'node:os'
import { Store } from '../src/store.js'
import { WebDavSync } from '../src/sync.js'

const remote = await mkdtemp(join(tmpdir(), 'nr-schedule-remote-'))
const local = await mkdtemp(join(tmpdir(), 'nr-schedule-local-'))
const server = createServer(async (req, res) => {
  const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/dav\/?/, '')
  const full = normalize(join(remote, rel))
  if (!full.startsWith(normalize(remote))) { res.statusCode = 403; return res.end() }
  try {
    if (req.method === 'PROPFIND') {
      try { await stat(full); res.statusCode = 207; return res.end('<d:multistatus xmlns:d="DAV:"/>') } catch { res.statusCode = 404; return res.end() }
    }
    if (req.method === 'MKCOL') { await mkdir(full, { recursive: true }); res.statusCode = 201; return res.end() }
    if (req.method === 'PUT') {
      await mkdir(dirname(full), { recursive: true })
      const chunks = []
      for await (const chunk of req) chunks.push(chunk)
      await writeFile(full, Buffer.concat(chunks))
      res.statusCode = 201
      return res.end()
    }
    if (req.method === 'GET') {
      try { res.statusCode = 200; return res.end(await readFile(full)) } catch { res.statusCode = 404; return res.end() }
    }
    res.statusCode = 405
    res.end()
  } catch { res.statusCode = 500; res.end() }
})
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
let record = null
const ctx = { get: (name) => name === 'credentials' ? {
  readRecord: async () => record,
  modifyRecord: async (_key, mutate) => (record = await mutate(record)),
  deleteRecord: async () => { record = null },
} : undefined }
try {
  const store = new Store(local)
  await store.init()
  await store.mutate((state) => Object.assign(state.settings.sync, { enabled: true, url: `http://127.0.0.1:${server.address().port}/dav/`, remoteDir: 'novel-reader', username: 'u' }))
  const sync = new WebDavSync(ctx, store)
  await sync.setPassword('p')
  console.log('direct', await sync.sync())
  sync.schedule(100)
  await new Promise((resolve) => setTimeout(resolve, 2500))
  console.log('timer', sync.timer, 'lock', sync.lock)
  const manifest = JSON.parse(await readFile(join(remote, 'novel-reader', 'manifest.json'), 'utf8'))
  console.log('SCHEDULE OK', Object.keys(manifest.files).length, 'files')
  sync.dispose()
} finally {
  server.close()
  await rm(remote, { recursive: true, force: true })
  await rm(local, { recursive: true, force: true })
}

import { createServer } from 'node:http'
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { dirname, join, normalize } from 'node:path'

const root = 'C:\\Users\\1\\ego\\novel-reader-check\\dav-root'
await mkdir(root, { recursive: true })

const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname)
    const rel = pathname.replace(/^\/novel-reader\/?/, '')
    const full = normalize(join(root, rel))
    if (!full.startsWith(normalize(root))) { res.statusCode = 403; return res.end() }
    if (req.method === 'PROPFIND') {
      try { await stat(full); res.statusCode = 207; res.setHeader('content-type', 'application/xml'); return res.end('<?xml version="1.0"?><d:multistatus xmlns:d="DAV:"/>') } catch { res.statusCode = 404; return res.end() }
    }
    if (req.method === 'MKCOL') {
      await mkdir(full, { recursive: true })
      res.statusCode = 201
      return res.end()
    }
    if (req.method === 'PUT') {
      await mkdir(dirname(full), { recursive: true })
      const chunks = []
      for await (const chunk of req) chunks.push(chunk)
      await writeFile(full, Buffer.concat(chunks))
      res.statusCode = 201
      return res.end()
    }
    if (req.method === 'GET' || req.method === 'HEAD') {
      try {
        const body = await readFile(full)
        res.statusCode = 200
        res.setHeader('content-length', String(body.length))
        return res.end(req.method === 'HEAD' ? undefined : body)
      } catch {
        res.statusCode = 404
        return res.end()
      }
    }
    res.statusCode = 405
    res.end()
  } catch (error) {
    res.statusCode = 500
    res.end(error.message)
  }
})

server.listen(8799, '127.0.0.1', () => console.log('webdav test server on 8799'))

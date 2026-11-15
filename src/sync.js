import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join, sep } from 'node:path'
import { isObject, nowIso, sha256 } from './util.js'

const CREDENTIAL_KEY = 'novel-reader/webdav'

function encodePath(path) {
  return String(path)
    .split('/')
    .filter((segment) => segment.length > 0)
    .map((segment) => encodeURIComponent(segment))
    .join('/')
}

function normaliseRemote(settings) {
  const base = String(settings.url ?? '').trim().replace(/\/+$/, '')
  const dir = String(settings.remoteDir ?? 'novel-reader').trim().replace(/^\/+|\/+$/g, '') || 'novel-reader'
  return `${base}/${encodePath(dir)}`
}

async function walk(root, prefix = '') {
  const files = []
  let entries = []
  try {
    entries = await readdir(root, { withFileTypes: true })
  } catch (error) {
    if (error.code === 'ENOENT') return files
    throw error
  }
  for (const entry of entries) {
    const full = join(root, entry.name)
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.isDirectory()) files.push(...await walk(full, rel))
    else if (entry.isFile()) files.push({ path: rel, full })
  }
  return files
}

function newer(a, b) {
  return Date.parse(a?.updatedAt ?? 0) >= Date.parse(b?.updatedAt ?? 0) ? a : b
}

function mergeCollection(localList, remoteList) {
  const map = new Map()
  for (const row of Array.isArray(localList) ? localList : []) {
    if (row?.id) map.set(row.id, row)
  }
  for (const row of Array.isArray(remoteList) ? remoteList : []) {
    if (!row?.id) continue
    if (!map.has(row.id)) map.set(row.id, row)
    else map.set(row.id, newer(map.get(row.id), row))
  }
  return [...map.values()]
}

function mergeState(local, remote) {
  if (!isObject(remote)) return local
  return {
    version: local.version ?? 1,
    deviceId: local.deviceId,
    settings: local.settings,
    books: mergeCollection(local.books, remote.books),
    vocab: mergeCollection(local.vocab, remote.vocab),
    quizzes: mergeCollection(local.quizzes, remote.quizzes),
  }
}

function mergeHistory(local, remote) {
  if (!isObject(remote)) return local
  const merge = (a, b) => {
    const map = new Map()
    for (const row of Array.isArray(a) ? a : []) if (row?.id) map.set(row.id, row)
    for (const row of Array.isArray(b) ? b : []) if (row?.id && !map.has(row.id)) map.set(row.id, row)
    return [...map.values()]
  }
  return {
    version: local.version ?? 1,
    sessions: merge(local.sessions, remote.sessions).slice(-3000),
    lookups: merge(local.lookups, remote.lookups).slice(-5000),
    quizAttempts: merge(local.quizAttempts, remote.quizAttempts).slice(-1000),
  }
}

export class WebDavSync {
  constructor(ctx, store) {
    this.ctx = ctx
    this.store = store
    this.lock = false
    this.timer = null
  }

  async settings() {
    const state = await this.store.read()
    return state.settings.sync
  }

  schedule(delay = 5000) {
    if (!this.timer) {
      this.timer = setTimeout(async () => {
        this.timer = null
        try {
          const settings = await this.settings()
          if (!settings.enabled) return
          if (this.lock) {
            this.schedule(5000)
            return
          }
          await this.sync()
        } catch {
          // Background sync failures stay in sync status; local changes are already durable.
        }
      }, delay)
    }
  }

  dispose() {
    if (this.timer) clearTimeout(this.timer)
    this.timer = null
  }

  async password() {
    const credentials = this.ctx.get('credentials')
    if (!credentials) return null
    const record = await credentials.readRecord(CREDENTIAL_KEY)
    return record?.kind === 'api-key' ? record.key ?? null : record?.payload ?? null
  }

  async setPassword(value) {
    const credentials = this.ctx.get('credentials')
    if (!credentials) throw new Error('当前环境没有凭据服务，无法保存 WebDAV 密码')
    if (!value) {
      await credentials.deleteRecord(CREDENTIAL_KEY)
      return
    }
    await credentials.modifyRecord(CREDENTIAL_KEY, async () => ({ kind: 'api-key', key: String(value) }))
  }

  async passwordConfigured() {
    try {
      return Boolean(await this.password())
    } catch {
      return false
    }
  }

  async request(path, { method = 'GET', body, headers = {}, raw = false } = {}) {
    const settings = await this.settings()
    if (!settings.url) throw new Error('还没有填写 WebDAV 地址')
    const password = await this.password()
    const auth = settings.username || password
      ? `Basic ${Buffer.from(`${settings.username ?? ''}:${password ?? ''}`, 'utf8').toString('base64')}`
      : ''
    const url = `${normaliseRemote(settings)}${path ? `/${encodePath(path)}` : ''}`
    const response = await fetch(url, {
      method,
      body,
      headers: {
        ...(auth ? { authorization: auth } : {}),
        ...headers,
      },
      signal: AbortSignal.timeout(25000),
    })
    if (raw) return response
    return response
  }

  async propfind(path = '', depth = 0) {
    const body = '<?xml version="1.0"?><d:propfind xmlns:d="DAV:"><d:prop><d:getetag/><d:getlastmodified/><d:resourcetype/></d:prop></d:propfind>'
    return this.request(path, { method: 'PROPFIND', body, headers: { depth: String(depth), 'content-type': 'application/xml; charset=utf-8' } })
  }

  async ensureDir(path = '') {
    const response = await this.propfind(path, 0)
    if (response.ok || response.status === 207) return
    if (response.status !== 404) throw new Error(`WebDAV 目录检查失败：HTTP ${response.status}`)
    if (!path) {
      const created = await this.request('', { method: 'MKCOL' })
      if (!created.ok && created.status !== 201 && created.status !== 405) {
        throw new Error(`创建 WebDAV 目录失败：HTTP ${created.status}`)
      }
      return
    }
    const segments = String(path).split('/').filter(Boolean)
    let current = ''
    for (const segment of segments) {
      current = current ? `${current}/${segment}` : segment
      const check = await this.propfind(current, 0)
      if (check.ok || check.status === 207) continue
      const created = await this.request(current, { method: 'MKCOL' })
      if (!created.ok && created.status !== 201 && created.status !== 405) {
        throw new Error(`创建 WebDAV 目录失败：HTTP ${created.status}`)
      }
    }
  }

  async test() {
    const response = await this.propfind('', 0)
    if (response.ok || response.status === 207) return { ok: true, status: response.status }
    if (response.status === 404) {
      await this.ensureDir('')
      return { ok: true, status: 201, created: true }
    }
    if (response.status === 401 || response.status === 403) {
      return { ok: false, status: response.status, message: '用户名或密码不正确，或没有权限' }
    }
    return { ok: false, status: response.status, message: `服务器返回 HTTP ${response.status}` }
  }

  async getJson(path) {
    const response = await this.request(path, { method: 'GET' })
    if (response.status === 404) return null
    if (!response.ok) throw new Error(`读取远端 ${path} 失败：HTTP ${response.status}`)
    return response.json()
  }

  async putJson(path, value) {
    const body = Buffer.from(JSON.stringify(value), 'utf8')
    const dir = String(path).split('/').slice(0, -1).join('/')
    if (dir) await this.ensureDir(dir)
    const response = await this.request(path, {
      method: 'PUT',
      body,
      headers: { 'content-type': 'application/json; charset=utf-8', 'content-length': String(body.length) },
    })
    if (!response.ok) throw new Error(`上传 ${path} 失败：HTTP ${response.status}`)
  }

  async putFile(path, buffer, type = 'application/octet-stream') {
    const dir = String(path).split('/').slice(0, -1).join('/')
    if (dir) await this.ensureDir(dir)
    const response = await this.request(path, {
      method: 'PUT',
      body: buffer,
      headers: { 'content-type': type, 'content-length': String(buffer.length) },
    })
    if (!response.ok) throw new Error(`上传 ${path} 失败：HTTP ${response.status}`)
  }

  async collectLocalFiles() {
    const files = new Map()
    for (const name of ['state.json', 'history.json']) {
      const full = join(this.store.root, name)
      try {
        const buffer = await readFile(full)
        files.set(name, { full, buffer, hash: sha256(buffer), bytes: buffer.length })
      } catch (error) {
        if (error.code !== 'ENOENT') throw error
      }
    }
    const bookFiles = await walk(this.store.booksDir)
    for (const file of bookFiles) {
      const buffer = await readFile(file.full)
      files.set(`books/${file.path.replaceAll(sep, '/')}`, { full: file.full, buffer, hash: sha256(buffer), bytes: buffer.length })
    }
    return files
  }

  async downloadFile(path) {
    const response = await this.request(path, { method: 'GET' })
    if (response.status === 404) return null
    if (!response.ok) throw new Error(`下载 ${path} 失败：HTTP ${response.status}`)
    return Buffer.from(await response.arrayBuffer())
  }

  async sync() {
    if (this.lock) throw new Error('同步正在进行中')
    this.lock = true
    const result = { uploaded: 0, downloaded: 0, skipped: 0, at: nowIso(), errors: [] }
    try {
      const settings = await this.settings()
      if (!settings.url) throw new Error('还没有填写 WebDAV 地址')
      await this.ensureDir('')

      const remoteManifest = await this.getJson('manifest.json')
      if (!remoteManifest) {
        const localFiles = await this.collectLocalFiles()
        for (const [path, file] of localFiles) {
          await this.putFile(path, file.buffer, path.endsWith('.json') ? 'application/json; charset=utf-8' : 'application/octet-stream')
          result.uploaded += 1
        }
        await this.putJson('manifest.json', {
          schema: 1,
          deviceId: (await this.store.read()).deviceId,
          updatedAt: nowIso(),
          files: Object.fromEntries([...localFiles].map(([path, file]) => [path, { hash: file.hash, bytes: file.bytes }])),
        })
        await this.store.writeSync({ lastSyncAt: result.at, lastResult: result, remoteManifest: null })
        return result
      }

      const remoteState = await this.getJson('state.json')
      const remoteHistory = await this.getJson('history.json')
      if (remoteState) {
        const localState = await this.store.read()
        const merged = mergeState(localState, remoteState)
        await this.store.mutate((draft) => {
          draft.books = merged.books
          draft.vocab = merged.vocab
          draft.quizzes = merged.quizzes
        })
      }
      if (remoteHistory) {
        const localHistory = await this.store.readHistory()
        const merged = mergeHistory(localHistory, remoteHistory)
        await this.store.mutateHistory((draft) => {
          draft.sessions = merged.sessions
          draft.lookups = merged.lookups
          draft.quizAttempts = merged.quizAttempts
        })
      }

      const remoteFiles = remoteManifest.files && typeof remoteManifest.files === 'object' ? remoteManifest.files : {}
      const localFiles = await this.collectLocalFiles()

      for (const [path, meta] of Object.entries(remoteFiles)) {
        if (!path.startsWith('books/')) continue
        const local = localFiles.get(path)
        if (local && local.hash === meta.hash) {
          result.skipped += 1
          continue
        }
        const buffer = await this.downloadFile(path)
        if (!buffer) continue
        const full = join(this.store.root, path)
        await mkdir(dirname(full), { recursive: true })
        await writeFile(full, buffer)
        result.downloaded += 1
      }

      const freshLocal = await this.collectLocalFiles()
      for (const [path, file] of freshLocal) {
        const remote = remoteFiles[path]
        if (remote && remote.hash === file.hash) {
          result.skipped += 1
          continue
        }
        await this.putFile(path, file.buffer, path.endsWith('.json') ? 'application/json; charset=utf-8' : 'application/octet-stream')
        result.uploaded += 1
      }

      const finalLocal = await this.collectLocalFiles()
      await this.putJson('manifest.json', {
        schema: 1,
        deviceId: (await this.store.read()).deviceId,
        updatedAt: nowIso(),
        files: Object.fromEntries([...finalLocal].map(([path, file]) => [path, { hash: file.hash, bytes: file.bytes }])),
      })
      await this.store.writeSync({ lastSyncAt: result.at, lastResult: result, remoteManifest: null })
      return result
    } finally {
      this.lock = false
    }
  }
}

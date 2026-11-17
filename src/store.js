import { mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { dshHome, newId, nowIso } from './util.js'

const STATE_VERSION = 1
const HISTORY_VERSION = 1

function defaultSettings() {
  return {
    targetLanguage: 'zh-CN',
    theme: 'paper',
    fontSize: 18,
    lineHeight: 1.9,
    fontFamily: 'serif',
    maxWidth: 720,
    dailyNewWords: 10,
    dailyReviewLimit: 50,
    translationEngine: 'auto',
    showEnglishDefinition: true,
    autoSaveLookups: true,
    slackingMode: false,
    sync: {
      enabled: false,
      url: '',
      remoteDir: 'novel-reader',
      username: '',
      syncBooks: true,
      syncHistory: true,
      autoSync: 'off',
      conflict: 'newer',
    },
  }
}

function defaultState() {
  return {
    version: STATE_VERSION,
    deviceId: `dev_${newId('x').slice(2)}`,
    settings: defaultSettings(),
    books: [],
    vocab: [],
    quizzes: [],
  }
}

function defaultHistory() {
  return { version: HISTORY_VERSION, sessions: [], lookups: [], quizAttempts: [] }
}

function mergeDefaults(state) {
  const base = defaultState()
  const next = { ...base, ...state }
  next.settings = { ...base.settings, ...(state.settings ?? {}) }
  next.settings.sync = { ...base.settings.sync, ...(state.settings?.sync ?? {}) }
  next.books = Array.isArray(state.books) ? state.books : []
  next.vocab = Array.isArray(state.vocab) ? state.vocab : []
  next.quizzes = Array.isArray(state.quizzes) ? state.quizzes : []
  next.version = STATE_VERSION
  return next
}

export class Store {
  constructor(root = join(dshHome(), 'novel-reader')) {
    this.root = root
    this.booksDir = join(root, 'books')
    this.stateFile = join(root, 'state.json')
    this.historyFile = join(root, 'history.json')
    this.syncFile = join(root, 'sync.json')
    this.state = null
    this.stateMtime = 0
    this.history = null
    this.historyMtime = 0
    this.queue = Promise.resolve()
  }

  async init() {
    await mkdir(this.booksDir, { recursive: true })
    await this.run(async () => {
      await this.refreshState()
      await this.refreshHistory()
    })
  }

  run(task) {
    const next = this.queue.then(task, task)
    this.queue = next.catch(() => {})
    return next
  }

  async _mtime(file) {
    try {
      return (await stat(file)).mtimeMs
    } catch (error) {
      if (error.code === 'ENOENT') return 0
      throw error
    }
  }

  async _persist(file, value) {
    const tmp = `${file}.${process.pid}.${Date.now()}.tmp`
    await writeFile(tmp, JSON.stringify(value))
    await rename(tmp, file)
  }

  async refreshState() {
    const mtime = await this._mtime(this.stateFile)
    if (!mtime) {
      this.state = defaultState()
      await this._persist(this.stateFile, this.state)
      this.stateMtime = await this._mtime(this.stateFile)
      return
    }
    if (this.state && mtime === this.stateMtime) return
    const raw = await readFile(this.stateFile, 'utf8')
    this.state = mergeDefaults(JSON.parse(raw))
    this.stateMtime = mtime
  }

  async refreshHistory() {
    const mtime = await this._mtime(this.historyFile)
    if (!mtime) {
      this.history = defaultHistory()
      await this._persist(this.historyFile, this.history)
      this.historyMtime = await this._mtime(this.historyFile)
      return
    }
    if (this.history && mtime === this.historyMtime) return
    const raw = await readFile(this.historyFile, 'utf8')
    const parsed = JSON.parse(raw)
    this.history = {
      version: HISTORY_VERSION,
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      lookups: Array.isArray(parsed.lookups) ? parsed.lookups : [],
      quizAttempts: Array.isArray(parsed.quizAttempts) ? parsed.quizAttempts : [],
    }
    this.historyMtime = mtime
  }

  read() {
    return this.run(async () => {
      await this.refreshState()
      return this.state
    })
  }

  mutate(fn) {
    return this.run(async () => {
      await this.refreshState()
      const result = await fn(this.state)
      await this._persist(this.stateFile, this.state)
      this.stateMtime = await this._mtime(this.stateFile)
      return result
    })
  }

  readHistory() {
    return this.run(async () => {
      await this.refreshHistory()
      return this.history
    })
  }

  mutateHistory(fn) {
    return this.run(async () => {
      await this.refreshHistory()
      const result = await fn(this.history)
      await this._persist(this.historyFile, this.history)
      this.historyMtime = await this._mtime(this.historyFile)
      return result
    })
  }

  async readSync() {
    try {
      return JSON.parse(await readFile(this.syncFile, 'utf8'))
    } catch (error) {
      if (error.code === 'ENOENT') return { lastSyncAt: null, lastResult: null, remoteManifest: null }
      throw error
    }
  }

  async writeSync(value) {
    await mkdir(this.root, { recursive: true })
    await this._persist(this.syncFile, value)
  }

  bookDir(bookId) {
    return join(this.booksDir, bookId)
  }

  chapterFile(bookId, index) {
    return join(this.booksDir, bookId, 'chapters', `${String(index).padStart(4, '0')}.json`)
  }

  async readBookMeta(bookId) {
    try {
      return JSON.parse(await readFile(join(this.booksDir, bookId, 'meta.json'), 'utf8'))
    } catch (error) {
      if (error.code === 'ENOENT') return null
      throw error
    }
  }

  async readChapter(bookId, index) {
    try {
      return JSON.parse(await readFile(this.chapterFile(bookId, index), 'utf8'))
    } catch (error) {
      if (error.code === 'ENOENT') return null
      throw error
    }
  }

  async saveBook(meta, chapters) {
    const dir = this.bookDir(meta.id)
    await mkdir(join(dir, 'chapters'), { recursive: true })
    for (let i = 0; i < chapters.length; i += 1) {
      const chapter = chapters[i]
      const file = this.chapterFile(meta.id, i)
      await writeFile(
        file,
        JSON.stringify({
          index: i,
          title: chapter.title,
          wordCount: chapter.wordCount,
          html: chapter.html,
          text: chapter.text,
          htmlVersion: 2,
        }),
      )
    }
    const metaFile = { ...meta, chapters: chapters.map((chapter, index) => ({ index, title: chapter.title, wordCount: chapter.wordCount })) }
    await writeFile(join(dir, 'meta.json'), JSON.stringify(metaFile))
    return metaFile
  }

  async saveCover(bookId, buffer, ext) {
    const safeExt = ['jpg', 'jpeg', 'png', 'webp'].includes(String(ext).toLowerCase()) ? String(ext).toLowerCase() : 'jpg'
    const dir = this.bookDir(bookId)
    await mkdir(dir, { recursive: true })
    const file = join(dir, `cover.${safeExt}`)
    await writeFile(file, buffer)
    return `books/${bookId}/cover.${safeExt}`
  }

  async mutateState(fn) {
    return this.mutate(fn)
  }

  settings() {
    return this.state?.settings ?? defaultSettings()
  }

  touchBook(bookId) {
    return this.mutate((state) => {
      const book = state.books.find((row) => row.id === bookId)
      if (book) book.updatedAt = nowIso()
      return book
    })
  }
}

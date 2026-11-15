import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, extname, join, normalize } from 'node:path'
import JSZip from 'jszip'
import { computeStats, startSession, heartbeat, endSession, bumpLookup } from './history.js'
import { importBook } from './library.js'
import { lookupDictionary } from './dictionary.js'
import { finishQuiz, generateQuiz } from './quiz.js'
import { addVocab, deleteVocab, dueCount, filterVocab, reviewVocab, updateVocab } from './vocab.js'
import { recordLookup, translateText } from './translate.js'
import { cleanText, clamp, fail, nowIso, ok, readBuffer, readJson } from './util.js'

const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif' }

function publicSettings(settings, passwordConfigured, dataDir) {
  return {
    ...settings,
    sync: { ...settings.sync, passwordConfigured },
    dataDir,
  }
}

function pickSettings(patch) {
  const allowed = ['targetLanguage', 'theme', 'fontSize', 'lineHeight', 'fontFamily', 'maxWidth', 'dailyNewWords', 'dailyReviewLimit', 'translationEngine', 'showEnglishDefinition', 'autoSaveLookups']
  const next = {}
  for (const key of allowed) if (patch[key] !== undefined) next[key] = patch[key]
  return next
}

function pickSync(patch) {
  const allowed = ['enabled', 'url', 'remoteDir', 'username', 'syncBooks', 'syncHistory', 'autoSync', 'conflict']
  const next = {}
  for (const key of allowed) if (patch[key] !== undefined) next[key] = patch[key]
  return next
}

function bookTitleMap(state) {
  return new Map(state.books.map((book) => [book.id, book.title]))
}

async function serveCover(store, res, bookId) {
  const state = await store.read()
  const book = state.books.find((row) => row.id === bookId && !row.deletedAt)
  if (!book?.cover) return fail(res, 404, 'COVER_NOT_FOUND', '封面不存在')
  const full = join(store.root, book.cover)
  try {
    const buffer = await readFile(full)
    res.statusCode = 200
    res.setHeader('content-type', MIME[extname(full).toLowerCase()] ?? 'image/jpeg')
    res.setHeader('cache-control', 'private, max-age=3600')
    res.end(buffer)
  } catch {
    fail(res, 404, 'COVER_NOT_FOUND', '封面不存在')
  }
}

async function exportBackup(store, res) {
  const zip = new JSZip()
  for (const name of ['state.json', 'history.json', 'sync.json']) {
    try {
      zip.file(name, await readFile(join(store.root, name)))
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
  }
  const booksDir = join(store.root, 'books')
  async function addDir(dir, prefix) {
    let entries = []
    try {
      entries = await readdir(dir, { withFileTypes: true })
    } catch (error) {
      if (error.code === 'ENOENT') return
      throw error
    }
    for (const entry of entries) {
      const full = join(dir, entry.name)
      const rel = `${prefix}/${entry.name}`
      if (entry.isDirectory()) await addDir(full, rel)
      else zip.file(rel, await readFile(full))
    }
  }
  await addDir(booksDir, 'books')
  const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })
  const stamp = new Date().toISOString().slice(0, 10)
  res.statusCode = 200
  res.setHeader('content-type', 'application/zip')
  res.setHeader('content-disposition', `attachment; filename="novel-reader-${stamp}.zip"`)
  res.end(buffer)
}

function safeArchivePath(path) {
  const value = String(path).replaceAll('\\', '/')
  if (value.startsWith('/') || value.includes('../') || value.includes('..\\')) return null
  if (!/^(state\.json|history\.json|sync\.json|books\/[A-Za-z0-9_./-]+)$/.test(value)) return null
  return value
}

async function importBackup(store, buffer) {
  const zip = await JSZip.loadAsync(buffer)
  const entries = Object.values(zip.files).filter((entry) => !entry.dir)
  for (const entry of entries) {
    const path = safeArchivePath(entry.name)
    if (!path) continue
    const full = normalize(join(store.root, path))
    const root = normalize(store.root)
    if (!full.startsWith(root)) continue
    await mkdir(dirname(full), { recursive: true })
    await writeFile(full, await entry.async('nodebuffer'))
  }
  await store.init()
  return { imported: entries.length }
}

export function createRouter({ ctx, store, sync }) {
  const connection = () => ctx.get('connection')

  return async function route(req, res) {
    try {
      const checker = connection()
      if (typeof checker?.requestRejection !== 'function') return fail(res, 403, 'UNAUTHORIZED', '当前环境没有可用的鉴权服务')
      const rejection = checker.requestRejection({ headers: req.headers })
      if (rejection) return fail(res, rejection, 'UNAUTHORIZED', '未授权')

      const url = new URL(req.url || '/', 'http://localhost')
      const method = req.method || 'GET'

      if (pathnameStarts(url.pathname, '/novel-reader/books/')) {
        if ((method === 'GET' || method === 'HEAD') && url.pathname.endsWith('/cover')) {
          const bookId = url.pathname.slice('/novel-reader/books/'.length).replace(/\/cover$/, '')
          return serveCover(store, res, bookId)
        }
        return fail(res, 404, 'NOT_FOUND', '接口不存在')
      }

      if (!url.pathname.startsWith('/novel-reader/api/')) return fail(res, 404, 'NOT_FOUND', '接口不存在')
      const path = url.pathname.slice('/novel-reader/api/'.length).replace(/\/+$/, '')
      const segments = path.split('/').filter(Boolean)

      if (method === 'GET' && path === 'state') {
        const state = await store.read()
        const history = await store.readHistory()
        const syncStatus = await store.readSync()
        const passwordConfigured = await sync.passwordConfigured()
        return ok(res, {
          books: state.books.filter((book) => !book.deletedAt),
          vocabCount: state.vocab.filter((entry) => !entry.deletedAt).length,
          dueCount: dueCount(state.vocab),
          settings: publicSettings(state.settings, passwordConfigured, store.root),
          sync: syncStatus,
          stats: computeStats(history, 14),
          recentQuizzes: [...state.quizzes].slice(-6).reverse().map((quiz) => ({ id: quiz.id, createdAt: quiz.createdAt, count: quiz.count, engine: quiz.engine, score: quiz.score })),
        })
      }

      if (method === 'GET' && segments[0] === 'books' && segments[1] && segments.length === 2) {
        const state = await store.read()
        const book = state.books.find((row) => row.id === segments[1] && !row.deletedAt)
        if (!book) return fail(res, 404, 'BOOK_NOT_FOUND', '书籍不存在')
        const meta = await store.readBookMeta(book.id)
        const vocabCount = state.vocab.filter((entry) => !entry.deletedAt && (entry.contexts ?? []).some((context) => context.bookId === book.id)).length
        return ok(res, { book, chapters: meta?.chapters ?? [], vocabCount })
      }

      if (method === 'GET' && segments[0] === 'books' && segments[2] === 'chapters' && segments[3] !== undefined) {
        const index = Number(segments[3])
        if (!Number.isInteger(index) || index < 0) return fail(res, 400, 'INVALID_INPUT', '章节序号无效')
        const state = await store.read()
        const book = state.books.find((row) => row.id === segments[1] && !row.deletedAt)
        if (!book) return fail(res, 404, 'BOOK_NOT_FOUND', '书籍不存在')
        const chapter = await store.readChapter(book.id, index)
        if (!chapter) return fail(res, 404, 'CHAPTER_NOT_FOUND', '章节不存在')
        return ok(res, { book, chapter })
      }

      if (method === 'POST' && path === 'books/import') {
        const fileName = decodeURIComponent(String(req.headers['x-file-name'] ?? 'book.epub'))
        const buffer = await readBuffer(req, 200 * 1024 * 1024)
        const result = await importBook(store, buffer, fileName)
        return ok(res, result)
      }

      if (method === 'PATCH' && segments[0] === 'books' && segments[1]) {
        const patch = await readJson(req)
        const updated = await store.mutate((state) => {
          const book = state.books.find((row) => row.id === segments[1] && !row.deletedAt)
          if (!book) {
            const error = new Error('书籍不存在')
            error.status = 404
            error.code = 'BOOK_NOT_FOUND'
            throw error
          }
          if (patch.title !== undefined) book.title = cleanText(patch.title, 200)
          if (patch.author !== undefined) book.author = cleanText(patch.author, 120)
          if (patch.description !== undefined) book.description = cleanText(patch.description, 2000)
          if (Array.isArray(patch.tags)) book.tags = [...new Set(patch.tags.map((tag) => cleanText(tag, 40)).filter(Boolean))]
          book.updatedAt = nowIso()
          return book
        })
        return ok(res, { book: updated })
      }

      if (method === 'DELETE' && segments[0] === 'books' && segments[1]) {
        const book = await store.mutate((state) => {
          const row = state.books.find((item) => item.id === segments[1])
          if (row) {
            row.deletedAt = nowIso()
            row.updatedAt = row.deletedAt
          }
          return row
        })
        return ok(res, { book })
      }

      if (method === 'POST' && path === 'progress') {
        const body = await readJson(req)
        const book = await store.mutate((state) => {
          const row = state.books.find((item) => item.id === body.bookId && !item.deletedAt)
          if (!row) return null
          row.progress = {
            chapterIndex: clamp(Number(body.chapterIndex) || 0, 0, Math.max(0, row.chapterCount - 1)),
            paragraphIndex: Math.max(0, Number(body.paragraphIndex) || 0),
            charOffset: Math.max(0, Number(body.charOffset) || 0),
            scrollRatio: clamp(Number(body.scrollRatio) || 0, 0, 1),
            updatedAt: nowIso(),
          }
          row.updatedAt = nowIso()
          return row
        })
        return ok(res, { book })
      }

      if (method === 'GET' && path === 'dictionary') {
        const word = cleanText(url.searchParams.get('word') ?? '', 64)
        const result = await lookupDictionary(word)
        if (result.found) {
          const bookId = url.searchParams.get('bookId') || null
          const chapterIndexValue = Number(url.searchParams.get('chapterIndex'))
          const recorded = await recordLookup(store, {
            kind: 'word',
            text: result.word,
            translation: result.definitions?.[0]?.meaning ?? '',
            provider: 'uapis-dictionary',
            bookId,
            chapterIndex: Number.isInteger(chapterIndexValue) ? chapterIndexValue : null,
            chapterTitle: url.searchParams.get('chapterTitle') ?? '',
          })
          if (recorded && bookId) await bumpLookup(store, { bookId })
        }
        return ok(res, result)
      }

      if (method === 'POST' && path === 'translate') {
        const body = await readJson(req)
        const text = cleanText(body.text, 4000)
        if (!text) return fail(res, 400, 'INVALID_INPUT', '没有要翻译的文字')
        const state = await store.read()
        const targetLanguage = cleanText(body.targetLanguage ?? state.settings.targetLanguage ?? 'zh-CN', 20)
        const engine = cleanText(body.engine ?? state.settings.translationEngine ?? 'auto', 20)
        const kind = body.kind === 'sentence' || /\s/.test(text.trim()) ? 'sentence' : 'word'
        const translated = await translateText(ctx, { text, targetLanguage, engine })
        const result = { kind, text, translation: translated.translation, provider: translated.provider, phonetic: '', definitions: [], audio: '' }
        if (state.settings.autoSaveLookups !== false) {
          const recorded = await recordLookup(store, { ...result, bookId: body.bookId, chapterIndex: body.chapterIndex, chapterTitle: body.chapterTitle })
          if (recorded && body.bookId) await bumpLookup(store, { bookId: body.bookId })
        }
        return ok(res, result)
      }

      if (method === 'GET' && path === 'vocab') {
        const state = await store.read()
        const list = filterVocab(state.vocab, {
          q: url.searchParams.get('q') ?? '',
          status: url.searchParams.get('status') ?? '',
          bookId: url.searchParams.get('bookId') ?? '',
          due: url.searchParams.get('due') === '1' || url.searchParams.get('due') === 'true',
          tag: url.searchParams.get('tag') ?? '',
        })
        return ok(res, { vocab: list, total: list.length, dueCount: dueCount(state.vocab) })
      }

      if (method === 'POST' && path === 'vocab') {
        const body = await readJson(req)
        const result = await addVocab(store, body)
        return ok(res, result)
      }

      if (method === 'PATCH' && segments[0] === 'vocab' && segments[1]) {
        const patch = await readJson(req)
        const entry = await updateVocab(store, segments[1], patch)
        return ok(res, { entry })
      }

      if (method === 'DELETE' && segments[0] === 'vocab' && segments[1]) {
        const entry = await deleteVocab(store, segments[1])
        return ok(res, { entry })
      }

      if (method === 'POST' && segments[0] === 'vocab' && segments[2] === 'review') {
        const body = await readJson(req)
        const rating = ['again', 'hard', 'good', 'easy'].includes(body.rating) ? body.rating : 'good'
        const entry = await reviewVocab(store, segments[1], rating)
        return ok(res, { entry })
      }

      if (method === 'POST' && path === 'quiz/generate') {
        const body = await readJson(req)
        const quiz = await generateQuiz(ctx, store, body)
        return ok(res, { quiz })
      }

      if (method === 'GET' && segments[0] === 'quiz' && segments[1]) {
        const state = await store.read()
        const quiz = state.quizzes.find((row) => row.id === segments[1])
        if (!quiz) return fail(res, 404, 'QUIZ_NOT_FOUND', '练习不存在')
        return ok(res, { quiz })
      }

      if (method === 'POST' && segments[0] === 'quiz' && segments[2] === 'answer') {
        const body = await readJson(req)
        const state = await store.read()
        const quiz = state.quizzes.find((row) => row.id === segments[1])
        const question = quiz?.questions.find((row) => row.id === body.questionId)
        if (!question) return fail(res, 404, 'QUIZ_NOT_FOUND', '题目不存在')
        const correct = question.type === 'spelling'
          ? cleanText(body.text, 200).toLowerCase() === String(question.answerText).toLowerCase()
          : Number(body.choice) === question.answer
        return ok(res, { correct, answer: question.answer, answerText: question.answerText, explanation: question.explanation })
      }

      if (method === 'POST' && segments[0] === 'quiz' && segments[2] === 'finish') {
        const body = await readJson(req)
        const result = await finishQuiz(store, segments[1], body.answers)
        return ok(res, result)
      }

      if (method === 'GET' && path === 'history') {        const type = url.searchParams.get('type') ?? 'reading'
        const state = await store.read()
        const history = await store.readHistory()
        const titles = bookTitleMap(state)
        const from = url.searchParams.get('from')
        const to = url.searchParams.get('to')
        const bookId = url.searchParams.get('bookId')
        const inRange = (value) => (!from || value >= from) && (!to || value <= `${to}T23:59:59.999Z`)
        if (type === 'lookup') {
          const lookups = history.lookups
            .filter((row) => inRange(row.createdAt))
            .filter((row) => !bookId || row.bookId === bookId)
            .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
            .slice(0, 500)
            .map((row) => ({ ...row, bookTitle: titles.get(row.bookId) ?? '' }))
          return ok(res, { lookups })
        }
        if (type === 'quiz') {
          return ok(res, { attempts: [...history.quizAttempts].sort((a, b) => Date.parse(b.endedAt) - Date.parse(a.endedAt)).slice(0, 200) })
        }
        const sessions = history.sessions
          .filter((row) => inRange(row.startedAt))
          .filter((row) => !bookId || row.bookId === bookId)
          .sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt))
          .slice(0, 300)
          .map((row) => ({ ...row, bookTitle: titles.get(row.bookId) ?? '' }))
        return ok(res, { sessions })
      }

      if (method === 'DELETE' && path === 'history') {
        const type = url.searchParams.get('type') ?? 'all'
        const result = await store.mutateHistory((history) => {
          if (type === 'lookup') history.lookups = []
          else if (type === 'reading') history.sessions = []
          else if (type === 'quiz') history.quizAttempts = []
          else {
            history.lookups = []
            history.sessions = []
            history.quizAttempts = []
          }
          return { type }
        })
        return ok(res, result)
      }

      if (method === 'POST' && segments[0] === 'history' && segments[1] === 'session' && segments[2] === 'start') {
        const body = await readJson(req)
        const session = await startSession(store, { bookId: body.bookId, chapterIndex: body.chapterIndex })
        return ok(res, { session })
      }

      if (method === 'POST' && segments[0] === 'history' && segments[1] === 'session' && segments[2] === 'heartbeat') {
        const body = await readJson(req)
        const session = await heartbeat(store, body)
        return ok(res, { session })
      }

      if (method === 'POST' && segments[0] === 'history' && segments[1] === 'session' && segments[2] === 'end') {
        const body = await readJson(req)
        const session = await endSession(store, body)
        return ok(res, { session })
      }

      if (method === 'GET' && path === 'stats') {
        const state = await store.read()
        const history = await store.readHistory()
        return ok(res, {
          ...computeStats(history, 84),
          vocabCount: state.vocab.filter((entry) => !entry.deletedAt).length,
          dueCount: dueCount(state.vocab),
          mastered: state.vocab.filter((entry) => !entry.deletedAt && entry.status === 'mastered').length,
          books: state.books.filter((book) => !book.deletedAt).length,
        })
      }

      if (method === 'GET' && path === 'settings') {
        const state = await store.read()
        return ok(res, publicSettings(state.settings, await sync.passwordConfigured(), store.root))
      }

      if (method === 'PATCH' && path === 'settings') {
        const body = await readJson(req)
        const settingsPatch = pickSettings(body)
        const syncPatch = body.sync && typeof body.sync === 'object' ? pickSync(body.sync) : {}
        const updated = await store.mutate((state) => {
          Object.assign(state.settings, settingsPatch)
          if (Object.keys(syncPatch).length) Object.assign(state.settings.sync, syncPatch)
          return state.settings
        })
        if (body.syncPassword !== undefined) await sync.setPassword(body.syncPassword)
        if (body.clearPassword === true) await sync.setPassword(null)
        return ok(res, publicSettings(updated, await sync.passwordConfigured(), store.root))
      }

      if (method === 'POST' && path === 'sync/test') {
        const result = await sync.test()
        return ok(res, result)
      }

      if (method === 'POST' && path === 'sync/run') {
        const result = await sync.sync()
        return ok(res, result)
      }

      if (method === 'GET' && path === 'sync/status') {
        return ok(res, { ...(await store.readSync()), passwordConfigured: await sync.passwordConfigured() })
      }

      if (method === 'POST' && path === 'backup/export') return exportBackup(store, res)

      if (method === 'POST' && path === 'backup/import') {
        const buffer = await readBuffer(req, 300 * 1024 * 1024)
        const result = await importBackup(store, buffer)
        return ok(res, result)
      }

      return fail(res, 404, 'NOT_FOUND', '接口不存在')
    } catch (error) {
      if (res.headersSent) {
        res.end()
        return
      }
      const status = error.status && Number.isInteger(error.status) ? error.status : 500
      return fail(res, status, error.code ?? 'INTERNAL_ERROR', error.message ?? '服务器错误')
    }
  }
}

function pathnameStarts(pathname, prefix) {
  return pathname === prefix.slice(0, -1) || pathname.startsWith(prefix)
}

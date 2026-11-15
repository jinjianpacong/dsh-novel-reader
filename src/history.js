import { newId, nowIso } from './util.js'

const MAX_SESSIONS = 3000

export async function startSession(store, { bookId, chapterIndex = 0 }) {
  return store.mutateHistory((history) => {
    const now = nowIso()
    const recent = [...history.sessions].reverse().find((row) => row.bookId === bookId && !row.endedAt && Date.now() - Date.parse(row.startedAt) < 15000)
    if (recent) {
      recent.lastHeartbeatAt = now
      recent.endChapter = chapterIndex
      return recent
    }
    const session = {
      id: newId('rs'),
      bookId,
      startedAt: now,
      lastHeartbeatAt: now,
      endedAt: null,
      durationMs: 0,
      startChapter: chapterIndex,
      endChapter: chapterIndex,
      wordsRead: 0,
      lookups: 0,
    }
    history.sessions.push(session)
    if (history.sessions.length > MAX_SESSIONS) history.sessions = history.sessions.slice(-MAX_SESSIONS)
    return session
  })
}

export async function heartbeat(store, { sessionId, chapterIndex, wordsReadDelta = 0 }) {
  return store.mutateHistory((history) => {
    const session = history.sessions.find((row) => row.id === sessionId)
    if (!session || session.endedAt) return null
    session.lastHeartbeatAt = nowIso()
    if (Number.isInteger(chapterIndex)) session.endChapter = chapterIndex
    session.wordsRead = Math.max(0, (session.wordsRead ?? 0) + Number(wordsReadDelta || 0))
    return session
  })
}

export async function endSession(store, { sessionId }) {
  return store.mutateHistory((history) => {
    const session = history.sessions.find((row) => row.id === sessionId)
    if (!session || session.endedAt) return session ?? null
    const ended = Date.now()
    session.endedAt = new Date(ended).toISOString()
    session.durationMs = Math.min(8 * 3600 * 1000, Math.max(0, ended - Date.parse(session.startedAt)))
    return session
  })
}

export async function bumpLookup(store, { bookId }) {
  return store.mutateHistory((history) => {
    for (let i = history.sessions.length - 1; i >= 0; i -= 1) {
      const session = history.sessions[i]
      if (!session.endedAt && session.bookId === bookId) {
        session.lookups = (session.lookups ?? 0) + 1
        return session
      }
    }
    return null
  })
}

function localDay(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function computeStats(history, days = 84) {
  const byDay = new Map()
  for (const session of history.sessions) {
    const day = localDay(session.startedAt)
    if (!day) continue
    const duration = session.endedAt ? session.durationMs : Date.now() - Date.parse(session.startedAt)
    byDay.set(day, (byDay.get(day) ?? 0) + Math.min(duration, 8 * 3600 * 1000))
  }
  const today = new Date()
  const daily = []
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i)
    const key = localDay(date)
    daily.push({ day: key, minutes: Math.round((byDay.get(key) ?? 0) / 60000) })
  }
  const todayKey = localDay(today)
  const todayMinutes = daily.find((row) => row.day === todayKey)?.minutes ?? 0
  const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6)
  const weekMinutes = daily.filter((row) => new Date(`${row.day}T00:00:00`) >= weekStart).reduce((sum, row) => sum + row.minutes, 0)
  let streak = 0
  for (let i = 0; i < 365; i += 1) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i)
    const key = localDay(date)
    const minutes = byDay.get(key) ?? 0
    if (minutes > 0) streak += 1
    else if (i > 0) break
  }
  const totalDuration = history.sessions.reduce((sum, session) => sum + (session.durationMs || 0), 0)
  const quizScores = history.quizAttempts.map((attempt) => Number(attempt.score) || 0)
  return {
    totalSessions: history.sessions.length,
    totalMinutes: Math.round(totalDuration / 60000),
    todayMinutes,
    weekMinutes,
    streak,
    totalLookups: history.lookups.length,
    totalQuizzes: history.quizAttempts.length,
    averageScore: quizScores.length ? quizScores.reduce((sum, value) => sum + value, 0) / quizScores.length : null,
    daily,
  }
}

export async function recordQuizAttempt(store, attempt) {
  return store.mutateHistory((history) => {
    history.quizAttempts.push(attempt)
    if (history.quizAttempts.length > 1000) history.quizAttempts = history.quizAttempts.slice(-1000)
    return attempt
  })
}

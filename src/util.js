import { createHash, randomUUID } from 'node:crypto'
import { homedir } from 'node:os'
import { join } from 'node:path'

export function newId(prefix) {
  return `${prefix}_${randomUUID().replace(/-/g, '').slice(0, 16)}`
}

export function nowIso() {
  return new Date().toISOString()
}

export function dshHome() {
  return process.env.DSH_HOME || join(homedir(), '.dsh')
}

export function json(res, status, body) {
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  res.end(JSON.stringify(body))
}

export function ok(res, data) {
  json(res, 200, { ok: true, data })
}

export function fail(res, status, code, message) {
  json(res, status, { ok: false, error: { code, message } })
}

export async function readBuffer(req, limit) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > limit) {
      const error = new Error('文件太大')
      error.status = 413
      error.code = 'PAYLOAD_TOO_LARGE'
      throw error
    }
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

export async function readJson(req, limit = 4 * 1024 * 1024) {
  const buffer = await readBuffer(req, limit)
  if (!buffer.length) return {}
  try {
    return JSON.parse(buffer.toString('utf8'))
  } catch {
    const error = new Error('请求不是有效的 JSON')
    error.status = 400
    error.code = 'INVALID_JSON'
    throw error
  }
}

export function sha256(buffer) {
  return `sha256:${createHash('sha256').update(buffer).digest('hex')}`
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function cleanText(value, max = 4000) {
  return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max)
}

export function safeFileName(name, fallback = 'book') {
  const base = String(name ?? '').split(/[\\/]/).pop() ?? ''
  const cleaned = base.replace(/[<>:"/\\|?*\u0000-\u001f]/g, ' ').replace(/\s+/g, ' ').trim()
  return (cleaned || fallback).slice(0, 180)
}

export function extOf(name) {
  const match = /\.([a-z0-9]+)$/i.exec(String(name ?? ''))
  return match ? match[1].toLowerCase() : ''
}

export function sortByUpdated(list) {
  return [...list].sort((a, b) => Date.parse(b.updatedAt || 0) - Date.parse(a.updatedAt || 0))
}

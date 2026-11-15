import React from 'react'

export const API = '/novel-reader/api'

export async function api(path, options = {}) {
  const headers = { ...(options.headers ?? {}) }
  let body = options.body
  if (body !== undefined && typeof body !== 'string' && !(body instanceof Blob) && !(body instanceof ArrayBuffer)) {
    headers['content-type'] = 'application/json'
    body = JSON.stringify(body)
  }
  const response = await fetch(`${API}${path}`, { ...options, headers, body })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok || payload.ok === false) {
    const message = payload?.error?.message ?? `请求失败（HTTP ${response.status}）`
    const error = new Error(message)
    error.code = payload?.error?.code
    throw error
  }
  return payload.data
}

export function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export function formatDay(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

export function formatMinutes(minutes) {
  const value = Math.max(0, Math.round(Number(minutes) || 0))
  if (value < 60) return `${value} 分钟`
  const hours = Math.floor(value / 60)
  const rest = value % 60
  return rest ? `${hours} 小时 ${rest} 分钟` : `${hours} 小时`
}

export function formatDuration(ms) {
  return formatMinutes((Number(ms) || 0) / 60000)
}

export function relativeTime(value) {
  if (!value) return '从未'
  const delta = Date.now() - Date.parse(value)
  if (!Number.isFinite(delta)) return ''
  if (delta < 60000) return '刚刚'
  if (delta < 3600000) return `${Math.floor(delta / 60000)} 分钟前`
  if (delta < 86400000) return `${Math.floor(delta / 3600000)} 小时前`
  if (delta < 7 * 86400000) return `${Math.floor(delta / 86400000)} 天前`
  return formatDate(value)
}

export function percent(book) {
  const total = Number(book?.chapterCount) || 0
  const index = Number(book?.progress?.chapterIndex) || 0
  if (!total) return 0
  return Math.max(0, Math.min(100, Math.round(((index + (book?.progress?.scrollRatio ?? 0)) / total) * 100)))
}

const ICONS = {
  book: 'M3 5.5c3-1 6-.5 9 1.5v13c-3-2-6-2.5-9-1.5v-13Zm18 0c-3-1-6-.5-9 1.5v13c3-2 6-2.5 9-1.5v-13Z',
  search: 'M10.8 4a6.8 6.8 0 1 0 4.2 12.1l4.4 4.4 1.4-1.4-4.4-4.4A6.8 6.8 0 0 0 10.8 4Zm0 2a4.8 4.8 0 1 1 0 9.6 4.8 4.8 0 0 1 0-9.6Z',
  plus: 'M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7V4Z',
  left: 'M14.7 5.3 8 12l6.7 6.7 1.4-1.4L10.8 12l5.3-5.3-1.4-1.4Z',
  right: 'M9.3 5.3 16 12l-6.7 6.7-1.4-1.4L13.2 12 7.9 6.7l1.4-1.4Z',
  close: 'm6.4 5 5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4 6.4 5Z',
  more: 'M5 10.2a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6Zm7 0a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6Zm7 0a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6Z',
  trash: 'M8 4h8l1 2h4v2H3V6h4l1-2Zm1 6h2v8H9v-8Zm4 0h2v8h-2v-8ZM5 8h14l-1 12H6L5 8Z',
  edit: 'M15.7 3.3 20.7 8.3 8.6 20.4 3 21l.6-5.6L15.7 3.3Zm0 2.8L6 15.8l-.2 1.8 1.8-.2 9.7-9.7-1.6-1.6Z',
  download: 'M11 3h2v9l3.5-3.5 1.4 1.4L12 16l-5.9-6.1 1.4-1.4L11 12V3ZM4 18h16v2H4v-2Z',
  upload: 'M11 21h2v-9l3.5 3.5 1.4-1.4L12 8l-5.9 6.1 1.4 1.4L11 12v9ZM4 3h16v2H4V3Z',
  cloud: 'M7 18a4 4 0 0 1-.7-7.9A5.5 5.5 0 0 1 17 8.6 3.8 3.8 0 0 1 17.5 16H17v2H7Z',
  check: 'm5 12.5 4 4L19 6.7 17.6 5.3 9 13.9l-2.6-2.6L5 12.5Z',
  refresh: 'M12 4a8 8 0 0 1 7.5 5.2l1.5-2.2v6h-6l2.2-1.5A6 6 0 0 0 6.2 14H4.1A8 8 0 0 1 12 4Zm0 16a8 8 0 0 1-7.5-5.2L3 17v-6h6l-2.2 1.5A6 6 0 0 0 17.8 10h2.1A8 8 0 0 1 12 20Z',
  volume: 'M4 9h4l5-4v14l-5-4H4V9Zm11.5-1.6a6 6 0 0 1 0 9.2l-1.3-1.5a4 4 0 0 0 0-6.2l1.3-1.5Z',
  spark: 'm12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Zm7 12 .9 2.1 2.1.9-2.1.9L19 21l-.9-2.1-2.1-.9 2.1-.9L19 15Z',
  settings: 'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm9 3.5-.1 1.2 2 1.6-2 3.4-2.4-.9c-.6.5-1.3.9-2 1.2l-.4 2.5h-4l-.4-2.5c-.7-.3-1.4-.7-2-1.2l-2.4.9-2-3.4 2-1.6L7.2 12l.1-1.2-2-1.6 2-3.4 2.4.9c.6-.5 1.3-.9 2-1.2L12 3h4l.4 2.5c.7.3 1.4.7 2 1.2l2.4-.9 2 3.4-2 1.6.1 1.2Z',
  arrowLeft: 'M11 5 4 12l7 7 1.4-1.4L7.8 13H20v-2H7.8l4.6-4.6L11 5Z',
}

export function Icon({ name, size = 16, style }) {
  const path = ICONS[name] ?? ICONS.book
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={style}>
      <path d={path} />
    </svg>
  )
}

export function Button({ children, variant = '', size = '', onClick, disabled, title, type = 'button', className = '' }) {
  return (
    <button
      type={type}
      className={`nr-btn ${variant ? `is-${variant}` : ''} ${size ? `is-${size}` : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  )
}

export function Field({ label, hint, children }) {
  return (
    <label className="nr-field">
      <span>{label}</span>
      {children}
      {hint ? <small>{hint}</small> : null}
    </label>
  )
}

export function Toggle({ checked, onChange, label, disabled = false }) {
  return (
    <button type="button" role="switch" aria-checked={checked} className={`nr-switch ${checked ? 'is-on' : ''}`} onClick={() => onChange(!checked)} disabled={disabled}>
      <span className="nr-switch-track"><i /></span>
      <span>{label}</span>
    </button>
  )
}

export function Modal({ title, onClose, children, width = 460 }) {
  return (
    <div className="nr-overlay" style={{ justifyContent: 'center', alignItems: 'center' }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <div className="nr-card" style={{ width: `min(${width}px, 94vw)`, maxHeight: '86vh', overflowY: 'auto', margin: 0 }} role="dialog" aria-modal="true">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
          <h3 className="nr-drawer-title">{title}</h3>
          <button type="button" className="nr-x" onClick={onClose} aria-label="关闭"><Icon name="close" size={13} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Drawer({ title, onClose, children }) {
  return (
    <div className="nr-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <aside className="nr-drawer" role="dialog" aria-modal="true">
        <div className="nr-drawer-head">
          <h3 className="nr-drawer-title">{title}</h3>
          <button type="button" className="nr-x" onClick={onClose} aria-label="关闭"><Icon name="close" size={13} /></button>
        </div>
        <div className="nr-drawer-body">{children}</div>
      </aside>
    </div>
  )
}

export function Toast({ toast }) {
  if (!toast) return null
  return <div className={`nr-toast ${toast.error ? 'is-error' : ''}`}>{toast.text}</div>
}

export function StatusChip({ status }) {
  const map = { new: '新词', learning: '学习中', review: '复习中', mastered: '已掌握' }
  return <span className={`nr-chip is-${status ?? 'new'}`}>{map[status] ?? '新词'}</span>
}

export function Empty({ title, children, action }) {
  return (
    <div className="nr-empty">
      <h3>{title}</h3>
      {children ? <p>{children}</p> : null}
      {action}
    </div>
  )
}

export function Spinner({ text = '加载中…' }) {
  return <div className="nr-loading">{text}</div>
}

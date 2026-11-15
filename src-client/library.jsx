import React, { useEffect, useRef, useState } from 'react'
import { Button, Drawer, Empty, Field, Icon, Modal, percent, relativeTime } from './ui.jsx'

function BookCover({ book, className = 'nr-cover' }) {
  return (
    <div className={className}>
      {book.cover
        ? <img src={`/novel-reader/${book.cover}`} alt="" loading="lazy" />
        : <div className="nr-cover-fallback">{book.title?.slice(0, 60) || 'Untitled'}</div>}
    </div>
  )
}

function BookCard({ book, onOpen, onDetail }) {
  return (
    <div className="nr-book-cell">
      <button type="button" className="nr-book-card" onClick={() => onOpen(book, book.progress?.chapterIndex ?? 0)}>
        <BookCover book={book} />
        <div className="nr-book-title">{book.title}</div>
        <div className="nr-book-meta">{book.author || '未知作者'} · {percent(book)}%</div>
        <div className="nr-progress"><i style={{ width: `${percent(book)}%` }} /></div>
      </button>
      <button
        type="button"
        className="nr-book-more"
        title="书籍详情"
        aria-label={`查看《${book.title}》的详情`}
        onClick={(event) => { event.stopPropagation(); onDetail(book) }}
      >
        <Icon name="more" size={15} />
      </button>
    </div>
  )
}

function BookDrawer({ bookId, onClose, onRead, onRefresh, notify }) {
  const [detail, setDetail] = useState(null)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ title: '', author: '', description: '', tags: '' })
  const [busy, setBusy] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    let alive = true
    fetch(`/novel-reader/api/books/${bookId}`, { headers: { accept: 'application/json' } })
      .then((response) => response.json())
      .then((payload) => {
        if (!alive || !payload?.ok) return
        setDetail(payload.data)
        setForm({
          title: payload.data.book.title ?? '',
          author: payload.data.book.author ?? '',
          description: payload.data.book.description ?? '',
          tags: (payload.data.book.tags ?? []).join(', '),
        })
      })
      .catch(() => { if (alive) { setError('读取书籍详情失败'); notify('读取书籍详情失败', true) } })
    return () => { alive = false }
  }, [bookId])

  const save = async () => {
    setBusy(true)
    try {
      await fetch(`/novel-reader/api/books/${bookId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          author: form.author,
          description: form.description,
          tags: form.tags.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean),
        }),
      }).then(async (response) => {
        const payload = await response.json()
        if (!response.ok || !payload.ok) throw new Error(payload?.error?.message ?? '保存失败')
      })
      notify('书籍信息已保存')
      setEditing(false)
      await onRefresh()
      const response = await fetch(`/novel-reader/api/books/${bookId}`).then((r) => r.json())
      if (response?.ok) setDetail(response.data)
    } catch (error) {
      notify(error.message, true)
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    setBusy(true)
    try {
      const response = await fetch(`/novel-reader/api/books/${bookId}`, { method: 'DELETE' }).then((r) => r.json())
      if (!response?.ok) throw new Error(response?.error?.message ?? '删除失败')
      notify('书籍已移出书架')
      onClose()
      await onRefresh()
    } catch (error) {
      notify(error.message, true)
    } finally {
      setBusy(false)
      setConfirmDelete(false)
    }
  }

  const book = detail?.book
  return (
    <Drawer title={book?.title ?? '书籍详情'} onClose={onClose}>
      {!book ? (
        error
          ? <div className="nr-empty" style={{ margin: '24px 0' }}><h3>详情没加载出来</h3><p>{error}</p><Button onClick={() => window.location.reload()}>重新加载页面</Button></div>
          : <div className="nr-loading">加载中…</div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 16, marginBottom: 18 }}>
            <div style={{ width: 112, flex: 'none' }}><BookCover book={book} className="nr-cover" /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="nr-book-title" style={{ fontSize: 16, lineHeight: '23px' }}>{book.title}</div>
              <div className="nr-book-meta" style={{ marginTop: 4 }}>{book.author || '未知作者'}</div>
              <div className="nr-book-meta" style={{ marginTop: 8 }}>{book.chapterCount} 章 · {Number(book.wordCount).toLocaleString()} 词 · {book.format?.toUpperCase()}</div>
              <div className="nr-book-meta" style={{ marginTop: 4 }}>加入于 {relativeTime(book.addedAt)}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <Button variant="primary" onClick={() => onRead(book)}>开始阅读</Button>
                <Button onClick={() => setEditing((value) => !value)}>{editing ? '取消编辑' : '编辑信息'}</Button>
              </div>
            </div>
          </div>

          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
              <Field label="书名"><input className="nr-input" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></Field>
              <Field label="作者"><input className="nr-input" value={form.author} onChange={(event) => setForm({ ...form, author: event.target.value })} /></Field>
              <Field label="标签" hint="用逗号分隔"><input className="nr-input" value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} /></Field>
              <Field label="简介"><textarea className="nr-textarea" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></Field>
              <div className="nr-row"><Button variant="primary" onClick={save} disabled={busy}>保存</Button></div>
            </div>
          ) : null}

          <div className="nr-section">
            <h3>阅读数据</h3>
            <div className="nr-stat-row" style={{ marginBottom: 0, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
              <div className="nr-stat"><div className="nr-stat-value">{Number(book.wordCount).toLocaleString()}</div><div className="nr-stat-label">总词数</div></div>
              <div className="nr-stat"><div className="nr-stat-value">{book.chapterCount}</div><div className="nr-stat-label">章节</div></div>
              <div className="nr-stat"><div className="nr-stat-value">{percent(book)}%</div><div className="nr-stat-label">已读进度</div></div>
              <div className="nr-stat"><div className="nr-stat-value">{Math.round((Number(book.wordCount) || 0) / 220)}</div><div className="nr-stat-label">预计分钟</div></div>
              <div className="nr-stat"><div className="nr-stat-value">{detail.vocabCount ?? 0}</div><div className="nr-stat-label">本书生词</div></div>
              <div className="nr-stat"><div className="nr-stat-value">{((detail.vocabCount ?? 0) / Math.max(1, Number(book.wordCount) || 1) * 1000).toFixed(1)}</div><div className="nr-stat-label">每千词生词</div></div>
            </div>
          </div>

          <div className="nr-section">
            <h3>章节目录</h3>
            <div style={{ maxHeight: 280, overflowY: 'auto' }}>
              {(detail.chapters ?? []).map((chapter) => (
                <button
                  key={chapter.index}
                  type="button"
                  className="nr-vocab-row"
                  onClick={() => onRead(book, chapter.index)}
                >
                  <span className="nr-vocab-word" style={{ minWidth: 34, fontWeight: 500 }}>{chapter.index + 1}</span>
                  <span className="nr-vocab-trans" style={{ color: 'var(--dsw-alias-label-primary)' }}>{chapter.title}</span>
                  <span className="nr-vocab-source">{chapter.wordCount} 词</span>
                </button>
              ))}
            </div>
          </div>

          <div className="nr-section">
            <div className="nr-row">
              <Button variant="danger" size="small" onClick={() => setConfirmDelete(true)} disabled={busy}><Icon name="trash" size={13} /> 移除这本书</Button>
            </div>
          </div>
        </>
      )}
      {confirmDelete ? (
        <Modal title="移除书籍" onClose={() => setConfirmDelete(false)}>
          <p style={{ fontSize: 13, lineHeight: '21px' }}>书籍会从书架隐藏，但本地文件仍保留，下次同步时会把删除标记同步到其他设备。确定吗？</p>
          <div className="nr-row" style={{ justifyContent: 'flex-end', marginTop: 16 }}>
            <Button onClick={() => setConfirmDelete(false)}>取消</Button>
            <Button variant="danger" onClick={remove} disabled={busy}>移除</Button>
          </div>
        </Modal>
      ) : null}
    </Drawer>
  )
}

export default function LibraryView({ books, onOpen, onRefresh, notify }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [dragging, setDragging] = useState(false)
  const [importing, setImporting] = useState(false)
  const [detailId, setDetailId] = useState(null)
  const inputRef = useRef(null)

  const filtered = books
    .filter((book) => !query || `${book.title} ${book.author}`.toLowerCase().includes(query.toLowerCase()))
    .filter((book) => {
      if (filter === 'reading') return book.progress && percent(book) > 0 && percent(book) < 100
      if (filter === 'finished') return percent(book) >= 100
      if (filter === 'unread') return !book.progress || percent(book) === 0
      return true
    })
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))

  const continueBook = [...books]
    .filter((book) => book.progress && percent(book) > 0 && percent(book) < 100)
    .sort((a, b) => Date.parse(b.progress.updatedAt) - Date.parse(a.progress.updatedAt))[0]

  const importFiles = async (fileList) => {
    const files = [...(fileList ?? [])]
    if (!files.length) return
    setImporting(true)
    let imported = 0
    for (const file of files) {
      try {
        const response = await fetch('/novel-reader/api/books/import', {
          method: 'POST',
          headers: {
            'x-file-name': encodeURIComponent(file.name),
            'x-file-type': file.type || 'application/octet-stream',
          },
          body: file,
        })
        const payload = await response.json().catch(() => ({}))
        if (!response.ok || !payload.ok) throw new Error(payload?.error?.message ?? '导入失败')
        imported += 1
        if (payload.data?.duplicate) notify(`《${payload.data.book.title}》已经在书架里了`)
        else notify(`已导入《${payload.data.book.title}》`)
      } catch (error) {
        notify(`${file.name}：${error.message}`, true)
      }
    }
    setImporting(false)
    if (imported) await onRefresh()
  }

  return (
    <div className="nr-page" onDragOver={(event) => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); importFiles(event.dataTransfer.files) }}>
      <div className="nr-page-head">
        <div>
          <h1 className="nr-title">我的书架</h1>
          <p className="nr-sub">共 {books.length} 本 · 支持 EPUB / TXT / Markdown</p>
        </div>
        <div className="nr-head-actions">
          <input ref={inputRef} type="file" accept=".epub,.txt,.md,.markdown" multiple style={{ display: 'none' }} onChange={(event) => { importFiles(event.target.files); event.target.value = '' }} />
          <Button variant="primary" onClick={() => inputRef.current?.click()} disabled={importing}>
            <Icon name="plus" size={14} /> {importing ? '导入中…' : '导入图书'}
          </Button>
        </div>
      </div>

      {continueBook ? (
        <div className="nr-continue">
          <BookCover book={continueBook} />
          <div className="nr-continue-body">
            <h2 className="nr-continue-title">{continueBook.title}</h2>
            <p className="nr-continue-meta">读到第 {(continueBook.progress.chapterIndex ?? 0) + 1} 章 · {percent(continueBook)}% · {continueBook.author || '未知作者'}</p>
            <div className="nr-progress" style={{ maxWidth: 360, marginBottom: 14 }}><i style={{ width: `${percent(continueBook)}%` }} /></div>
            <Button variant="primary" onClick={() => onOpen(continueBook, continueBook.progress?.chapterIndex ?? 0)}>继续阅读</Button>
          </div>
        </div>
      ) : null}

      <div className="nr-toolbar">
        <input className="nr-input" placeholder="搜索书名或作者" value={query} onChange={(event) => setQuery(event.target.value)} />
        <select className="nr-select" value={filter} onChange={(event) => setFilter(event.target.value)}>
          <option value="all">全部</option>
          <option value="reading">在读</option>
          <option value="unread">未开始</option>
          <option value="finished">已读完</option>
        </select>
        <span className="nr-sub" style={{ marginLeft: 'auto' }}>{filtered.length} 本</span>
      </div>

      {filtered.length ? (
        <div className={`nr-grid ${dragging ? 'nr-drop' : ''}`}>
          {filtered.map((book) => <BookCard key={book.id} book={book} onOpen={onOpen} onDetail={(row) => setDetailId(row.id)} />)}
        </div>
      ) : (
        <Empty
          title={books.length ? '没有匹配的书' : '书架还是空的'}
          action={<Button variant="primary" onClick={() => inputRef.current?.click()}><Icon name="plus" size={14} /> 选择文件导入</Button>}
        >
          {books.length ? '换个关键词或筛选条件试试。' : '把 EPUB / TXT / Markdown 拖进这个页面，或点击下面的按钮选择文件。'}
        </Empty>
      )}

      {detailId ? (
        <BookDrawer
          bookId={detailId}
          onClose={() => setDetailId(null)}
          onRead={(book, chapterIndex) => { setDetailId(null); onOpen(book, chapterIndex) }}
          onRefresh={onRefresh}
          notify={notify}
        />
      ) : null}
    </div>
  )
}

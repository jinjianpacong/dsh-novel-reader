import React, { useEffect, useState } from 'react'
import { Button, Drawer, Empty, Field, StatusChip, api, formatDate, relativeTime } from './ui.jsx'

function VocabDrawer({ entry, books, onClose, onRefresh, notify }) {
  const [notes, setNotes] = useState(entry.notes ?? '')
  const [tags, setTags] = useState((entry.tags ?? []).join(', '))
  const [busy, setBusy] = useState(false)
  const bookTitle = (id) => books.find((book) => book.id === id)?.title ?? '未知书籍'

  const patch = async (body, message) => {
    setBusy(true)
    try {
      await api(`/vocab/${entry.id}`, { method: 'PATCH', body })
      if (message) notify(message)
      await onRefresh()
    } catch (error) {
      notify(error.message, true)
    } finally {
      setBusy(false)
    }
  }

  const review = async (rating) => {
    setBusy(true)
    try {
      await api(`/vocab/${entry.id}/review`, { method: 'POST', body: { rating } })
      notify('复习记录已保存')
      await onRefresh()
      onClose()
    } catch (error) {
      notify(error.message, true)
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    setBusy(true)
    try {
      await api(`/vocab/${entry.id}`, { method: 'DELETE' })
      notify('已删除')
      await onRefresh()
      onClose()
    } catch (error) {
      notify(error.message, true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Drawer title={entry.term} onClose={onClose}>
      <div className="nr-row" style={{ marginBottom: 4 }}>
        <StatusChip status={entry.status} />
        {entry.phonetic ? <span className="nr-vocab-phonetic">{entry.phonetic}</span> : null}
        <span className="nr-sub" style={{ marginLeft: 'auto' }}>下次复习 {relativeTime(entry.srs?.dueAt)}</span>
      </div>
      <p style={{ fontSize: 16, lineHeight: '25px', margin: '10px 0 4px' }}>{entry.translations?.join('；') || '还没有释义'}</p>
      {entry.definitions?.length ? (
        <ul className="nr-pop-defs">
          {entry.definitions.map((row, index) => <li key={index}><b>{row.pos || 'def.'}</b> {row.text}</li>)}
        </ul>
      ) : null}

      <div className="nr-section">
        <h3>出现的上下文</h3>
        {(entry.contexts ?? []).length ? entry.contexts.map((context, index) => (
          <div className="nr-context" key={index}>
            <b>{bookTitle(context.bookId)}</b> · {context.chapterTitle || `第 ${(context.chapterIndex ?? 0) + 1} 章`}
            <div>{context.sentence}</div>
          </div>
        )) : <p className="nr-sub">还没有上下文。</p>}
      </div>

      <div className="nr-section">
        <h3>笔记与标签</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Field label="笔记"><textarea className="nr-textarea" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="记下这个词的用法、联想或易混淆点" /></Field>
          <Field label="标签" hint="用逗号分隔"><input className="nr-input" value={tags} onChange={(event) => setTags(event.target.value)} /></Field>
          <div className="nr-row">
            <Button variant="primary" size="small" disabled={busy} onClick={() => patch({ notes, tags: tags.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean) }, '笔记已保存')}>保存笔记</Button>
          </div>
        </div>
      </div>

      <div className="nr-section">
        <h3>复习打分</h3>
        <p>按你的实际记忆程度选择，系统会调整下次出现的时间。</p>
        <div className="nr-row">
          <Button size="small" variant="danger" disabled={busy} onClick={() => review('again')}>忘了</Button>
          <Button size="small" disabled={busy} onClick={() => review('hard')}>有点难</Button>
          <Button size="small" variant="primary" disabled={busy} onClick={() => review('good')}>记得</Button>
          <Button size="small" disabled={busy} onClick={() => review('easy')}>很简单</Button>
        </div>
      </div>

      <div className="nr-section">
        <div className="nr-row">
          <Button variant="danger" size="small" disabled={busy} onClick={remove}>删除这个词</Button>
        </div>
      </div>
    </Drawer>
  )
}

export default function VocabView({ state, notify, onRefresh, onPractice }) {
  const [list, setList] = useState([])
  const [total, setTotal] = useState(0)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [dueOnly, setDueOnly] = useState(false)
  const [bookId, setBookId] = useState('')
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (query.trim()) params.set('q', query.trim())
      if (status) params.set('status', status)
      if (dueOnly) params.set('due', '1')
      if (bookId) params.set('bookId', bookId)
      const data = await api(`/vocab?${params.toString()}`)
      setList(data.vocab ?? [])
      setTotal(data.total ?? 0)
    } catch (error) {
      notify(error.message, true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [query, status, dueOnly, bookId])

  const exportCsv = () => {
    const rows = [['单词', '音标', '释义', '状态', '来源', '添加时间']]
    for (const entry of list) {
      const source = entry.contexts?.[0]
      rows.push([
        entry.term,
        entry.phonetic ?? '',
        entry.translations?.join('；') ?? '',
        entry.status,
        source ? `${state.books.find((book) => book.id === source.bookId)?.title ?? ''} ${source.chapterTitle ?? ''}` : '',
        entry.createdAt,
      ])
    }
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n')
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'novel-reader-vocab.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const canPractice = (state.vocabCount ?? 0) >= 2
  return (
    <div className="nr-page">
      <div className="nr-page-head">
        <div>
          <h1 className="nr-title">生词本</h1>
          <p className="nr-sub">按词元去重，同一个词的多个上下文会合并在一起</p>
        </div>
        <div className="nr-head-actions">
          <Button onClick={exportCsv} disabled={!list.length}>导出 CSV</Button>
          <Button variant="primary" onClick={() => onPractice({ type: 'due' })} disabled={!canPractice}>
            {canPractice ? `开始复习 ${state.dueCount ? `(${state.dueCount})` : ''}` : '再收 1 个词就能练习'}
          </Button>
        </div>
      </div>

      <div className="nr-stat-row">
        <div className="nr-stat"><div className="nr-stat-value">{state.vocabCount ?? total}</div><div className="nr-stat-label">全部生词</div></div>
        <div className="nr-stat"><div className="nr-stat-value">{state.dueCount ?? 0}</div><div className="nr-stat-label">今日到期</div></div>
        <div className="nr-stat"><div className="nr-stat-value">{list.filter((entry) => entry.status === 'mastered').length}</div><div className="nr-stat-label">当前列表已掌握</div></div>
        <div className="nr-stat"><div className="nr-stat-value">{list.filter((entry) => Date.parse(entry.createdAt) > Date.now() - 7 * 86400000).length}</div><div className="nr-stat-label">近 7 天新增</div></div>
      </div>

      <div className="nr-toolbar">
        <input className="nr-input" placeholder="搜索单词或释义" value={query} onChange={(event) => setQuery(event.target.value)} />
        <select className="nr-select" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">全部状态</option>
          <option value="new">新词</option>
          <option value="learning">学习中</option>
          <option value="review">复习中</option>
          <option value="mastered">已掌握</option>
        </select>
        <select className="nr-select" value={bookId} onChange={(event) => setBookId(event.target.value)}>
          <option value="">全部书籍</option>
          {state.books.map((book) => <option key={book.id} value={book.id}>{book.title}</option>)}
        </select>
        <Button variant={dueOnly ? 'primary' : ''} size="small" onClick={() => setDueOnly((value) => !value)}>只看今日到期</Button>
        <span className="nr-sub" style={{ marginLeft: 'auto' }}>{loading ? '加载中…' : `${total} 个词`}</span>
      </div>

      {list.length ? (
        <div className="nr-vocab-list">
          <div className="nr-vocab-row is-head">
            <span className="nr-vocab-word">单词</span>
            <span className="nr-vocab-phonetic">音标</span>
            <span className="nr-vocab-trans">释义</span>
            <span className="nr-vocab-source">来源</span>
            <span className="nr-chip">状态</span>
          </div>
          {list.map((entry) => {
            const context = entry.contexts?.[0]
            const source = context ? state.books.find((book) => book.id === context.bookId) : null
            return (
              <button type="button" className="nr-vocab-row" key={entry.id} onClick={() => setSelected(entry)}>
                <span className="nr-vocab-word">{entry.term}</span>
                <span className="nr-vocab-phonetic">{entry.phonetic || ''}</span>
                <span className="nr-vocab-trans">{entry.translations?.join('；') || entry.definitions?.[0]?.text || ''}</span>
                <span className="nr-vocab-source">{source?.title ?? ''}</span>
                <StatusChip status={entry.status} />
              </button>
            )
          })}
        </div>
      ) : (
        <Empty title="还没有生词">
          在阅读器里双击单词或划选句子，就可以把词和原句一起收进来。
        </Empty>
      )}

      {selected ? (
        <VocabDrawer
          entry={selected}
          books={state.books}
          onClose={() => setSelected(null)}
          onRefresh={onRefresh}
          notify={notify}
        />
      ) : null}
    </div>
  )
}

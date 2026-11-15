import React, { useEffect, useState } from 'react'
import { Button, Empty, api, formatDate, formatDuration, formatMinutes } from './ui.jsx'

function Heatmap({ daily }) {
  const level = (minutes) => {
    if (!minutes) return 0
    if (minutes < 15) return 1
    if (minutes < 40) return 2
    if (minutes < 90) return 3
    return 4
  }
  return (
    <div>
      <div className="nr-heatmap">
        {(daily ?? []).map((row) => (
          <div key={row.day} className="nr-heat-cell" data-level={level(row.minutes)} title={`${row.day} · ${row.minutes} 分钟`} />
        ))}
      </div>
      <div className="nr-sub" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>最近 12 周</span>
        <span>少 → 多</span>
      </div>
    </div>
  )
}

export default function HistoryView({ notify }) {
  const [tab, setTab] = useState('reading')
  const [stats, setStats] = useState(null)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async (nextTab = tab) => {
    setLoading(true)
    try {
      if (!stats) setStats(await api('/stats'))
      const data = await api(`/history?type=${nextTab}`)
      setRows(nextTab === 'reading' ? data.sessions ?? [] : nextTab === 'lookup' ? data.lookups ?? [] : data.attempts ?? [])
    } catch (error) {
      notify(error.message, true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(tab) }, [tab])

  return (
    <div className="nr-page">
      <div className="nr-page-head">
        <div>
          <h1 className="nr-title">历史</h1>
          <p className="nr-sub">阅读、查词和练习都记在这里，只保存在本机</p>
        </div>
        <div className="nr-head-actions">
          <Button size="small" onClick={() => { setStats(null); load(tab) }}>刷新</Button>
        </div>
      </div>

      {stats ? (
        <>
          <div className="nr-stat-row">
            <div className="nr-stat"><div className="nr-stat-value">{formatMinutes(stats.todayMinutes)}</div><div className="nr-stat-label">今日阅读</div></div>
            <div className="nr-stat"><div className="nr-stat-value">{formatMinutes(stats.weekMinutes)}</div><div className="nr-stat-label">本周阅读</div></div>
            <div className="nr-stat"><div className="nr-stat-value">{stats.streak} 天</div><div className="nr-stat-label">连续阅读</div></div>
            <div className="nr-stat"><div className="nr-stat-value">{stats.totalLookups}</div><div className="nr-stat-label">累计查词</div></div>
            <div className="nr-stat"><div className="nr-stat-value">{stats.totalQuizzes}</div><div className="nr-stat-label">练习次数</div></div>
          </div>
          <div className="nr-card" style={{ marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 14 }}>阅读热力图</h3>
            <Heatmap daily={stats.daily} />
          </div>
        </>
      ) : null}

      <div className="nr-toolbar">
        {[['reading', '阅读记录'], ['lookup', '查词记录'], ['quiz', '练习记录']].map(([value, label]) => (
          <Button key={value} variant={tab === value ? 'primary' : ''} size="small" onClick={() => setTab(value)}>{label}</Button>
        ))}
        <span className="nr-sub" style={{ marginLeft: 'auto' }}>{loading ? '加载中…' : `${rows.length} 条`}</span>
      </div>

      <div className="nr-card">
        {!rows.length && !loading ? <Empty title="还没有记录">{tab === 'reading' ? '打开一本书开始阅读，这里就会出现记录。' : tab === 'lookup' ? '在阅读器里查词或翻译句子，这里就会出现记录。' : '做完一组练习，这里就会出现成绩。'}</Empty> : null}
        {tab === 'reading' && rows.map((row) => (
          <div className="nr-history-row" key={row.id}>
            <div className="nr-history-main">
              <div className="nr-history-title">{row.bookTitle || '已删除的书'}</div>
              <div className="nr-history-meta">{formatDate(row.startedAt)} · 第 {(row.startChapter ?? 0) + 1} 至 {(row.endChapter ?? row.startChapter ?? 0) + 1} 章 · {row.lookups ?? 0} 次查词</div>
            </div>
            <span>{formatDuration(row.durationMs)}</span>
          </div>
        ))}
        {tab === 'lookup' && rows.map((row) => (
          <div className="nr-history-row" key={row.id}>
            <div className="nr-history-main">
              <div className="nr-history-title">{row.text}</div>
              <div className="nr-history-meta">{row.translation} · {row.bookTitle || '未知书籍'} {row.chapterTitle ? `· ${row.chapterTitle}` : ''}</div>
            </div>
            <span className="nr-sub">{formatDate(row.createdAt)}</span>
          </div>
        ))}
        {tab === 'quiz' && rows.map((row) => (
          <div className="nr-history-row" key={row.id}>
            <div className="nr-history-main">
              <div className="nr-history-title">{Math.round((row.score ?? 0) * 100)} 分 · {row.answers?.length ?? 0} 题</div>
              <div className="nr-history-meta">{formatDate(row.endedAt)} · 答对 {row.answers?.filter((answer) => answer.correct).length ?? 0} 题</div>
            </div>
            <span className="nr-sub">{row.answers?.filter((answer) => !answer.correct).length ?? 0} 个错题</span>
          </div>
        ))}
      </div>
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import LibraryView from './library.jsx'
import ReaderView from './reader.jsx'
import VocabView from './vocab.jsx'
import PracticeView from './practice.jsx'
import HistoryView from './history.jsx'
import SettingsView from './settings.jsx'
import { CSS } from './styles.js'
import { Empty, Icon, Spinner, Toast, api, relativeTime } from './ui.jsx'

const NAV = [
  ['library', '书架'],
  ['vocabulary', '生词本'],
  ['practice', '练习'],
  ['history', '历史'],
  ['settings', '设置'],
]

function App() {
  const [state, setState] = useState(null)
  const [view, setView] = useState('library')
  const [reader, setReader] = useState(null)
  const [toast, setToast] = useState(null)
  const [practiceScope, setPracticeScope] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const timerRef = React.useRef(null)

  const notify = (text, error = false) => {
    clearTimeout(timerRef.current)
    setToast({ text, error, key: Date.now() })
    timerRef.current = setTimeout(() => setToast(null), 3200)
  }

  const refresh = async () => {
    try {
      const data = await api('/state')
      setState(data)
      setLoadError('')
    } catch (error) {
      setLoadError(error.message)
      notify(error.message, true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  const openReader = (book, chapterIndex) => {
    setReader({ bookId: book.id, chapterIndex: chapterIndex ?? book.progress?.chapterIndex ?? 0 })
  }

  if (reader) {
    return (
      <>
        <style>{CSS}</style>
        <div className="nr-app" style={{ paddingTop: 'calc(18px + var(--dsh-frame-top-clearance, 0px))' }}>
          <ReaderView
            bookId={reader.bookId}
            initialChapter={reader.chapterIndex}
            onBack={() => { setReader(null); refresh() }}
            onRefresh={refresh}
            notify={notify}
          />
        </div>
        <Toast toast={toast} />
      </>
    )
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="nr-app">
        <header className="nr-top">
          <div className="nr-brand">
            <svg width="22" height="22" viewBox="0 0 36 36" aria-hidden="true">
              <path d="M5.5 8.1c4.7-1.8 8.6-.9 12.5 2.1v17.9c-3.9-3-7.8-3.9-12.5-2.1V8.1Z" fill="#2F6F62" />
              <path d="M30.5 8.1c-4.7-1.8-8.6-.9-12.5 2.1v17.9c3.9-3 7.8-3.9 12.5-2.1V8.1Z" fill="#4E9C8B" />
              <path d="M18 10.8v17.1" stroke="#F7F3EA" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="nr-brand-name">Novel Reader</span>
          </div>
          <nav className="nr-nav" aria-label="Novel Reader">
            {NAV.map(([value, label]) => (
              <button key={value} type="button" className={view === value ? 'is-on' : ''} onClick={() => setView(value)}>{label}</button>
            ))}
          </nav>
          <div className="nr-sync">
            <span className={`nr-dot ${state?.settings?.sync?.enabled ? (state?.sync?.lastResult?.errors?.length ? 'is-bad' : '') : 'is-idle'}`} />
            {state?.settings?.sync?.enabled
              ? (state.sync?.lastSyncAt ? `已同步 ${relativeTime(state.sync.lastSyncAt)}` : '未同步')
              : '本机模式'}
          </div>
        </header>

        <main className="nr-content">
          {loading ? <Spinner /> : null}
          {!loading && !state ? (
            <div className="nr-page">
              <Empty title="数据没加载出来" action={<button type="button" className="nr-btn is-primary" onClick={refresh}>重试</button>}>
                {loadError || '请稍后再试。'}
              </Empty>
            </div>
          ) : null}
          {!loading && state && view === 'library' ? (
            <LibraryView books={state.books ?? []} onOpen={openReader} onRefresh={refresh} notify={notify} />
          ) : null}
          {!loading && state && view === 'vocabulary' ? (
            <VocabView state={state} notify={notify} onRefresh={refresh} onPractice={(scope) => { setPracticeScope(scope); setView('practice') }} />
          ) : null}
          {!loading && state && view === 'practice' ? (
            <PracticeView state={state} notify={notify} onRefresh={refresh} initialScope={practiceScope} />
          ) : null}
          {!loading && state && view === 'history' ? <HistoryView notify={notify} /> : null}
          {!loading && state && view === 'settings' ? <SettingsView state={state} notify={notify} onRefresh={refresh} /> : null}
        </main>
      </div>
      <Toast toast={toast} />
    </>
  )
}

function BookIcon(owner = {}) {
  const size = owner.size ?? 16
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" aria-hidden="true" style={{ display: 'block' }}>
      <path d="M5.5 8.1c4.7-1.8 8.6-.9 12.5 2.1v17.9c-3.9-3-7.8-3.9-12.5-2.1V8.1Z" fill="currentColor" opacity={owner.active ? 1 : 0.82} />
      <path d="M30.5 8.1c-4.7-1.8-8.6-.9-12.5 2.1v17.9c3.9-3 7.8-3.9 12.5-2.1V8.1Z" fill="currentColor" opacity={owner.active ? 0.72 : 0.5} />
      <path d="M18 10.8v17.1" stroke="var(--dsw-alias-bg-base, #fff)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M23.7 8.7v9.1l2.5-1.6 2.5 1.6V9.3" fill="#D9A441" />
    </svg>
  )
}

const NS = 'novel-reader'

const inject = ['slots', 'locale']

function apply(ctx) {
  ctx.effect(() => ctx.locale.register(NS, {
    zh: { nav: '阅读' },
    en: { nav: 'Reading' },
  }), 'novel-reader: locale')
  const t = ctx.locale.bind(NS)
  ctx.effect(() => ctx.slots.inject('main', () => ctx.slots.register({
    name: 'main',
    key: 'novel-reader',
    locale: NS,
  }, App)), 'novel-reader: main panel')
  ctx.effect(() => ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
    name: 'sidebar.panellist',
    id: 'novel-reader',
    order: 40,
    label: () => t('nav'),
    locale: NS,
  }, BookIcon)), 'novel-reader: sidebar entry')
}

export { App, apply, inject }

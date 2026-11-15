import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Button, Drawer, Icon, api } from './ui.jsx'

function sentenceAround(paragraph, selected) {
  const text = String(paragraph ?? '').replace(/\s+/g, ' ').trim()
  if (!text) return selected
  const at = Math.max(0, text.indexOf(selected))
  const before = text.slice(0, at)
  const startCandidates = [before.lastIndexOf('. '), before.lastIndexOf('! '), before.lastIndexOf('? '), before.lastIndexOf('.” '), before.lastIndexOf('." ')]
  const start = Math.max(...startCandidates.map((value) => value + 1), 0)
  const after = text.slice(at + selected.length)
  const ends = [after.indexOf('. '), after.indexOf('! '), after.indexOf('? ')].filter((value) => value >= 0)
  const end = ends.length ? at + selected.length + Math.min(...ends) + 1 : text.length
  const sentence = text.slice(start, end).trim()
  return sentence.length <= 600 ? sentence : text.slice(0, 600)
}

function wordAtPoint(x, y) {
  let range = null
  if (document.caretRangeFromPoint) range = document.caretRangeFromPoint(x, y)
  else if (document.caretPositionFromPoint) {
    const position = document.caretPositionFromPoint(x, y)
    if (position?.offsetNode) {
      range = document.createRange()
      range.setStart(position.offsetNode, position.offset)
      range.collapse(true)
    }
  }
  if (!range || !document.querySelector('.nr-reading')?.contains(range.startContainer)) return null
  const node = range.startContainer
  if (!node || node.nodeType !== 3) return null
  const data = node.data
  const isWordChar = (character) => /[A-Za-z'-]/.test(character)
  let start = range.startOffset
  let end = range.startOffset
  while (start > 0 && isWordChar(data[start - 1])) start -= 1
  while (end < data.length && isWordChar(data[end])) end += 1
  if (end <= start) return null
  const text = data.slice(start, end)
  const wordRange = document.createRange()
  wordRange.setStart(node, start)
  wordRange.setEnd(node, end)
  const selection = window.getSelection()
  selection.removeAllRanges()
  selection.addRange(wordRange)
  const rect = wordRange.getBoundingClientRect()
  const paragraph = node.parentElement?.closest?.('p')
  return {
    text,
    kind: 'word',
    sentence: paragraph ? sentenceAround(paragraph.innerText, text) : text,
    rect: { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right },
  }
}

function SelectionMenu({ menu, selection, saving, onClose, onDictionary, onTranslate, onSave, onCopy }) {
  const ref = useRef(null)
  useEffect(() => {
    const closeOnOutside = (event) => { if (!ref.current?.contains(event.target)) onClose() }
    const closeOnEscape = (event) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('mousedown', closeOnOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [onClose])
  const isSentence = selection.kind === 'sentence'
  const left = Math.min(menu.x, window.innerWidth - 220)
  const top = Math.min(menu.y, window.innerHeight - 190)
  return (
    <div className="nr-context-menu" ref={ref} style={{ left, top }} onMouseDown={(event) => event.stopPropagation()}>
      <div className="nr-menu-label">{selection.text.length > 42 ? `${selection.text.slice(0, 42)}…` : selection.text}</div>
      {isSentence ? (
        <>
          <button type="button" onClick={onTranslate}>翻译整句</button>
          <button type="button" onClick={onSave} disabled={saving}>{saving ? '保存中…' : '收藏这个句子'}</button>
        </>
      ) : (
        <>
          <button type="button" onClick={onDictionary}>查词典</button>
          <button type="button" onClick={onTranslate}>翻译这个词</button>
          <button type="button" onClick={onSave} disabled={saving}>{saving ? '保存中…' : '加入生词本'}</button>
        </>
      )}
      <button type="button" onClick={onCopy}>复制</button>
    </div>
  )
}

function DictionaryPopover({ selection, book, chapterIndex, chapterTitle, onClose, notify }) {
  const [loading, setLoading] = useState(true)
  const [entry, setEntry] = useState(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError('')
    setEntry(null)
    setSaved(false)
    const query = new URLSearchParams({
      word: selection.text,
      bookId: book.id,
      chapterIndex: String(chapterIndex),
      chapterTitle,
    })
    api(`/dictionary?${query.toString()}`).then((data) => {
      if (alive) { setEntry(data); setLoading(false) }
    }).catch((err) => {
      if (alive) { setError(err.message); setLoading(false) }
    })
    return () => { alive = false }
  }, [selection.text, book.id, chapterIndex, chapterTitle])

  const play = (audio) => {
    if (!audio) return
    try { new Audio(audio).play().catch(() => notify('发音播放失败', true)) } catch { notify('发音播放失败', true) }
  }

  const save = async () => {
    if (!entry?.found) return
    setSaving(true)
    try {
      const definitions = entry.definitions.map((row) => ({
        pos: row.pos,
        text: row.meaning,
        example: entry.englishDefinitions?.[0]?.examples?.[0] ?? '',
      }))
      await api('/vocab', {
        method: 'POST',
        body: {
          term: entry.word,
          kind: 'word',
          translations: entry.definitions.map((row) => row.meaning).slice(0, 3),
          definitions,
          phonetic: entry.phonetics?.uk?.text || entry.phonetics?.us?.text || '',
          context: {
            bookId: book.id,
            chapterIndex,
            chapterTitle,
            sentence: selection.sentence || selection.text,
          },
        },
      })
      setSaved(true)
      notify('已加入生词本')
    } catch (err) {
      notify(err.message, true)
    } finally {
      setSaving(false)
    }
  }

  const width = 390
  const left = Math.min(Math.max(12, selection.rect.left), window.innerWidth - width - 12)
  const top = Math.min(Math.max(12, selection.rect.bottom + 8), Math.max(12, window.innerHeight - 520))
  const uk = entry?.phonetics?.uk
  const us = entry?.phonetics?.us

  return (
    <div className="nr-popover nr-dictionary" style={{ left, top, width }} onMouseDown={(event) => event.stopPropagation()}>
      <div className="nr-pop-head">
        <div>
          <div className="nr-pop-word">{entry?.word ?? selection.text}</div>
          <div className="nr-pop-subtitle">词典释义</div>
        </div>
        <button type="button" className="nr-pop-close" onClick={onClose} aria-label="关闭"><Icon name="close" size={12} /></button>
      </div>
      {loading ? <div className="nr-loading" style={{ padding: '18px 0' }}>查词典中…</div> : null}
      {error ? <div className="nr-explain" style={{ color: 'var(--dsw-alias-state-error-primary)' }}>{error}</div> : null}
      {!loading && entry && !entry.found ? <div className="nr-explain">词典暂未收录 “{selection.text}”，可以试试翻译这个词。</div> : null}
      {entry?.found ? (
        <>
          <div className="nr-dict-phonetics">
            {uk?.text ? <span><b>UK</b> {uk.text} {uk.audio ? <button type="button" className="nr-audio-btn" onClick={() => play(uk.audio)} aria-label="播放英式发音"><Icon name="volume" size={13} /></button> : null}</span> : null}
            {us?.text ? <span><b>US</b> {us.text} {us.audio ? <button type="button" className="nr-audio-btn" onClick={() => play(us.audio)} aria-label="播放美式发音"><Icon name="volume" size={13} /></button> : null}</span> : null}
          </div>
          {entry.examTags?.length ? <div className="nr-dict-tags">{entry.examTags.map((tag) => <span key={tag} className="nr-chip">{tag}</span>)}</div> : null}
          {entry.definitions?.length ? (
            <div className="nr-dict-section">
              <div className="nr-dict-title">中文释义</div>
              {entry.definitions.map((row, index) => <div className="nr-dict-def" key={index}>{row.pos ? <b>{row.pos}</b> : null}{row.meaning}</div>)}
            </div>
          ) : null}
          {entry.englishDefinitions?.length ? (
            <div className="nr-dict-section">
              <div className="nr-dict-title">英文释义</div>
              {entry.englishDefinitions.slice(0, 4).map((row, index) => (
                <div className="nr-dict-en" key={index}>
                  <div>{row.pos ? <b>{row.pos}</b> : null}{row.definition}</div>
                  {row.examples?.length ? <small>{row.examples.slice(0, 2).join(' / ')}</small> : null}
                </div>
              ))}
            </div>
          ) : null}
          {entry.examples?.length ? (
            <div className="nr-dict-section">
              <div className="nr-dict-title">例句</div>
              {entry.examples.slice(0, 3).map((row, index) => (
                <div className="nr-dict-example" key={index}>
                  <div>{row.source}</div>
                  <small>{row.translation}</small>
                </div>
              ))}
            </div>
          ) : null}
          <div className="nr-pop-actions">
            <Button variant="primary" size="small" onClick={save} disabled={saved || saving}>{saved ? '已在生词本' : saving ? '保存中…' : '加入生词本'}</Button>
            <Button size="small" onClick={() => navigator.clipboard?.writeText(entry.word).then(() => notify('已复制'))}>复制单词</Button>
          </div>
        </>
      ) : null}
    </div>
  )
}


function LookupPopover({ selection, book, chapterIndex, chapterTitle, onClose, notify }) {
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError('')
    setResult(null)
    setSaved(false)
    api('/translate', {
      method: 'POST',
      body: {
        text: selection.text,
        kind: selection.kind,
        bookId: book.id,
        chapterIndex,
        chapterTitle,
      },
    }).then((data) => {
      if (alive) { setResult(data); setLoading(false) }
    }).catch((err) => {
      if (alive) { setError(err.message); setLoading(false) }
    })
    return () => { alive = false }
  }, [selection.text, selection.kind, book.id, chapterIndex, chapterTitle])

  const save = async () => {
    setSaving(true)
    try {
      await api('/vocab', {
        method: 'POST',
        body: {
          term: result?.text ?? selection.text,
          kind: selection.kind,
          translation: result?.translation ?? '',
          translations: result?.translation ? [result.translation] : [],
          definitions: result?.definitions ?? [],
          phonetic: result?.phonetic ?? '',
          context: {
            bookId: book.id,
            chapterIndex,
            chapterTitle,
            sentence: selection.sentence || selection.text,
          },
        },
      })
      setSaved(true)
      notify('已加入生词本')
    } catch (err) {
      notify(err.message, true)
    } finally {
      setSaving(false)
    }
  }

  const width = 360
  const left = Math.min(Math.max(12, selection.rect.left), window.innerWidth - width - 12)
  const estimated = 260
  const top = selection.rect.bottom + estimated < window.innerHeight
    ? selection.rect.bottom + 8
    : Math.max(12, selection.rect.top - estimated - 8)

  return (
    <div className="nr-popover" style={{ left, top }} onMouseDown={(event) => event.stopPropagation()}>
      <div className="nr-pop-head">
        <div>
          <div className="nr-pop-word">{result?.text ?? selection.text}</div>
          <div className="nr-pop-subtitle">{selection.kind === 'sentence' ? '整句翻译' : '单词翻译'}</div>
          {result?.phonetic ? <div className="nr-pop-phonetic">{result.phonetic}</div> : null}
        </div>
        <button type="button" className="nr-pop-close" onClick={onClose} aria-label="关闭"><Icon name="close" size={12} /></button>
      </div>
      {loading ? <div className="nr-loading" style={{ padding: '18px 0' }}>翻译中…</div> : null}
      {error ? <div className="nr-explain" style={{ color: 'var(--dsw-alias-state-error-primary)' }}>{error}</div> : null}
      {result && !loading ? (
        <>
          <p className="nr-pop-trans">{result.translation || '（没有译文）'}</p>
          {selection.kind === 'sentence' && selection.sentence ? <div className="nr-pop-sentence">{selection.sentence}</div> : null}
          <div className="nr-pop-actions">
            <Button variant="primary" size="small" onClick={save} disabled={saved || saving}>
              {saved ? '已在生词本' : saving ? '保存中…' : '加入生词本'}
            </Button>
            <Button size="small" onClick={() => navigator.clipboard?.writeText(selection.text).then(() => notify('已复制'))}>复制</Button>
            <Button size="small" onClick={() => window.open(`https://www.wordreference.com/en/definition/${encodeURIComponent(result.text ?? selection.text)}`, '_blank')}>词典</Button>
          </div>
        </>
      ) : null}
    </div>
  )
}

export default function ReaderView({ bookId, initialChapter, onBack, onRefresh, notify }) {
  const [detail, setDetail] = useState(null)
  const [chapter, setChapter] = useState(null)
  const [chapterIndex, setChapterIndex] = useState(initialChapter ?? 0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selection, setSelection] = useState(null)
  const [menu, setMenu] = useState(null)
  const [lookup, setLookup] = useState(null)
  const [dictionary, setDictionary] = useState(null)
  const [drawer, setDrawer] = useState(null)
  const [savingSelection, setSavingSelection] = useState(false)
  const [bookVocab, setBookVocab] = useState([])
  const [fontSize, setFontSize] = useState(18)
  const [lineHeight, setLineHeight] = useState(1.9)
  const [readingWidth, setReadingWidth] = useState(720)
  const [theme, setTheme] = useState('paper')
  const [chapterPercent, setChapterPercent] = useState(0)
  const scrollRef = useRef(null)
  const contentRef = useRef(null)
  const saveTimer = useRef(null)
  const settingsTimer = useRef(null)
  const initialProgress = useRef(null)
  const sessionRef = useRef(null)
  const chapterIndexRef = useRef(initialChapter ?? 0)

  useEffect(() => {
    let alive = true
    setLoading(true)
    api(`/books/${bookId}`).then((data) => {
      if (!alive) return
      setDetail(data)
      const start = Number.isInteger(initialChapter) ? initialChapter : data.book.progress?.chapterIndex ?? 0
      initialProgress.current = data.book.progress ?? null
      setChapterIndex(start)
      api(`/books/${bookId}/chapters/${start}`).then((chapterData) => {
        if (!alive) return
        setChapter(chapterData.chapter)
        setLoading(false)
      }).catch((err) => { if (alive) { setError(err.message); setLoading(false) } })
      api('/history/session/start', { method: 'POST', body: { bookId, chapterIndex: start } }).then((result) => {
        sessionRef.current = result.session?.id ?? null
      }).catch(() => {})
    }).catch((err) => { if (alive) { setError(err.message); setLoading(false) } })
    return () => { alive = false }
  }, [bookId])

  useEffect(() => {
    api('/settings').then((data) => {
      setFontSize(Number(data.fontSize) || 18)
      setLineHeight(Number(data.lineHeight) || 1.9)
      setReadingWidth(Number(data.maxWidth) || 720)
      setTheme(data.theme || 'paper')
    }).catch(() => {})
  }, [])

  useEffect(() => {
    chapterIndexRef.current = chapterIndex
  }, [chapterIndex])

  useEffect(() => {
    const timer = setInterval(() => {
      if (sessionRef.current) {
        api('/history/session/heartbeat', { method: 'POST', body: { sessionId: sessionRef.current, chapterIndex: chapterIndexRef.current } }).catch(() => {})
      }
    }, 30000)
    return () => {
      clearInterval(timer)
      if (sessionRef.current) {
        const body = JSON.stringify({ sessionId: sessionRef.current })
        try {
          navigator.sendBeacon('/novel-reader/api/history/session/end', new Blob([body], { type: 'application/json' }))
        } catch {
          fetch('/novel-reader/api/history/session/end', { method: 'POST', headers: { 'content-type': 'application/json' }, body, keepalive: true }).catch(() => {})
        }
      }
    }
  }, [])

  useEffect(() => {
    if (!chapter) return
    requestAnimationFrame(() => {
      const scroller = scrollRef.current
      if (!scroller) return
      const progress = initialProgress.current
      if (progress && progress.chapterIndex === chapterIndex) {
        const paragraphs = contentRef.current?.querySelectorAll('p') ?? []
        const target = paragraphs[progress.paragraphIndex ?? 0]
        if (target) target.scrollIntoView({ block: 'start' })
        else scroller.scrollTop = (progress.scrollRatio ?? 0) * Math.max(0, scroller.scrollHeight - scroller.clientHeight)
      } else {
        scroller.scrollTop = 0
      }
    })
  }, [chapter, chapterIndex])

  const currentProgress = () => {
    const scroller = scrollRef.current
    if (!scroller) return null
    const paragraphs = contentRef.current?.querySelectorAll('p') ?? []
    let paragraphIndex = 0
    const top = scroller.getBoundingClientRect().top + 80
    paragraphs.forEach((paragraph, index) => {
      if (paragraph.getBoundingClientRect().top <= top) paragraphIndex = index
    })
    return {
      bookId,
      chapterIndex,
      paragraphIndex,
      charOffset: 0,
      scrollRatio: scroller.scrollHeight > scroller.clientHeight ? scroller.scrollTop / (scroller.scrollHeight - scroller.clientHeight) : 0,
    }
  }

  const scheduleSave = () => {
    const scroller = scrollRef.current
    if (scroller) {
      setChapterPercent(scroller.scrollHeight > scroller.clientHeight ? Math.round((scroller.scrollTop / (scroller.scrollHeight - scroller.clientHeight)) * 100) : 100)
    }
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      const progress = currentProgress()
      if (progress) api('/progress', { method: 'POST', body: progress }).catch(() => {})
    }, 1200)
  }

  const loadChapter = async (index) => {
    if (index < 0 || index >= (detail?.book?.chapterCount ?? 0)) return
    setLoading(true)
    setError('')
    setSelection(null)
    setMenu(null)
    setLookup(null)
    setDictionary(null)
    setDrawer(null)
    setChapterPercent(0)
    try {
      const data = await api(`/books/${bookId}/chapters/${index}`)
      initialProgress.current = null
      setChapterIndex(index)
      setChapter(data.chapter)
      setLoading(false)
      api('/progress', { method: 'POST', body: { bookId, chapterIndex: index, paragraphIndex: 0, charOffset: 0, scrollRatio: 0 } }).catch(() => {})
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const selectionFromRange = () => {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return null
    const text = sel.toString().trim()
    if (!text) return null
    if (!contentRef.current?.contains(sel.anchorNode) || !contentRef.current?.contains(sel.focusNode)) return null
    if (text.length > 2000) {
      notify('选中文字太长，请分段翻译', true)
      return null
    }
    const range = sel.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    const container = range.startContainer.nodeType === 3 ? range.startContainer.parentElement : range.startContainer
    const paragraph = container?.closest?.('p')
    const sentence = paragraph ? sentenceAround(paragraph.innerText, text) : text
    return {
      text,
      kind: text.split(/\s+/).length > 2 ? 'sentence' : 'word',
      sentence,
      rect: { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right },
    }
  }

  const handleContextMenu = (event) => {
    event.preventDefault()
    const candidate = selectionFromRange() ?? wordAtPoint(event.clientX, event.clientY)
    if (!candidate) {
      setMenu(null)
      return
    }
    setSelection(candidate)
    setLookup(null)
    setDictionary(null)
    setMenu({ x: event.clientX, y: event.clientY })
  }

  const openDictionary = () => {
    if (!selection) return
    setDictionary(selection)
    setLookup(null)
    setMenu(null)
  }

  const openLookup = () => {
    if (!selection) return
    setLookup(selection)
    setDictionary(null)
    setMenu(null)
  }

  const saveSelection = async () => {
    if (!selection) return
    setSavingSelection(true)
    try {
      const payload = {
        term: selection.text,
        kind: selection.kind,
        translations: [],
        definitions: [],
        phonetic: '',
        context: {
          bookId,
          chapterIndex,
          chapterTitle: chapter?.title ?? '',
          sentence: selection.sentence || selection.text,
        },
      }
      if (selection.kind === 'word') {
        try {
          const query = new URLSearchParams({ word: selection.text, bookId, chapterIndex: String(chapterIndex), chapterTitle: chapter?.title ?? '' })
          const dictionary = await api(`/dictionary?${query.toString()}`)
          if (dictionary.found) {
            payload.term = dictionary.word
            payload.translations = dictionary.definitions.map((row) => row.meaning).slice(0, 3)
            payload.definitions = dictionary.definitions.map((row) => ({
              pos: row.pos,
              text: row.meaning,
              example: dictionary.englishDefinitions?.[0]?.examples?.[0] ?? '',
            }))
            payload.phonetic = dictionary.phonetics?.uk?.text || dictionary.phonetics?.us?.text || ''
          }
        } catch {
          // Fall back to the translation route below.
        }
      }
      if (!payload.translations.length) {
        const translated = await api('/translate', {
          method: 'POST',
          body: {
            text: selection.text,
            kind: selection.kind,
            bookId,
            chapterIndex,
            chapterTitle: chapter?.title ?? '',
          },
        })
        payload.translations = translated.translation ? [translated.translation] : []
        payload.phonetic = payload.phonetic || translated.phonetic || ''
        payload.definitions = payload.definitions.length ? payload.definitions : translated.definitions ?? []
      }
      const saved = await api('/vocab', { method: 'POST', body: payload })
      notify(saved.created ? '已加入生词本' : '这个词已经在生词本里了')
      setMenu(null)
    } catch (err) {
      notify(err.message, true)
    } finally {
      setSavingSelection(false)
    }
  }

  const copySelection = () => {
    if (!selection) return
    navigator.clipboard?.writeText(selection.text).then(() => notify('已复制')).catch(() => {})
    setMenu(null)
  }

  const openDrawer = async (name) => {
    const next = drawer === name ? null : name
    setDrawer(next)
    setMenu(null)
    if (next === 'vocab') {
      try {
        const data = await api(`/vocab?bookId=${bookId}`)
        setBookVocab(data.vocab ?? [])
      } catch {}
    }
  }

  const saveReadingSettings = (patch) => {
    clearTimeout(settingsTimer.current)
    settingsTimer.current = setTimeout(() => {
      api('/settings', { method: 'PATCH', body: patch }).catch(() => {})
    }, 500)
  }

  const title = detail?.book?.title ?? ''
  const chapters = detail?.chapters ?? []
  const readingStyle = useMemo(() => ({
    '--nr-reading-size': `${fontSize}px`,
    '--nr-reading-leading': lineHeight,
    '--nr-reading-width': `${readingWidth}px`,
    '--nr-reading-font': 'Georgia, "Times New Roman", serif',
  }), [fontSize, lineHeight, readingWidth])

  return (
    <div className={`nr-reader nr-theme-${theme}`}>
      <div className="nr-reader-top">
        <Button variant="ghost" size="small" onClick={onBack} title="返回书架"><Icon name="arrowLeft" size={15} /> 书架</Button>
        <div className="nr-reader-title">
          <div className="nr-reader-book">{title}</div>
          <div className="nr-reader-chapter">{chapter?.title ?? '加载中…'}</div>
        </div>
        <Button variant="ghost" size="small" onClick={() => openDrawer('toc')}>目录</Button>
        <Button variant="ghost" size="small" onClick={() => openDrawer('type')}>Aa</Button>
        <Button variant="ghost" size="small" onClick={() => openDrawer('vocab')}>生词 {bookVocab.length ? `(${bookVocab.length})` : ''}</Button>
        <Button variant="ghost" size="small" onClick={() => loadChapter(chapterIndex + 1)} disabled={chapterIndex + 1 >= (detail?.book?.chapterCount ?? 0)}>下一章</Button>
      </div>

      <div className="nr-reader-main">
        <div className="nr-reader-scroll" ref={scrollRef} onScroll={scheduleSave}>
          <div className="nr-reader-tip">单词：选中后右键查词典 · 句子：拖选后右键翻译整句</div>
          {error ? <div className="nr-empty" style={{ maxWidth: 620, margin: '40px auto' }}><h3>这一章打不开</h3><p>{error}</p><Button onClick={() => loadChapter(chapterIndex)}>重试</Button></div> : null}
          {loading && !chapter ? <div className="nr-loading">正在打开这一章…</div> : null}
          {chapter ? (
            <div
              className="nr-reading"
              ref={contentRef}
              style={readingStyle}
              onContextMenu={handleContextMenu}
              dangerouslySetInnerHTML={{ __html: chapter.html }}
            />
          ) : null}
        </div>
      </div>

      <div className="nr-reader-foot">
        <Button variant="ghost" size="small" onClick={() => loadChapter(chapterIndex - 1)} disabled={chapterIndex <= 0}>上一章</Button>
        <span>第 {chapterIndex + 1} / {detail?.book?.chapterCount ?? '?'} 章</span>
        <div className="nr-progress"><i style={{ width: `${chapterPercent}%` }} /></div>
        <span>本章 {chapterPercent}%</span>
        <Button variant="ghost" size="small" onClick={() => loadChapter(chapterIndex + 1)} disabled={chapterIndex + 1 >= (detail?.book?.chapterCount ?? 0)}>下一章</Button>
      </div>

      {drawer === 'toc' ? (
        <Drawer title="目录" onClose={() => setDrawer(null)}>
          <div className="nr-chapter-list">
            {chapters.map((row) => (
              <button
                key={row.index}
                type="button"
                className={`nr-chapter-item ${row.index === chapterIndex ? 'is-on' : ''}`}
                onClick={() => loadChapter(row.index)}
              >
                <span className="nr-chapter-number">{row.index + 1}</span>
                <span>{row.title}</span>
              </button>
            ))}
          </div>
        </Drawer>
      ) : null}

      {drawer === 'type' ? (
        <Drawer title="阅读排版" onClose={() => setDrawer(null)}>
          <div className="nr-type-row"><span>字号</span><input type="range" min="14" max="26" step="1" value={fontSize} onChange={(event) => { const value = Number(event.target.value); setFontSize(value); saveReadingSettings({ fontSize: value }) }} /><output>{fontSize}</output></div>
          <div className="nr-type-row"><span>行高</span><input type="range" min="1.4" max="2.4" step="0.1" value={lineHeight} onChange={(event) => { const value = Number(event.target.value); setLineHeight(value); saveReadingSettings({ lineHeight: value }) }} /><output>{lineHeight}</output></div>
          <div className="nr-type-row"><span>页宽</span><input type="range" min="540" max="920" step="20" value={readingWidth} onChange={(event) => { const value = Number(event.target.value); setReadingWidth(value); saveReadingSettings({ maxWidth: value }) }} /><output>{readingWidth}</output></div>
          <div className="nr-type-row" style={{ marginTop: 16 }}><span>主题</span></div>
          <div className="nr-segment">
            {[['paper', '纸张'], ['sepia', '暖黄'], ['night', '夜间']].map(([value, label]) => (
              <button key={value} type="button" className={theme === value ? 'is-on' : ''} onClick={() => { setTheme(value); saveReadingSettings({ theme: value }) }}>{label}</button>
            ))}
          </div>
          <p className="nr-sub" style={{ marginTop: 18 }}>排版设置会保存，下次打开阅读器继续使用。</p>
        </Drawer>
      ) : null}

      {drawer === 'vocab' ? (
        <Drawer title="本书生词" onClose={() => setDrawer(null)}>
          <p className="nr-sub" style={{ marginTop: 0 }}>{bookVocab.length ? `共 ${bookVocab.length} 个词` : '这本书还没有收藏生词'}</p>
          {bookVocab.slice(0, 200).map((entry) => (
            <div key={entry.id} className="nr-context" style={{ margin: '8px 0' }}>
              <b>{entry.term}</b>
              {entry.phonetic ? <span className="nr-vocab-phonetic" style={{ marginLeft: 8 }}>{entry.phonetic}</span> : null}
              <div>{entry.translations?.join('；') || entry.definitions?.[0]?.text || ''}</div>
            </div>
          ))}
        </Drawer>
      ) : null}

      {menu && selection ? (
        <SelectionMenu
          menu={menu}
          selection={selection}
          saving={savingSelection}
          onClose={() => setMenu(null)}
          onDictionary={openDictionary}
          onTranslate={openLookup}
          onSave={saveSelection}
          onCopy={copySelection}
        />
      ) : null}

      {dictionary && detail ? (
        <DictionaryPopover
          selection={dictionary}
          book={detail.book}
          chapterIndex={chapterIndex}
          chapterTitle={chapter?.title ?? ''}
          onClose={() => setDictionary(null)}
          notify={notify}
        />
      ) : null}

      {lookup && detail ? (
        <LookupPopover
          selection={lookup}
          book={detail.book}
          chapterIndex={chapterIndex}
          chapterTitle={chapter?.title ?? ''}
          onClose={() => setLookup(null)}
          notify={notify}
        />
      ) : null}
    </div>
  )
}

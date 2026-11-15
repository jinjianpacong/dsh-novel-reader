import React, { useEffect, useMemo, useState } from 'react'
import { Button, Empty, Field, Icon, api, formatDate } from './ui.jsx'

const TYPE_OPTIONS = [
  ['meaning-en-zh', '英译中选择题'],
  ['meaning-zh-en', '中译英选择题'],
  ['cloze', '例句填空'],
  ['spelling', '拼写题'],
  ['context', '语境理解'],
]

export default function PracticeView({ state, notify, onRefresh, initialScope }) {
  const [scopeType, setScopeType] = useState('due')
  const [bookId, setBookId] = useState('')
  const [tag, setTag] = useState('')
  const [count, setCount] = useState(10)
  const [types, setTypes] = useState(['meaning-en-zh', 'meaning-zh-en', 'cloze', 'spelling'])
  const [busy, setBusy] = useState(false)
  const [quiz, setQuiz] = useState(null)
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [feedback, setFeedback] = useState({})
  const [textAnswer, setTextAnswer] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (!initialScope) return
    setScopeType(initialScope.type ?? 'due')
    if (initialScope.bookId) setBookId(initialScope.bookId)
    if (initialScope.tag) setTag(initialScope.tag)
  }, [initialScope])

  const scope = useMemo(() => {
    if (scopeType === 'book') return { type: 'book', bookId }
    if (scopeType === 'tag') return { type: 'tag', tag }
    if (scopeType === 'recent') return { type: 'recent' }
    if (scopeType === 'all') return { type: 'all' }
    return { type: 'due' }
  }, [scopeType, bookId, tag])

  const generate = async () => {
    if (!types.length) return notify('至少选择一种题型', true)
    setBusy(true)
    try {
      const data = await api('/quiz/generate', { method: 'POST', body: { scope, count, types } })
      setQuiz(data.quiz)
      setIndex(0)
      setAnswers({})
      setFeedback({})
      setTextAnswer('')
      setResult(null)
    } catch (error) {
      notify(error.message, true)
    } finally {
      setBusy(false)
    }
  }

  const question = quiz?.questions?.[index]
  const currentFeedback = question ? feedback[question.id] : null

  const answerChoice = async (choice) => {
    if (!question || currentFeedback) return
    try {
      const data = await api(`/quiz/${quiz.id}/answer`, { method: 'POST', body: { questionId: question.id, choice } })
      setAnswers((value) => ({ ...value, [question.id]: { choice } }))
      setFeedback((value) => ({ ...value, [question.id]: data }))
    } catch (error) {
      notify(error.message, true)
    }
  }

  const answerText = async () => {
    if (!question || !textAnswer.trim() || currentFeedback) return
    try {
      const data = await api(`/quiz/${quiz.id}/answer`, { method: 'POST', body: { questionId: question.id, text: textAnswer } })
      setAnswers((value) => ({ ...value, [question.id]: { text: textAnswer } }))
      setFeedback((value) => ({ ...value, [question.id]: data }))
    } catch (error) {
      notify(error.message, true)
    }
  }

  const next = async () => {
    if (index + 1 < quiz.questions.length) {
      setIndex(index + 1)
      setTextAnswer('')
      return
    }
    setBusy(true)
    try {
      const payload = quiz.questions.map((row) => ({ questionId: row.id, ...(answers[row.id] ?? {}) }))
      const data = await api(`/quiz/${quiz.id}/finish`, { method: 'POST', body: { answers: payload } })
      setResult(data)
      await onRefresh()
    } catch (error) {
      notify(error.message, true)
    } finally {
      setBusy(false)
    }
  }

  if (result) {
    const wrong = result.results.filter((row) => !row.correct)
    const questionMap = new Map(quiz.questions.map((row) => [row.id, row]))
    return (
      <div className="nr-page" style={{ maxWidth: 840 }}>
        <div className="nr-result">
          <div className="nr-score">{Math.round(result.score * 100)}<small> 分</small></div>
          <p className="nr-sub" style={{ fontSize: 13 }}>答对 {result.results.length - wrong.length} / {result.results.length} 题</p>
          <div className="nr-row" style={{ justifyContent: 'center', margin: '18px 0 26px' }}>
            <Button variant="primary" onClick={() => { setQuiz(null); setResult(null) }}>再练一组</Button>
            <Button onClick={() => { setQuiz(null); setResult(null); setScopeType('due') }}>返回练习</Button>
          </div>
        </div>
        {wrong.length ? (
          <div className="nr-card">
            <h3 style={{ marginTop: 0 }}>这 {wrong.length} 个词还需要再看看</h3>
            {wrong.map((row) => {
              const source = questionMap.get(row.questionId)
              return (
                <div className="nr-context" key={row.questionId}>
                  <b>{source?.term}</b>
                  <div>{source?.explanation}</div>
                </div>
              )
            })}
          </div>
        ) : null}
      </div>
    )
  }

  if (quiz && question) {
    return (
      <div className="nr-page" style={{ maxWidth: 840 }}>
        <div className="nr-page-head">
          <div>
            <h1 className="nr-title">练习</h1>
            <p className="nr-sub">{quiz.engine === 'model' ? '由当前模型出题' : '本地题库模式'} · 共 {quiz.questions.length} 题</p>
          </div>
          <div className="nr-head-actions">
            <Button onClick={() => setQuiz(null)}>退出练习</Button>
          </div>
        </div>
        <div className="nr-quiz" style={{ maxWidth: 'none' }}>
          <div className="nr-row" style={{ marginBottom: 12, width: '100%' }}>
            <span className="nr-sub">第 {index + 1} / {quiz.questions.length} 题</span>
            <div className="nr-progress" style={{ flex: 1 }}><i style={{ width: `${((index + 1) / quiz.questions.length) * 100}%` }} /></div>
          </div>
          <div className="nr-card">
            <div className="nr-question">{question.prompt}</div>
            {question.type === 'spelling' ? (
              <div>
                <div className="nr-row">
                  <input
                    className="nr-input"
                    style={{ maxWidth: 320 }}
                    value={textAnswer}
                    onChange={(event) => setTextAnswer(event.target.value)}
                    onKeyDown={(event) => { if (event.key === 'Enter') answerText() }}
                    placeholder="输入单词"
                    disabled={Boolean(currentFeedback)}
                  />
                  <Button variant="primary" onClick={answerText} disabled={Boolean(currentFeedback)}>检查</Button>
                </div>
                {currentFeedback ? (
                  <div className="nr-explain">
                    {currentFeedback.correct ? '拼写正确。' : `正确答案是 ${currentFeedback.answerText}。`}
                    {' '}{question.explanation}
                  </div>
                ) : null}
              </div>
            ) : (
              <div>
                {question.options.map((option, optionIndex) => {
                  let className = 'nr-option'
                  if (currentFeedback) {
                    if (optionIndex === currentFeedback.answer) className += ' is-correct'
                    else if (optionIndex === answers[question.id]?.choice) className += ' is-wrong'
                    else className += ' is-muted'
                  }
                  return (
                    <button key={optionIndex} type="button" className={className} onClick={() => answerChoice(optionIndex)} disabled={Boolean(currentFeedback)}>
                      <span className="nr-letter">{String.fromCharCode(65 + optionIndex)}</span>
                      <span>{option}</span>
                    </button>
                  )
                })}
                {currentFeedback ? <div className="nr-explain">{currentFeedback.explanation}</div> : null}
              </div>
            )}
            <div className="nr-row" style={{ justifyContent: 'flex-end', marginTop: 16 }}>
              <Button variant="primary" onClick={next} disabled={!currentFeedback || busy}>
                {index + 1 === quiz.questions.length ? '查看结果' : '下一题'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="nr-page" style={{ maxWidth: 840 }}>
      <div className="nr-page-head">
        <div>
          <h1 className="nr-title">练习</h1>
          <p className="nr-sub">从生词本生成练习，答错的词会自动提前复习</p>
        </div>
      </div>
      <div className="nr-card" style={{ maxWidth: 840 }}>
        <div className="nr-form-grid">
          <Field label="范围">
            <select className="nr-select" value={scopeType} onChange={(event) => setScopeType(event.target.value)}>
              <option value="due">今日到期</option>
              <option value="book">某一本书</option>
              <option value="tag">某个标签</option>
              <option value="recent">最近新增</option>
              <option value="all">全部生词</option>
            </select>
          </Field>
          {scopeType === 'book' ? (
            <Field label="选择书籍">
              <select className="nr-select" value={bookId} onChange={(event) => setBookId(event.target.value)}>
                <option value="">请选择</option>
                {state.books.map((book) => <option key={book.id} value={book.id}>{book.title}</option>)}
              </select>
            </Field>
          ) : null}
          {scopeType === 'tag' ? (
            <Field label="标签"><input className="nr-input" value={tag} onChange={(event) => setTag(event.target.value)} placeholder="例如 book:bk_xxx" /></Field>
          ) : null}
          <Field label="题量">
            <select className="nr-select" value={count} onChange={(event) => setCount(Number(event.target.value))}>
              {[5, 10, 15, 20].map((value) => <option key={value} value={value}>{value} 题</option>)}
            </select>
          </Field>
        </div>

        <div className="nr-section">
          <h3>题型</h3>
          <div className="nr-row" style={{ gap: 14 }}>
            {TYPE_OPTIONS.map(([value, label]) => (
              <label key={value} className="nr-switch" style={{ cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={types.includes(value)}
                  onChange={(event) => setTypes((current) => event.target.checked ? [...current, value] : current.filter((item) => item !== value))}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="nr-row" style={{ justifyContent: 'flex-end' }}>
          <Button variant="primary" onClick={generate} disabled={busy}>
            <Icon name="spark" size={14} /> {busy ? '生成中…' : '生成练习'}
          </Button>
        </div>
      </div>

      <div className="nr-section">
        <h3>最近练习</h3>
        {(state.recentQuizzes ?? []).length ? state.recentQuizzes.map((row) => (
          <div className="nr-history-row" key={row.id}>
            <div className="nr-history-main">
              <div className="nr-history-title">{row.count} 题 · {row.engine === 'model' ? '模型出题' : '本地题库'}</div>
              <div className="nr-history-meta">{formatDate(row.createdAt)}</div>
            </div>
            <span className="nr-sub">{row.score == null ? '未完成' : `${Math.round(row.score * 100)} 分`}</span>
          </div>
        )) : <p className="nr-sub">还没有练习记录。</p>}
      </div>
    </div>
  )
}

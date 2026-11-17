import React, { useEffect, useRef, useState } from 'react'
import { Button, Field, Toggle, api, formatDate, formatMinutes } from './ui.jsx'

export default function SettingsView({ state, notify, onRefresh }) {
  const settings = state.settings
  const [form, setForm] = useState({ ...settings })
  const [syncForm, setSyncForm] = useState({ ...settings.sync })
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [syncBusy, setSyncBusy] = useState(false)
  const [syncResult, setSyncResult] = useState(null)
  const fileRef = useRef(null)

  useEffect(() => {
    setForm({ ...state.settings })
    setSyncForm({ ...state.settings.sync })
  }, [state.settings])

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const updateSync = (key, value) => setSyncForm((current) => ({ ...current, [key]: value }))

  const saveGeneral = async () => {
    setBusy(true)
    try {
      await api('/settings', {
        method: 'PATCH',
        body: {
          targetLanguage: form.targetLanguage,
          theme: form.theme,
          fontSize: Number(form.fontSize),
          lineHeight: Number(form.lineHeight),
          fontFamily: form.fontFamily,
          maxWidth: Number(form.maxWidth),
          dailyNewWords: Number(form.dailyNewWords),
          dailyReviewLimit: Number(form.dailyReviewLimit),
          translationEngine: form.translationEngine,
          showEnglishDefinition: Boolean(form.showEnglishDefinition),
          autoSaveLookups: Boolean(form.autoSaveLookups),
          slackingMode: Boolean(form.slackingMode),
        },
      })
      notify('设置已保存')
      await onRefresh()
    } catch (error) {
      notify(error.message, true)
    } finally {
      setBusy(false)
    }
  }

  const saveSync = async () => {
    setBusy(true)
    try {
      await api('/settings', {
        method: 'PATCH',
        body: {
          sync: {
            enabled: Boolean(syncForm.enabled),
            url: syncForm.url,
            remoteDir: syncForm.remoteDir,
            username: syncForm.username,
            syncBooks: Boolean(syncForm.syncBooks),
            syncHistory: Boolean(syncForm.syncHistory),
            autoSync: syncForm.autoSync,
            conflict: syncForm.conflict,
          },
          ...(password ? { syncPassword: password } : {}),
        },
      })
      setPassword('')
      notify('WebDAV 设置已保存')
      await onRefresh()
    } catch (error) {
      notify(error.message, true)
    } finally {
      setBusy(false)
    }
  }

  const test = async () => {
    setSyncBusy(true)
    setSyncResult(null)
    try {
      await api('/settings', {
        method: 'PATCH',
        body: {
          sync: {
            enabled: Boolean(syncForm.enabled),
            url: syncForm.url,
            remoteDir: syncForm.remoteDir,
            username: syncForm.username,
            syncBooks: Boolean(syncForm.syncBooks),
            syncHistory: Boolean(syncForm.syncHistory),
            autoSync: syncForm.autoSync,
            conflict: syncForm.conflict,
          },
          ...(password ? { syncPassword: password } : {}),
        },
      })
      const data = await api('/sync/test', { method: 'POST' })
      setSyncResult(data)
      notify(data.ok ? 'WebDAV 连接正常' : (data.message || '连接失败'), !data.ok)
      await onRefresh()
    } catch (error) {
      setSyncResult({ ok: false, message: error.message })
      notify(error.message, true)
    } finally {
      setSyncBusy(false)
    }
  }

  const runSync = async () => {
    setSyncBusy(true)
    setSyncResult(null)
    try {
      const data = await api('/sync/run', { method: 'POST' })
      setSyncResult({ ...data, ok: true })
      notify(`同步完成：上传 ${data.uploaded}，下载 ${data.downloaded}`)
      await onRefresh()
    } catch (error) {
      setSyncResult({ ok: false, message: error.message })
      notify(error.message, true)
    } finally {
      setSyncBusy(false)
    }
  }

  const exportBackup = async () => {
    try {
      const response = await fetch('/novel-reader/api/backup/export', { method: 'POST' })
      if (!response.ok) throw new Error(`导出失败（HTTP ${response.status}）`)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `novel-reader-${new Date().toISOString().slice(0, 10)}.zip`
      anchor.click()
      URL.revokeObjectURL(url)
      notify('备份已导出')
    } catch (error) {
      notify(error.message, true)
    }
  }

  const importBackup = async (file) => {
    if (!file) return
    setBusy(true)
    try {
      const response = await fetch('/novel-reader/api/backup/import', { method: 'POST', body: file })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok || !payload.ok) throw new Error(payload?.error?.message ?? '导入失败')
      notify(`已导入 ${payload.data.imported} 个文件`)
      await onRefresh()
    } catch (error) {
      notify(error.message, true)
    } finally {
      setBusy(false)
    }
  }

  const clearHistory = async (type) => {
    if (!window.confirm(type === 'reading' ? '确定清空阅读记录吗？生词本不会被删除。' : '确定清空查词记录吗？')) return
    setBusy(true)
    try {
      await api(`/history?type=${type}`, { method: 'DELETE' })
      notify('历史记录已清空')
      await onRefresh()
    } catch (error) {
      notify(error.message, true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="nr-page" style={{ maxWidth: 900 }}>
      <div className="nr-page-head">
        <div>
          <h1 className="nr-title">设置</h1>
          <p className="nr-sub">数据目录：{settings.dataDir || '$DSH_HOME/novel-reader'}</p>
        </div>
      </div>

      <div className="nr-card">
        <div className="nr-section">
          <h3>阅读</h3>
          <p>控制阅读器的默认排版和学习节奏。</p>
          <div className="nr-form-grid">
            <Field label="目标语言">
              <select className="nr-select" value={form.targetLanguage} onChange={(event) => update('targetLanguage', event.target.value)}>
                <option value="zh-CN">简体中文</option>
                <option value="zh-TW">繁体中文</option>
                <option value="en">English</option>
              </select>
            </Field>
            <Field label="阅读主题">
              <select className="nr-select" value={form.theme} onChange={(event) => update('theme', event.target.value)}>
                <option value="paper">纸张</option>
                <option value="sepia">暖黄</option>
                <option value="night">夜间</option>
              </select>
            </Field>
            <Field label="字号"><input className="nr-input" type="number" min="14" max="26" value={form.fontSize} onChange={(event) => update('fontSize', event.target.value)} /></Field>
            <Field label="行高"><input className="nr-input" type="number" min="1.4" max="2.4" step="0.1" value={form.lineHeight} onChange={(event) => update('lineHeight', event.target.value)} /></Field>
            <Field label="每日新词目标"><input className="nr-input" type="number" min="0" max="100" value={form.dailyNewWords} onChange={(event) => update('dailyNewWords', event.target.value)} /></Field>
            <Field label="每日复习上限"><input className="nr-input" type="number" min="0" max="500" value={form.dailyReviewLimit} onChange={(event) => update('dailyReviewLimit', event.target.value)} /></Field>
          </div>
          <div className="nr-row" style={{ marginTop: 14 }}>
            <Toggle checked={Boolean(form.slackingMode)} onChange={(value) => update('slackingMode', value)} label="摸鱼模式（阅读界面伪装成对话）" />
          </div>
        </div>

        <div className="nr-section">
          <h3>翻译</h3>
          <p>默认使用 DSH 自带的匿名翻译通道，失败时自动改用当前模型。</p>
          <div className="nr-form-grid">
            <Field label="翻译引擎">
              <select className="nr-select" value={form.translationEngine} onChange={(event) => update('translationEngine', event.target.value)}>
                <option value="auto">自动（匿名优先，失败用模型）</option>
                <option value="bing">Bing 匿名</option>
                <option value="google">Google 匿名</option>
                <option value="model">当前 DeepSeek 模型</option>
              </select>
            </Field>
            <div className="nr-row" style={{ alignItems: 'flex-end', paddingBottom: 6 }}>
              <Toggle checked={Boolean(form.autoSaveLookups)} onChange={(value) => update('autoSaveLookups', value)} label="自动保存查词历史" />
            </div>
          </div>
          <div className="nr-row" style={{ justifyContent: 'flex-end', marginTop: 14 }}>
            <Button variant="primary" onClick={saveGeneral} disabled={busy}>保存阅读与翻译设置</Button>
          </div>
        </div>

        <div className="nr-section">
          <h3>WebDAV 同步</h3>
          <p>把小说文件、生词、阅读进度和历史同步到支持 WebDAV 的网盘。密码保存在 DSH 凭据服务里，不会写进数据文件。</p>
          <div className="nr-form-grid">
            <Field label="服务器地址" hint="例如 https://dav.example.com/remote.php/dav/files/username/"><input className="nr-input" value={syncForm.url} onChange={(event) => updateSync('url', event.target.value)} placeholder="https://" /></Field>
            <Field label="远程目录"><input className="nr-input" value={syncForm.remoteDir} onChange={(event) => updateSync('remoteDir', event.target.value)} placeholder="novel-reader" /></Field>
            <Field label="用户名"><input className="nr-input" value={syncForm.username} onChange={(event) => updateSync('username', event.target.value)} autoComplete="username" /></Field>
            <Field label="密码 / 应用专用密码" hint={syncForm.passwordConfigured ? '已保存；留空表示不修改' : '还没有保存密码'}><input className="nr-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" placeholder={syncForm.passwordConfigured ? '已配置' : ''} /></Field>
            <Field label="自动同步">
              <select className="nr-select" value={syncForm.autoSync} onChange={(event) => updateSync('autoSync', event.target.value)} disabled={!syncForm.enabled}>
                <option value="off">关闭</option>
                <option value="5min">每 5 分钟</option>
              </select>
            </Field>
            <Field label="冲突策略">
              <select className="nr-select" value={syncForm.conflict} onChange={(event) => updateSync('conflict', event.target.value)} disabled={!syncForm.enabled}>
                <option value="newer">以较新的记录为准</option>
                <option value="copy">保留双方副本</option>
              </select>
            </Field>
          </div>
          <div className="nr-row" style={{ marginTop: 14 }}>
            <Toggle checked={Boolean(syncForm.enabled)} onChange={(value) => updateSync('enabled', value)} label="启用同步" />
            <Toggle checked={Boolean(syncForm.syncBooks)} onChange={(value) => updateSync('syncBooks', value)} label="同步小说文件" disabled={!syncForm.enabled} />
            <Toggle checked={Boolean(syncForm.syncHistory)} onChange={(value) => updateSync('syncHistory', value)} label="同步历史记录" disabled={!syncForm.enabled} />
          </div>
          <p className="nr-sub" style={{ marginTop: 10 }}>启用后，导入图书、退出阅读器、保存生词或阅读进度时会在几秒后自动同步；此外还可设置每 5 分钟自动同步。</p>
          <div className="nr-row" style={{ marginTop: 16 }}>
            <Button variant="primary" onClick={saveSync} disabled={busy}>保存 WebDAV 设置</Button>
            <Button onClick={test} disabled={syncBusy}>保存并测试</Button>
            <Button onClick={runSync} disabled={syncBusy || !syncForm.enabled}>立即同步</Button>
            {state.sync?.lastSyncAt ? <span className="nr-sub">上次同步：{formatDate(state.sync.lastSyncAt)}</span> : null}
          </div>
          {syncResult ? (
            <div className="nr-explain" style={{ marginTop: 12, color: syncResult.ok ? undefined : 'var(--dsw-alias-state-error-primary)' }}>
              {syncResult.ok
                ? `连接正常${syncResult.uploaded !== undefined ? `，上传 ${syncResult.uploaded} 个文件，下载 ${syncResult.downloaded} 个文件` : ''}`
                : syncResult.message || '连接失败'}
            </div>
          ) : null}
        </div>

        <div className="nr-section">
          <h3>数据管理</h3>
          <p>导出一个包含全部书籍、生词和历史的 zip；换电脑时可以再导入。</p>
          <div className="nr-row">
            <Button onClick={exportBackup} disabled={busy}>导出备份</Button>
            <input ref={fileRef} type="file" accept=".zip" style={{ display: 'none' }} onChange={(event) => { importBackup(event.target.files?.[0]); event.target.value = '' }} />
            <Button onClick={() => fileRef.current?.click()} disabled={busy}>导入备份</Button>
            <Button variant="danger" size="small" onClick={() => clearHistory('reading')}>清空阅读记录</Button>
            <Button variant="danger" size="small" onClick={() => clearHistory('lookup')}>清空查词记录</Button>
          </div>
        </div>

        <div className="nr-section">
          <h3>关于</h3>
          <p>Novel Reader 0.1.0 · 数据默认保存在 {settings.dataDir || '$DSH_HOME/novel-reader'}。不支持 DRM 电子书和 PDF 导入。</p>
        </div>
      </div>
    </div>
  )
}

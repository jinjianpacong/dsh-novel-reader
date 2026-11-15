# Novel Reader · 英文小说阅读插件实现方案

> 版本：v0.1（方案评审稿）  
> 日期：2026-11-15  
> 技术基线：当前 DSH `0.2.2-rc.3`（Desktop / Web GUI）  
> 状态：只做设计，不写实现代码

---

## 0. 方案速览

| 维度 | 结论 |
|---|---|
| 插件形态 | 一个 DSH bundle，Host（Node）+ Client（React）双半；侧栏「阅读」进入主面板全页面 |
| 书架 | 支持 EPUB / TXT / Markdown 导入；自动提取书名、作者、封面、章节；书籍详情带字数、时长、生词密度等数据 |
| 阅读器 | 章节懒加载、段落级进度记忆、排版/主题/专注模式；位置用「章节 + 段落 + 偏移」保存 |
| 划词 | 双击单词出音标/中英释义/例句；拖选句子出译文；弹层可一键加入生词本 |
| 生词本 | 按词元去重、多上下文、标签/笔记、熟练度、简化 SM-2 间隔复习 |
| 练习 | 从生词本按范围生成 5 类题型；LLM 出题 + 严格校验 + 本地出题器兜底 |
| 历史 | 阅读会话、查词记录、练习记录、热力图与统计 |
| WebDAV | Basic Auth + HTTPS；书籍/生词/进度/历史增量双向同步，记录级合并 + 墓碑 + 冲突副本 |
| 数据位置 | `$DSH_HOME/novel-reader/`，JSON 文档 + 每本书独立目录；不依赖外部数据库 |
| 安全 | 所有 Host 路由经 `connection.requestRejection` 鉴权；EPUB HTML 白名单清洗；密码走 `ctx.credentials` |
| 分期 | M0 骨架/书架 → M1 划词/生词/历史 → M2 练习/SRS → M3 WebDAV → M4 打磨/Agent 工具 |

---

## 1. 目标与范围

### 1.1 一句话

在 DSH 侧栏新增一个「阅读」面板：导入英文小说（EPUB / TXT / Markdown），在沉浸式阅读器里划词、划句翻译，一键收藏生词，按生词本自动生成练习题，并记录阅读与查词历史；所有书、生词、进度、历史都可通过 WebDAV 在多台设备间同步。

### 1.2 核心用户故事

| 编号 | 用户故事 | 优先级 |
|---|---|---|
| U1 | 我把一本 EPUB 英文小说拖进书架，自动识别书名、作者、封面和章节 | P0 |
| U2 | 我点开书继续读，关掉页面再回来能回到上次的段落 | P0 |
| U3 | 我双击一个单词，弹出音标、释义、中文翻译，并能一键加入生词本 | P0 |
| U4 | 我拖选一句话，弹出译文，译文和原文都留在查词历史里 | P0 |
| U5 | 我在生词本里看到这个词出现在哪本书、哪句话，并能跳回原文 | P0 |
| U6 | 我选择「今天到期的词」，生成 10 道选择题/填空题来复习 | P0 |
| U7 | 我做错的题会自动降低该词的熟练度，并在几天后再次出现 | P1 |
| U8 | 我在设置里填 WebDAV，点一下就把小说和阅读历史传到云端 | P0 |
| U9 | 我在另一台电脑上装同一个插件，同步后书架、生词、进度都在 | P0 |
| U10 | 我看到每本书的字数、难度、阅读时长、生词密度等数据 | P1 |

### 1.3 本期做

- 书架管理：导入、解析、编辑元数据、删除、封面、章节列表
- 阅读器：章节阅读、进度记忆、字体排版、主题、快捷键
- 划词/划句：查词、翻译、加入生词本、查词历史
- 生词本：词条、上下文、标签、笔记、熟练度、间隔复习
- 练习：基于生词本生成题目、作答、判分、错题回顾
- 历史：阅读会话、查词记录、练习记录、基础统计
- WebDAV：配置、测试、上传/下载/双向合并、自动同步
- 本地备份：导出/导入一个 zip，作为 WebDAV 之外的兜底

### 1.4 本期不做（明确边界）

- DRM 保护的电子书（Kindle AZW3、Adobe DRM EPUB）
- PDF 重排版阅读（本期不支持 PDF 导入）
- 在线书城、书源抓取、盗版书下载
- 听力/口语评测、TTS 朗读（可作为 P2）
- 多用户/账号体系（单机单用户）
- 移动端原生 App（先做好 Web GUI 的响应式布局）

---

## 2. 技术选型与插件形态

### 2.1 为什么做成 DSH 原生插件

这不是一个独立网站，而是 DSH 的一个**全页面插件**：

- 侧栏多一个「阅读」图标，点击进入主面板页面；
- 使用 DSH 的主题、语言、字体和交互规范，和现有界面是一体的；
- Host 侧直接读写本机文件、调用 DSH 的翻译与模型服务；
- 后续可以让 Agent 工具读取生词本、生成练习，形成“阅读 + AI”的闭环。

### 2.2 双半结构

| 层 | 形态 | 职责 |
|---|---|---|
| Host 半 | `index.js`，Node ESM | 数据持久化、图书解析、翻译/词典、练习生成、WebDAV、HTTP 路由 |
| Client 半 | `client/client.js`，模块加载器工厂 | 主面板 UI、阅读器、划词弹层、生词本/练习/历史/设置页面 |
| 通信 | 同源 `fetch('/novel-reader/api/*')` | 所有读写操作走 Host，Client 不直接碰文件系统 |
| 打包 | 一个 bundle（`dsh.bundle.patch` + `dsh.client`） | 安装一次即可同时得到 Host 与 UI |

**通信方式的选择说明**：使用 `ctx.webServer.register()` 注册前缀路由，而不是 Typert `@Remote` 代码生成。原因是本插件是手写 JS 包，自定义 HTTP 路由无需构建期代码生成，且本机已安装的 `dsh-media-desk` 等插件已验证同一模式；每个请求都会调用 `ctx.connection.requestRejection()` 做 Host/Origin 与登录凭证校验，安全性不降级。

### 2.3 已核实的宿主能力

以下接口均通过 `cordis_inspect_query` 在当前运行实例中确认存在，不是猜测：

| 能力 | 接口 | 用途 |
|---|---|---|
| 主面板 | Client Slot `main`，按 key 注册，key 如 `novel-reader` | 渲染整页阅读器 |
| 侧栏图标 | Client Slot `sidebar.panellist`，`id` 与 `main` 的 key 对应 | 侧栏「阅读」入口 |
| 主题 | `--dsw-alias-bg-base`、`--dsw-alias-label-primary` 等 token | 明暗主题一致 |
| 本地化 | `ctx.locale.register()` / `ctx.locale.bind()` | 中英文界面 |
| HTTP 路由 | `ctx.webServer.register({ kind: 'prefix', path: '/novel-reader', handler })` | Host API 与静态图片 |
| 路由鉴权 | `ctx.connection.requestRejection({ headers })` | 拒绝非本机/未登录请求 |
| 翻译 | `ctx.translator.resolve()` + `translate()` | 划词/划句翻译，默认 Bing/Google 匿名通道 |
| 模型 | `ctx.agentDefaultModel.currentSelection()` + `ctx.llm.prepareCall()` + `stream()` | 练习生成、可选的模型翻译兜底 |
| 凭据 | `ctx.credentials.modifyRecord()` / `readRecord()` | 保存 WebDAV 密码，不落到 state.json |
| 默认模型 | `ctx.get('agentDefaultModel')` | 无需用户再配一套 API Key |

### 2.4 数据落盘决策

**采用插件自有 JSON 文档 + 书籍文件目录**，位置：

```
$DSH_HOME/novel-reader/
```

不使用 `ctx.storageDomain` 的理由：

1. **同步单位一致**：WebDAV 同步的就是文件，本地文件结构与远端结构可以一一对应；
2. **可备份、可迁移**：用户直接拷目录就能带走全部数据；
3. **与现有第三方插件一致**：`dsh-media-desk` 等已验证 `$DSH_HOME/<plugin>/state.json` 模式；
4. **实现简单**：不需要引入 zod 依赖和域（domain）生命周期管理。

代价是自己实现原子写、schema 版本迁移和并发串行化，这部分在 §4.5 说明。

---

## 3. 信息架构与页面

### 3.1 导航结构

插件主面板内部的顶部导航：

```
[书架]  [生词本]  [练习]  [历史]  [设置]                        同步状态 · 搜索
```

- 点击侧栏「阅读」默认进入**书架**；
- 点击书籍进入**阅读器**，阅读器有自己的返回按钮，不改变全局侧栏状态；
- 生词本/练习/历史/设置是独立页面，切换时保留阅读器进度。

### 3.2 书架（默认页）

**顶部**：

- 大标题「我的书架」+ 副标题（共 N 本，在读 M 本）
- 搜索框（书名/作者）
- 「导入图书」按钮（支持拖拽到页面任意位置）
- 同步状态胶囊：`已同步 · 2 分钟前` / `有 3 项待上传` / `同步失败`

**继续阅读区**：

- 最近在读的一本书做横向大卡片：封面、书名、章节、进度条、剩余阅读时间估算
- 「继续阅读」直接进入上次的段落

**书架网格**：

- 封面 + 底部进度条；未开始的书显示页数/字数
- 悬浮菜单：书籍详情、编辑信息、导出原文件、移除
- 筛选：全部 / 在读 / 已读完 / 未开始
- 空状态：插画 + 「把 EPUB 或 TXT 拖进来，或点击选择文件」

**书籍详情抽屉**（点封面进入）：

- 封面、书名、作者、语言、出版社/系列（有就显示）
- 数据面板：总词数、章节数、平均句长、已读章节、阅读时长、生词密度（每千词收藏数）、已掌握词覆盖率
- 章节目录（可点击跳转）
- 操作：开始阅读/继续阅读、编辑元数据、重新解析、导出、删除

### 3.3 阅读器

**布局**：

```
┌ 顶栏：← 书架 | 书名 · 章节名 | 目录▾ | Aa | 专注模式 | 书签 ┐
│                                                              │
│   正文（最大宽度约 68 字符，居中）              ┌ 右侧学习抽屉 ┐ │
│   Chapter 7                                    │ 查词卡片     │ │
│   It was a bright cold day in April...         │ 生词本快捷   │ │
│                                                │ 本章生词     │ │
│                                                └─────────────┘ │
└ 底栏：第 7/24 章 · 62% · 预计还剩 3 小时 12 分                ┘
```

**顶栏**：

- 返回书架；书名与章节名（章节名可下拉切换）
- 上一章 / 下一章
- `Aa` 排版面板：字号 14–24、行高 1.5–2.2、字体（衬线/无衬线）、页宽（窄/中/宽）
- 主题：纸张 / 暖黄 / 夜间 / 跟随系统（使用 DSH token，不自造颜色体系）
- 专注模式：隐藏顶栏和右抽屉，只留正文与底部极简进度
- 书签：记录当前段落，书架详情里可见

**正文**：

- 按章节懒加载，进入章节时只请求该章
- 段落间距、首行缩进可选（英文小说默认不缩进）
- 当前阅读位置用“章节索引 + 段落索引 + 段内字符偏移 + 滚动比例”四元组保存，窗口大小变化也能回到原处
- 图片：v1 只保留封面；正文内图片保留占位（避免 EPUB 内嵌资源带来的复杂度和体积）

**阅读进度**：

- 滚动停止 1.5 秒后保存一次；切章、离开页面、关闭标签页时立即保存
- 底部估算剩余时间：按用户最近 7 天平均阅读速度计算，没有数据时按 200 词/分钟

### 3.4 划词与划句交互

这是本插件的核心体验，单独设计。

**单词**：

1. 双击单词（或单击后按 `W`）→ 在选区附近弹出**单词卡**
2. 单词卡内容：
   - 单词 + 音标 + 发音按钮（词典有音频时）
   - 词性 + 中文释义（来自翻译服务）
   - 1–2 条英文释义（来自免费词典 API）
   - 原文例句（自动截取所在句）
   - 操作：`加入生词本` / `复制` / `在词典中打开`
3. 如果该词已在生词本：按钮变成「已在生词本 · 查看」，并显示当前熟练度

**句子/短语**：

1. 拖选一段文字 → 弹出浮动工具条
2. 工具条：`翻译` / `加入生词本` / `高亮` / `复制`
3. 点「翻译」→ 工具条下方展开译文卡片：原文 + 译文 + 翻译引擎标记 + 「保存到查词历史」（默认自动保存）
4. 超过 2000 字符提示分段选择；翻译请求有 loading 和取消

**弹层行为**：

- 用 Portal 挂到 `document.body`，避免被正文容器裁剪
- 根据选区位置自动上/下翻转，左右不超出视口
- 点击外部、按 Esc、滚动超过阈值自动关闭
- 键盘：`T` 翻译当前选区，`S` 收藏单词，`Esc` 关闭，`←/→` 翻章

**查词实现细节**：

- 不把每个单词包成 `<span>`（十万词级别的章节会卡）
- 用 `document.caretRangeFromPoint` / `caretPositionFromPoint` 取得点击处的文本偏移，再用正则向两侧扩展到单词边界
- 选区文本直接来自 `window.getSelection()`，保留原始标点和大小写
- 单词统一小写去重，保留原文大小写作为展示

### 3.5 生词本

**顶部统计卡**：

- 总词数 / 今日到期 / 本周新增 / 掌握率
- 「开始复习」按钮（跳到练习页，自动带上“今日到期”范围）

**列表**：

- 每行：单词 + 音标 + 中文释义（截断）+ 来源书名 + 状态标签 + 下次复习时间
- 状态：新词 / 学习中 / 复习中 / 已掌握
- 筛选：全部、今日到期、按书、按标签、按状态；搜索框
- 批量选择：标记已掌握、加标签、删除、导出 CSV

**词条详情抽屉**：

- 单词、音标、词性、中英文释义
- 所有上下文卡片：书名 + 章节 + 原句（关键词高亮）+「回到原文」
- 我的笔记（自由文本）
- 标签
- 复习历史：每次评分、间隔变化
- 操作：编辑释义/笔记、重置进度、删除

**去重规则**：

- 按 `lemma`（词元）去重，而不是原形字符串
- 例如 `running` 归一为 `run`，`mice` 归一为 `mouse`
- 同一个词的多个上下文合并到同一条记录，不重复建卡

### 3.6 练习

**生成面板**：

- 范围：今日到期 / 某本书 / 某个标签 / 最近新增 / 全部
- 题量：5 / 10 / 20
- 题型（多选）：
  - 英译中选择题
  - 中译英选择题
  - 例句填空（cloze）
  - 拼写题（给中文和首字母）
  - 语境理解题（给原句，问该词在句中的意思）
- 「生成练习」按钮；生成中显示进度和取消

**答题界面**：

- 顶部进度条（3/10）+ 退出
- 题干区（大字号）
- 选项卡片；选择后立即判定，正确变绿、错误变红并显示正确答案
- 解析区：词义、原句、为什么错
- 底部「下一题」；最后一题「查看结果」

**结果页**：

- 得分、用时、正确/错误数
- 错题列表（词 + 正确答案 + 你的答案 + 解析）
- 「再练错题」/「返回生词本」
- 本次结果写入历史，并按规则更新每个词的 SRS

**无模型兜底**：

- 如果当前没有可用模型，或模型返回的 JSON 不合法：
  - 自动降级为**本地出题器**，至少生成「英译中选择题」和「例句填空题」
  - 界面显示「本次使用本地题库模式」，不阻断练习

### 3.7 历史

三个子标签：

**阅读记录**：

- 顶部：今日阅读时长、本周时长、连续阅读天数、累计查词数
- 12 周阅读热力图（每格一天，颜色深浅按分钟数）
- 时间线：每条 = 书名 + 起止时间 + 时长 + 读了哪几章 + 查词数
- 支持按书筛选、按日期范围筛选

**查词记录**：

- 表格：时间、类型（单词/句子）、原文、译文、来源书/章节
- 搜索、按书筛选
- 点击一条 → 跳到原文位置（如果书还在）
- 右上角「清空查词历史」（二次确认）

**练习记录**：

- 每次练习：时间、范围、题量、得分、用时
- 展开看错题
- 点「再做一次」用同一范围重新生成

### 3.8 设置与同步

**阅读设置**：

- 目标语言（默认简体中文）
- 默认字号、行高、字体、主题
- 每日新词目标（默认 10）
- 每日复习上限（默认 50）
- 阅读时自动保存查词历史（默认开）

**翻译设置**：

- 翻译引擎：自动（优先匿名 Bing/Google，失败时用当前模型）/ Bing / Google / 当前 DeepSeek 模型
- 查词时同时显示英文释义（默认开）
- 翻译超时（默认 15 秒）

**数据管理**：

- 数据目录（只读展示 `$DSH_HOME/novel-reader`）
- 导出备份（zip：state.json + history.json + books/）
- 导入备份（合并或覆盖二选一）
- 清空阅读历史 / 清空查词历史（不动生词本）

**WebDAV 同步**：

- 开关：启用同步
- 服务器地址（示例：`https://dav.example.com/remote.php/dav/files/username/`）
- 远程目录（默认 `novel-reader`）
- 用户名
- 密码 / 应用专用密码（保存后只显示「已配置」，不回显）
- 同步内容：小说文件（开）、生词本与进度（开）、阅读/查词历史（开）
- 自动同步：关闭 / 每 5 分钟 / 每次数据变更后（防抖 30 秒）
- 冲突策略：以更新时间较新者为准（默认）/ 保留双方副本
- 按钮：`测试连接`、`立即同步`
- 状态：上次同步时间、上传/下载文件数、错误详情（可展开）

---

## 4. 数据模型

### 4.1 本地目录

```
$DSH_HOME/novel-reader/
├── state.json                 # 书籍元数据、生词、练习、设置
├── history.json               # 阅读会话、查词、练习记录
├── sync.json                  # 上次同步状态、远端 manifest 缓存
├── backups/                   # 手动导出的 zip
└── books/
    └── bk_<id>/
        ├── meta.json          # 章节表：index / title / wordCount / file
        ├── cover.jpg          # 封面（可选）
        └── chapters/
            ├── 0001.json      # { html, text, sentences[] }
            └── 0002.json
```

### 4.2 `state.json` 结构

```json
{
  "version": 1,
  "deviceId": "dev_xxx",
  "settings": {
    "targetLanguage": "zh-CN",
    "theme": "paper",
    "fontSize": 18,
    "lineHeight": 1.8,
    "fontFamily": "serif",
    "dailyNewWords": 10,
    "dailyReviewLimit": 50,
    "translationEngine": "auto",
    "showEnglishDefinition": true,
    "autoSaveLookups": true
  },
  "books": [
    {
      "id": "bk_xxx",
      "title": "Nineteen Eighty-Four",
      "author": "George Orwell",
      "language": "en",
      "format": "epub",
      "checksum": "sha256:...",
      "bytes": 1234567,
      "cover": "books/bk_xxx/cover.jpg",
      "chapterCount": 24,
      "wordCount": 103000,
      "description": "",
      "tags": ["classic"],
      "addedAt": "2026-11-15T08:00:00.000Z",
      "updatedAt": "2026-11-15T08:00:00.000Z",
      "deletedAt": null
    }
  ],
  "vocab": [
    {
      "id": "vw_xxx",
      "term": "ubiquitous",
      "lemma": "ubiquitous",
      "kind": "word",
      "phonetic": "/juːˈbɪkwɪtəs/",
      "pos": "adj.",
      "definitions": [{ "lang": "en", "text": "present everywhere" }],
      "translations": ["无处不在的"],
      "contexts": [
        {
          "bookId": "bk_xxx",
          "chapterIndex": 3,
          "chapterTitle": "Chapter 4",
          "sentence": "The eyes seemed ubiquitous, watching every corner.",
          "start": 410,
          "end": 420
        }
      ],
      "notes": "",
      "tags": ["book:bk_xxx"],
      "status": "new",
      "srs": {
        "ease": 2.5,
        "intervalDays": 0,
        "dueAt": "2026-11-15T08:00:00.000Z",
        "reps": 0,
        "lapses": 0
      },
      "createdAt": "2026-11-15T08:00:00.000Z",
      "updatedAt": "2026-11-15T08:00:00.000Z",
      "deletedAt": null
    }
  ],
  "quizzes": [
    {
      "id": "qz_xxx",
      "createdAt": "2026-11-15T09:00:00.000Z",
      "scope": { "type": "due", "bookId": null, "tag": null },
      "questionCount": 10,
      "questions": [],
      "status": "active"
    }
  ]
}
```

### 4.3 `history.json` 结构

```json
{
  "version": 1,
  "sessions": [
    {
      "id": "rs_xxx",
      "bookId": "bk_xxx",
      "startedAt": "2026-11-15T08:00:00.000Z",
      "lastHeartbeatAt": "2026-11-15T08:42:00.000Z",
      "endedAt": "2026-11-15T08:42:30.000Z",
      "durationMs": 2550000,
      "startChapter": 2,
      "endChapter": 3,
      "wordsRead": 4200,
      "lookups": 12
    }
  ],
  "lookups": [
    {
      "id": "lk_xxx",
      "kind": "word",
      "text": "ubiquitous",
      "translation": "无处不在的",
      "provider": "bing",
      "bookId": "bk_xxx",
      "chapterIndex": 3,
      "chapterTitle": "Chapter 4",
      "createdAt": "2026-11-15T08:10:00.000Z"
    }
  ],
  "quizAttempts": [
    {
      "id": "qa_xxx",
      "quizId": "qz_xxx",
      "startedAt": "2026-11-15T09:00:00.000Z",
      "endedAt": "2026-11-15T09:07:00.000Z",
      "answers": [
        { "questionId": "q1", "vocabId": "vw_xxx", "choice": 2, "correct": true }
      ],
      "score": 0.8
    }
  ]
}
```

### 4.4 章节文件

```json
{
  "index": 1,
  "title": "Chapter 1",
  "wordCount": 3240,
  "html": "<p>It was a bright cold day in April...</p>",
  "text": "It was a bright cold day in April...",
  "sentences": [
    { "text": "It was a bright cold day in April...", "start": 0 }
  ]
}
```

- `html` 是**服务端清洗后**的 HTML（白名单标签），客户端才允许渲染；
- `text` 用于全文搜索、生词上下文匹配、字数统计；
- `sentences` 用于划句时快速找到完整句子。

### 4.5 版本与迁移

- 每个 JSON 文档带 `version` 字段；
- Host 启动时读取 → 按版本号顺序执行迁移函数 → 写回；
- 写入使用「临时文件 + rename」原子替换，避免断电/崩溃留下半个 JSON；
- 单进程内所有写操作走一条串行队列；跨进程（Desktop 与 Web 同时开）用文件 mtime 检查后重读，检测到外部修改就合并再写；
- `history.json` 超过 20MB 时自动归档最旧的一半到 `backups/history-<date>.json`，避免无限增长。

---

## 5. 后端模块设计

### 5.1 图书导入与解析

**入口**：`POST /novel-reader/api/books/import`，原始文件流 + `x-file-name` / `x-file-type` 头。

**流程**：

1. 校验扩展名与大小（上限 200MB），写入临时文件；
2. 计算 SHA-256，若已存在同 checksum 的书 → 直接返回已有书；
3. 按格式解析：

| 格式 | 解析方式 |
|---|---|
| EPUB | `jszip` 解包 → `META-INF/container.xml` → OPF → manifest/spine → 按 spine 顺序读章节；`fast-xml-parser` 解析 XML；`sanitize-html` 清洗正文 |
| TXT | 编码嗅探（UTF-8 BOM / UTF-16 / 回退 UTF-8）→ 按 `Chapter`、`CHAPTER`、`Part`、`第X章` 等标题切章；找不到标题时按约 4000 词切块 |
| Markdown | 按 `#` / `##` 标题切章；保留基础段落和强调 |

4. 元数据：EPUB 从 OPF 的 `dc:title`、`dc:creator`、`dc:language`、`dc:description` 提取；封面从 `meta name="cover"` 找；TXT 用文件名做书名、首行做作者猜测（可手动改）；
5. 章节规范化：统一段落、去空行、去页眉页脚、统计词数；
6. 写入 `books/<id>/`，把书籍元数据加入 `state.books`；
7. 返回 `{ book, warnings }`，警告如「有 2 章解析失败，已跳过」。

**安全**：

- zip 炸弹防护：限制条目数（≤ 5000）、单条目解压后大小（≤ 20MB）、总解压大小（≤ 500MB）、压缩比（≤ 100:1）；
- 路径穿越防护：EPUB 内部路径只允许相对路径，拒绝 `..`；
- HTML 白名单：`p, div, br, h1-h6, em, strong, i, b, u, blockquote, ul, ol, li, hr, sup, sub`；去掉脚本、样式、事件属性、外链资源。

### 5.2 翻译与词典

**翻译**：

- 主通道：`ctx.translator`
  - `resolve({ text, targetLanguage: 'zh-CN', sourceLanguage: 'en' })`
  - 默认匿名 Bing（无需登录、无需 Key），可切 Google
  - 超时 15 秒，失败重试 1 次
- 备用通道：当前模型（`agentDefaultModel` + `ctx.llm`），用固定提示“只返回译文”；
- 缓存：`history.lookups` 中按 `text + targetLanguage` 查最近 30 天结果，命中直接返回；
- 长文本：超过 4000 字符（translator 上限）先按句子切块，逐块翻译后拼接；单次界面选择限制 2000 字符。

**词典**：

- 免费接口 `https://api.dictionaryapi.dev/api/v2/entries/en/<word>`（Host 侧请求，避开浏览器 CORS）；
- 取第一条释义的词性、音标、英文释义、音频 URL；
- 结果缓存到内存 LRU（500 条）+ `state` 的词典缓存（可选，默认只内存）；
- 接口不可用时：只显示翻译服务给出的中文释义，不阻断查词。

**词元归一**：

- 使用 `wink-lemmatizer`（纯 JS，小依赖）处理常见屈折变化；
- 失败时回退到简单规则（-s、-es、-ed、-ing、-er、-est）；
- 专有名词、短语不做词元化，按原样保存。

### 5.3 生词本与间隔复习（SRS）

**状态机**：

```
new → learning → review → mastered
        ↑          │
        └── again ─┘
```

**简化 SM-2 规则**：

| 评分 | 间隔变化 | ease |
|---|---|---|
| Again | 10 分钟后重来；lapses +1 | -0.20（最低 1.3） |
| Hard | `max(1, interval × 1.2)` | -0.05 |
| Good | `max(1, interval × ease)` | 不变 |
| Easy | `max(2, interval × ease × 1.3)` | +0.15 |

- 初始 `ease = 2.5`，`interval = 0`；
- `interval >= 60` 天且连续 3 次 Good/Easy → 自动标记 `mastered`；
- 练习答对 = Good，答错 = Again；
- 用户可手动「标记已掌握」或「重置进度」。

### 5.4 练习生成

**输入**：范围（due / book / tag / recent / all）、题量、题型。

**主路径（LLM）**：

1. 从 `state.vocab` 取最多 30 个词条，附带：term、lemma、translations、definitions、第一条 context sentence；
2. 调用当前默认模型（`ctx.llm`），要求只输出 JSON 数组；
3. 每道题结构：

```json
{
  "id": "q1",
  "vocabId": "vw_xxx",
  "type": "meaning-en-zh",
  "prompt": "ubiquitous 最接近的意思是？",
  "options": ["无处不在的", "短暂的", "稀有的", "古老的"],
  "answer": 0,
  "explanation": "ubiquitous 意为“present everywhere”，即无处不在。",
  "source": { "bookId": "bk_xxx", "chapterIndex": 3 }
}
```

4. Host 侧校验：
   - `vocabId` 必须来自本次范围；
   - `answer` 必须在 `options` 范围内；
   - 选项 2–4 个且不重复；
   - 不合法 → 重试一次；仍失败 → 丢弃该题；
5. 有效题数不足时，用本地出题器补足。

**本地出题器（兜底）**：

- 英译中选择题：正确项 = 该词第一条中文翻译；干扰项 = 同范围其他词的中文翻译随机 3 个；
- 中译英选择题：正确项 = term；干扰项 = 同范围其他 term；
- 例句填空：取 context 句子，把 term 替换为 `____`，选项为 4 个英文单词；
- 拼写题：给中文释义 + 首字母 + 长度，输入答案。

**保存**：生成的 quiz 完整快照存入 `state.quizzes`，即使用户之后改了生词本，这次练习仍能作答。

### 5.5 阅读历史

- **会话开始**：打开阅读器 → `POST /history/session/start`（bookId、chapterIndex）；
- **心跳**：每 30 秒一次（`visibilitychange` 隐藏时暂停）；Host 只在内存累计，不每次写盘；
- **结束**：关闭阅读器 / 切书 / 页面卸载 → `POST /history/session/end`；超过 5 分钟没有心跳的会话视为结束；
- **阅读量**：按章节 wordCount × 进度差估算；
- **查词计数**：每次 `/translate` 成功 +1，写入对应会话（若会话存在）；
- **查询**：`GET /history?type=reading|lookup|quiz&from=&to=&bookId=`。

### 5.6 WebDAV 同步

**远端目录结构**（与本地一致）：

```
<远程目录>/
├── manifest.json
├── state.json
├── history.json
└── books/
    └── bk_<id>/
        ├── meta.json
        ├── cover.jpg
        └── chapters/*.json
```

**`manifest.json`**：

```json
{
  "schema": 1,
  "deviceId": "dev_xxx",
  "updatedAt": "2026-11-15T09:00:00.000Z",
  "files": {
    "state.json": { "hash": "sha256:...", "bytes": 12345 },
    "history.json": { "hash": "sha256:...", "bytes": 67890 },
    "books/bk_xxx/meta.json": { "hash": "sha256:...", "bytes": 1234 }
  }
}
```

**首次同步**：

1. `PROPFIND Depth: 0` 测试远程目录是否存在；
2. 不存在 → 逐级 `MKCOL` 创建；
3. PUT `manifest.json` 之外的本地文件；
4. 最后 PUT `manifest.json`。

**增量同步（双向）**：

1. GET 远端 `manifest.json`（404 → 走首次同步）；
2. 对比本地和远端的文件 hash：
   - 只有本地有 → 上传；
   - 只有远端有 → 下载；
   - 都有且 hash 相同 → 跳过；
   - 都有且不同 → 进入**合并**：
     - `state.json`：按记录 id + `updatedAt` 合并（books / vocab / quizzes），`deletedAt` 墓碑优先；
     - `history.json`：按 id 求并集（append-only，天然可合并）；
     - 书籍文件：内容不可变，按 checksum 判断；同 id 不同 checksum 时保留两份（旧的改名 `bk_xxx-conflict-<date>`）；
3. 合并结果写回本地（原子写），再上传变更文件；
4. 最后更新 `manifest.json` 和 `sync.json`。

**冲突策略**：

- 默认「较新者胜」：记录级 `updatedAt` 比较；
- 「保留双方副本」：对冲突的生词条目生成 `xxx (conflict 2026-11-15)` 副本，不丢数据；
- 书籍文件不合并正文，只按 checksum 识别同一本书。

**触发时机**：

- 手动「立即同步」；
- 图书导入完成后；
- 关闭阅读器后（延迟 5 秒）；
- 自动同步：每 5 分钟检查一次，只有在有变更时才真正传输。

**实现要点**：

- Host 用 Node 原生 `fetch` 实现 WebDAV 客户端：`PROPFIND` / `MKCOL` / `GET` / `PUT` / `DELETE` / `HEAD`；
- Basic Auth：`Authorization: Basic base64(username:password)`；
- 密码通过 `ctx.credentials` 的 `api-key` 记录保存，key 为 `novel-reader/webdav`，不进 `state.json`，不回传客户端；
- 每个请求 20 秒超时，网络错误重试 2 次（指数退避）；
- 只支持 HTTPS（HTTP 给出警告）；自签名证书和 Digest 认证 v1 不支持，在设置页明确提示；
- 同步过程加进程内锁，避免重复同步；UI 显示实时日志（已上传 x / 已下载 y / 跳过 z）。

### 5.7 鉴权与安全

- 每个 HTTP 请求先调用 `ctx.connection.requestRejection({ headers: req.headers })`；返回 401/403 直接拒绝；
- 写操作额外检查 `sec-fetch-site`，只接受 `same-origin` / `none`；
- 所有路径参数只接受内部 id（`bk_` / `vw_` / `qz_` 前缀 + 安全字符），不接受任意文件路径；
- 上传文件大小上限 200MB，JSON 请求体上限 4MB；
- EPUB 正文必须经过 `sanitize-html` 白名单清洗后才返回客户端；
- WebDAV 密码只存在 `ctx.credentials`，前端只看到 `configured: true`；
- 不在日志中打印完整翻译文本、密码、WebDAV Authorization 头。

---

## 6. API 设计

所有接口前缀 `/novel-reader/api`，JSON 请求/响应；图片走 `/novel-reader/books/<id>/cover`。

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/state` | 书架、生词统计、设置、同步状态 |
| GET | `/books/:id` | 书籍详情 + 章节目录 |
| GET | `/books/:id/chapters/:index` | 单章内容 |
| POST | `/books/import` | 上传并导入图书（原始文件流） |
| PATCH | `/books/:id` | 编辑书名/作者/描述/标签/封面 |
| DELETE | `/books/:id` | 软删除（墓碑） |
| GET | `/books/:id/cover` | 封面图片 |
| POST | `/translate` | 单词/句子翻译 + 词典信息 |
| GET | `/vocab` | 生词列表（筛选/分页） |
| POST | `/vocab` | 新增生词（含上下文） |
| PATCH | `/vocab/:id` | 修改笔记/标签/状态 |
| DELETE | `/vocab/:id` | 软删除 |
| POST | `/vocab/:id/review` | 提交一次复习评分（again/hard/good/easy） |
| POST | `/quiz/generate` | 按范围生成练习 |
| GET | `/quiz/:id` | 获取练习快照 |
| POST | `/quiz/:id/answer` | 提交单题答案 |
| POST | `/quiz/:id/finish` | 结束并结算 |
| GET | `/history` | 阅读/查词/练习历史 |
| POST | `/history/session/start` | 开始阅读会话 |
| POST | `/history/session/heartbeat` | 阅读心跳 |
| POST | `/history/session/end` | 结束阅读会话 |
| GET | `/stats` | 阅读统计、热力图数据 |
| GET | `/settings` | 读取设置（不含密码） |
| PATCH | `/settings` | 保存设置 |
| POST | `/sync/test` | 测试 WebDAV 连接 |
| POST | `/sync/run` | 立即同步 |
| GET | `/sync/status` | 同步状态与日志 |
| POST | `/backup/export` | 导出 zip |
| POST | `/backup/import` | 导入 zip |

**统一响应格式**：

```json
{ "ok": true, "data": {} }
{ "ok": false, "error": { "code": "BOOK_PARSE_FAILED", "message": "第 3 章解析失败" } }
```

错误码：`UNAUTHORIZED`、`BOOK_NOT_FOUND`、`BOOK_PARSE_FAILED`、`UNSUPPORTED_FORMAT`、`TRANSLATION_FAILED`、`MODEL_UNAVAILABLE`、`QUIZ_INVALID`、`SYNC_FAILED`、`SYNC_CONFLICT`、`INVALID_INPUT`。

---

## 7. 前端设计

### 7.1 槽位注册

```text
ctx.slots.register({
  name: 'main',
  key: 'novel-reader',
  locale: 'novel-reader'
}, NovelReaderApp)

ctx.slots.register({
  name: 'sidebar.panellist',
  id: 'novel-reader',
  order: 50,
  label: () => t('nav'),
  locale: 'novel-reader'
}, BookIcon)
```

- 侧栏图标的 `id` 必须与 `main` 的 key 一致，点击后由宿主自动切换到对应主面板；
- 图标使用内联 SVG（书本/书签造型），尺寸由 `owner.size` 决定，激活态由 `owner.active` 控制；
- `dsh.client` 声明 `platform: 'web'`、`immediately: true`，保证启动后侧栏图标立即可见；
- `inject` 声明依赖 `@deepseek-ai/dsh-client-locale`、`@deepseek-ai/dsh-client-ui-theme`、`@deepseek-ai/dsh-client-ui-layout`，仅用于激活顺序。

### 7.2 组件拆分

| 组件 | 职责 |
|---|---|
| `NovelReaderApp` | 顶层：导航状态、路由（书架/阅读器/生词本/练习/历史/设置）、全局数据加载 |
| `LibraryView` | 书架网格、继续阅读、导入入口 |
| `BookDetailDrawer` | 书籍详情、章节目录、数据面板 |
| `ReaderView` | 阅读器布局、章节加载、进度保存、排版面板 |
| `ChapterContent` | 正文渲染、点击/选区事件、位置恢复 |
| `SelectionPopover` | 单词卡/句子翻译卡、加入生词本 |
| `VocabView` | 生词列表、筛选、批量操作 |
| `VocabDetailDrawer` | 词条详情、上下文、笔记、复习历史 |
| `PracticeView` | 生成面板、答题器、结果页 |
| `HistoryView` | 阅读/查词/练习三个标签 + 热力图 |
| `SettingsView` | 阅读/翻译/数据/WebDAV 设置 |
| `SyncBadge` | 顶部同步状态与进度 |
| `Toast` / `ConfirmDialog` | 轻提示、二次确认 |

### 7.3 主题与字体

- 所有容器、文字、边框使用 `--dsw-alias-*` token，跟随 DSH 明暗主题；
- 阅读区提供「纸张 / 暖黄 / 夜间」三种阅读主题，但只覆盖阅读区背景和正文颜色，不修改全局主题；
- 字体：
  - 正文默认 `Georgia, 'Times New Roman', serif`（英文小说阅读舒适）；
  - 无衬线选项 `-apple-system, 'Segoe UI', sans-serif`；
  - 字号和行高存到 `state.settings`，跨会话保持；
- 不使用外部 UI 组件库；按钮、开关、下拉、弹层按 DSH 现有控件样式手写，类名统一 `nr-` 前缀；
- 弹层使用 `role="dialog"`，Esc 关闭，焦点回到触发元素；开关使用 `role="switch"` + `aria-checked`。

### 7.4 性能

- 章节按需加载：进入章节只 fetch 当前章，预取下一章；
- 生词列表 > 500 条时做简单窗口化（只渲染可视区附近的行）；
- 翻译请求带 300ms 防抖；同一文本 5 秒内重复请求复用；
- 进度写入 1.5 秒防抖；心跳 30 秒；
- 大 state（> 2000 生词）首次加载只返回统计和分页数据，列表按需请求。

---

## 8. 打包与安装

### 8.1 包结构

```
novel-reader/
├── package.json
├── cordis.patch.yml
├── index.js                    # Host 入口（apply）
├── src/
│   ├── store.js                # JSON 存储、原子写、迁移
│   ├── library.js              # 导入、EPUB/TXT/MD 解析
│   ├── dictionary.js           # 词典 API、词元归一
│   ├── translate.js            # translator + LLM 兜底
│   ├── vocab.js                # 生词 CRUD、SRS
│   ├── quiz.js                 # LLM 出题 + 本地出题器
│   ├── history.js              # 会话、查词、统计
│   ├── sync.js                 # WebDAV 客户端与合并
│   └── routes.js               # HTTP 路由分发
├── client/
│   └── client.js               # 构建产物（模块加载器工厂）
├── src-client/                 # JSX 源码
│   ├── index.jsx
│   ├── app.jsx
│   ├── views/...
│   └── components/...
├── scripts/
│   └── build-client.mjs        # esbuild 打包 React JSX
├── locale/
│   ├── zh.json
│   └── en.json
├── docs/
│   └── DETAIL.md
├── icon.svg
└── README.md
```

### 8.2 依赖

| 依赖 | 用途 | 说明 |
|---|---|---|
| `jszip` | 解压 EPUB | 纯 JS，Node 端使用 |
| `fast-xml-parser` | 解析 container.xml / OPF / NCX | 纯 JS |
| `sanitize-html` | 清洗 EPUB 正文 | 白名单标签 |
| `wink-lemmatizer` | 英文词元归一 | 纯 JS，体积小 |
| `esbuild`（dev） | 打包 Client JSX | 只在开发时使用 |

- Host 包 `"type": "module"`，入口 `index.js` 导出 `apply(ctx)`；
- Client 构建产物必须包成：

```text
window.__ModuleLoader__.load({
  id: '@local/dsh-novel-reader',
  factory(require) {
    const React = require('react')
    // ... 打包后的组件代码 ...
    return { inject: ['slots', 'locale', 'theme'], apply(ctx) { ... } }
  }
})
```

- 构建脚本用 esbuild 将 `src-client/index.jsx` 打成 CJS，`react` 标记为 external，外面套上上面的壳；`client/client.js` 提交到包内，安装时不需要现场构建。

### 8.3 清单、本地化、图标

`package.json` 关键字段：

```json
{
  "name": "@local/dsh-novel-reader",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "index.js",
  "exports": {
    ".": "./index.js",
    "./client": "./client/client.js",
    "./locale/*.json": "./locale/*.json",
    "./icon": "./icon.svg"
  },
  "files": [
    "index.js", "src", "client", "locale", "docs", "icon.svg",
    "cordis.patch.yml", "README.md"
  ],
  "dsh": {
    "bundle": { "patch": "./cordis.patch.yml" },
    "client": {
      "platform": "web",
      "immediately": true,
      "inject": [
        "@deepseek-ai/dsh-client-locale",
        "@deepseek-ai/dsh-client-ui-theme",
        "@deepseek-ai/dsh-client-ui-layout"
      ]
    }
  }
}
```

`locale/zh.json`：

```json
{
  "meta": {
    "title": "Novel Reader",
    "description": "英文小说阅读器：划词翻译、生词本、练习与 WebDAV 同步。",
    "detail": "docs/DETAIL.md"
  },
  "nav": "阅读"
}
```

`locale/en.json` 对应英文文案；`docs/DETAIL.md` 写功能说明、使用方式、限制（DRM、PDF、WebDAV 认证范围）。

### 8.4 安装与验证

1. 用 `plugin_manager` 的 `install_bundle` 安装本地目录（绝对路径）；
2. 确认返回 `application: applied`，插件列表出现「Novel Reader」；
3. 刷新页面，侧栏出现「阅读」图标；
4. 进入书架，导入一本 Project Gutenberg 的 EPUB，确认章节/封面/字数；
5. 阅读、划词、翻译、收藏、生成练习、同步逐项验证（见 §10）。

---

## 9. 实施阶段

### M0 · 骨架与书架（先跑通最小闭环）

- [ ] bundle 骨架、`main` + `sidebar.panellist` 注册、中英文案、图标
- [ ] `state.json` / `history.json` 存储层与原子写
- [ ] 图书导入（TXT / MD 先跑通，EPUB 随后）
- [ ] EPUB 解析（jszip + OPF + sanitize-html）
- [ ] 书架网格、书籍详情、章节列表
- [ ] 阅读器渲染章节、上下章、进度保存/恢复

**验收**：导入 1 本 EPUB 和 1 本 TXT，能看到封面、目录、字数；读 2 章后刷新回到原段落。

### M1 · 划词、翻译、生词本、历史

- [ ] 单词点击/双击识别、选区弹层
- [ ] 词典 API + translator 接入
- [ ] 生词本 CRUD、上下文、去重、标签、笔记
- [ ] 查词历史、阅读会话、心跳、统计
- [ ] 生词本页面、历史页面

**验收**：选中单词 2 秒内出释义；加入生词本后能在词条里看到原句并跳回；查词历史有记录；阅读时长统计正确。

### M2 · 练习与 SRS

- [ ] SRS 算法、复习入口
- [ ] LLM 出题 + JSON 校验
- [ ] 本地出题器兜底
- [ ] 答题器、判分、结果页、错题回顾
- [ ] 练习历史、错题影响 SRS

**验收**：从 20 个生词生成 10 道题，全部可作答；断网/无模型时仍能生成至少 5 道本地题；答错后该词 dueAt 提前。

### M3 · WebDAV 同步与备份

- [ ] WebDAV 客户端（PROPFIND/MKCOL/PUT/GET/DELETE）
- [ ] 凭据保存、连接测试
- [ ] manifest、增量对比、记录级合并
- [ ] 自动同步、同步状态 UI
- [ ] zip 备份导出/导入

**验收**：两台设备（或两个数据目录）通过同一 WebDAV 完成首次上传、第二次下载、双方新增生词后合并；删除的书不会“复活”；断网时本地操作不受影响，恢复后补传。

### M4 · 打磨与增强

- [ ] 阅读主题、排版、专注模式、快捷键
- [ ] 书籍数据面板（生词密度、阅读时长、覆盖率）
- [ ] Agent 工具（可选）：`novel_library` / `novel_vocab` / `novel_quiz`
- [ ] 导出 Anki CSV（可选）
- [ ] 响应式布局、空状态、错误提示

**验收**：明暗主题下 UI 一致；无控制台报错；移动窄屏可用；整体体验 review 通过。

---

## 10. 验收清单

### 功能

- [ ] EPUB / TXT / Markdown 导入成功，元数据、封面、章节正确
- [ ] 重复导入同一本书被识别（checksum 去重）
- [ ] 阅读进度精确恢复（章节 + 段落）
- [ ] 单词卡显示音标、中文释义、英文释义、例句
- [ ] 句子翻译正确显示，长句可分段
- [ ] 加入生词本后，词条含原句、书名、章节
- [ ] 生词按 lemma 去重，不重复建卡
- [ ] 今日到期数量正确，复习后 dueAt 正确变化
- [ ] 练习生成成功，题目结构合法，答案可判分
- [ ] 无模型时本地出题器可用
- [ ] 阅读/查词/练习历史均可查询
- [ ] WebDAV 测试连接、首次上传、双向合并、冲突副本正确
- [ ] 备份导出/导入可完整恢复

### 安全与稳定性

- [ ] 未登录/跨站请求被拒绝（401/403）
- [ ] 路径参数不能穿越目录
- [ ] EPUB zip 炸弹/超大文件被拒绝
- [ ] 正文 HTML 无脚本、无事件属性
- [ ] WebDAV 密码不出现在 `state.json`、HTTP 响应、日志
- [ ] 写入原子性：模拟进程中断后 JSON 仍可解析
- [ ] 同步中断不会破坏本地数据

### UI/UX

- [ ] 侧栏图标与主面板联动正常
- [ ] 明暗主题、三种阅读主题显示正常
- [ ] 弹层不被裁剪、不超出视口、Esc 可关
- [ ] 空状态、loading、错误状态都有明确提示
- [ ] 键盘快捷键可用（T/S/Esc/←/→）
- [ ] 窄屏（约 1024px）布局不崩

---

## 11. 风险与对策

| 风险 | 影响 | 对策 |
|---|---|---|
| EPUB 结构千差万别 | 解析失败/章节乱序 | 以 spine 为准；失败章节跳过并提示；提供“重新解析”和手动编辑章节 |
| 匿名翻译接口不稳定/限流 | 查词失败 | 默认缓存 + 失败重试 + 可切当前模型兜底；UI 明确显示引擎与失败原因 |
| 词典 API 在国内可能慢 | 查词卡顿 | Host 侧 2.5 秒超时；超时只显示翻译，不阻塞弹层 |
| LLM 出题 JSON 不合法 | 练习生成失败 | 严格校验 + 重试一次 + 本地出题器兜底 |
| WebDAV 服务商差异（Digest、自签证书） | 同步失败 | v1 明确只支持 HTTPS + Basic；设置页给出错误说明；后续按需扩展 |
| 双向同步冲突 | 数据覆盖 | 记录级 `updatedAt` 合并 + 墓碑 + 可选冲突副本；先写本地再上传 |
| 大书/大生词本性能 | 页面卡顿 | 章节懒加载、列表窗口化、state 分页、历史归档 |
| 正文 HTML XSS | 安全风险 | 服务端 `sanitize-html` 白名单；客户端只渲染服务端清洗后的 HTML |
| 数据目录被用户误删 | 数据丢失 | 设置页提供导出备份；WebDAV 自动同步；启动时检测目录并提示 |

---

## 12. 需要你确认的几个选择

以下是我建议的默认值，确认后按此实现；不改也能按默认走。

1. **图书格式**：默认支持 `EPUB + TXT + Markdown`。PDF / MOBI / AZW3 本期不做。你主要看 EPUB 还是 TXT？
2. **翻译引擎**：默认「自动 = 匿名 Bing/Google 优先，失败时用当前 DeepSeek 模型」。如果你更在意准确度、愿意消耗 token，可以默认用模型。
3. **WebDAV 服务商**：默认按标准 Basic Auth + HTTPS 实现，适配 Nextcloud、坚果云、群晖等。你用的是哪一家？如果有 Digest 认证或自签证书，需要单独适配。
4. **练习题型**：默认「英译中选择题 + 中译英选择题 + 例句填空 + 拼写题」。是否需要朗读/听力题？（需要额外 TTS，本期默认不做）

另外两个可选项，也请一并告诉我：

5. 是否需要 **Agent 工具**（在对话里让 AI 查生词、按生词本出题、查阅读进度）？建议做，作为 M4。
6. 界面语言：默认跟随 DSH 当前语言（中文/英文），可切换。是否需要只做中文？

---

## 附：方案边界说明

- 本方案基于当前运行实例的接口探测结果，正式实现时会以 `cordis_inspect_query` 的实时结果为准；
- 不引入独立后端服务、不修改 DSH 源码、不替换 Web 应用根节点；
- 所有插件代码打包为一个本地 bundle，安装后通过 DSH 插件管理器启用/禁用；
- 数据默认只存在本机 `$DSH_HOME/novel-reader`，WebDAV 是可选同步，不是依赖。

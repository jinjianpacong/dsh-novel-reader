import { posix } from 'node:path'
import { join } from 'node:path'
import { readFile, writeFile } from 'node:fs/promises'
import JSZip from 'jszip'
import { XMLParser } from 'fast-xml-parser'
import sanitizeHtml from 'sanitize-html'
import { extOf, newId, nowIso, safeFileName, sha256 } from './util.js'

const ALLOWED_TAGS = [
  'p', 'div', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'em', 'strong', 'i', 'b', 'u', 'blockquote', 'ul', 'ol', 'li',
  'hr', 'sup', 'sub', 'span',
]

const XML = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  removeNSPrefix: true,
  trimValues: true,
  parseTagValue: false,
})

function first(value) {
  return Array.isArray(value) ? value[0] : value
}

function textOf(value) {
  if (value === undefined || value === null) return ''
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number') return String(value)
  if (Array.isArray(value)) return textOf(value[0])
  if (typeof value === 'object') return textOf(value['#text'] ?? value.text ?? '')
  return ''
}

function decodeEntities(text) {
  return String(text)
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
}

export function htmlToText(html) {
  const withBreaks = String(html)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, '\n\n')
    .replace(/<li[^>]*>/gi, '• ')
  const withoutTags = withBreaks.replace(/<[^>]+>/g, '')
  return decodeEntities(withoutTags)
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function countWords(text) {
  const matches = String(text).match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g)
  return matches ? matches.length : 0
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function sanitizeChapter(html) {
  return sanitizeHtml(String(html), {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {},
    disallowedTagsMode: 'discard',
    nonTextTags: ['style', 'script', 'textarea', 'option', 'noscript'],
  })
}

function titleFromHtml(html, fallback) {
  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)
  if (title && htmlToText(title[1]).trim()) return htmlToText(title[1]).trim().slice(0, 120)
  const heading = /<h([1-3])[^>]*>([\s\S]*?)<\/h\1>/i.exec(html)
  if (heading) {
    const text = htmlToText(heading[2]).trim()
    if (text) return text.slice(0, 120)
  }
  return fallback
}

function cleanChapterText(text) {
  return String(text)
    .replace(/\r\n?/g, '\n')
    .replace(/[\u00a0\u200b]/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function textToHtml(text) {
  return cleanChapterText(text)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
    .join('\n')
}

function inlineMarkdown(text) {
  let value = escapeHtml(text).replace(/\n/g, '<br>')
  value = value.replace(/`([^`]+)`/g, '<code>$1</code>')
  value = value.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
  value = value.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  value = value.replace(/__([^_]+)__/g, '<strong>$1</strong>')
  value = value.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
  value = value.replace(/(^|[^_])_([^_\n]+)_/g, '$1<em>$2</em>')
  value = value.replace(/~~([^~]+)~~/g, '<del>$1</del>')
  return value
}

export function markdownToHtml(markdown) {
  const text = cleanChapterText(markdown)
  const lines = text.split('\n')
  const out = []
  const isBlockStart = (line) => /^(#{1,6}\s+|>\s?|```|[-*+]\s+|\d+[.)]\s+|(\s*)([-*_])(?:\s*\2){2,}\s*$)/.test(line)
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) { i += 1; continue }

    if (/^```/.test(line)) {
      i += 1
      const code = []
      while (i < lines.length && !/^```/.test(lines[i])) { code.push(lines[i]); i += 1 }
      if (i < lines.length) i += 1
      out.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`)
      continue
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line)
    if (heading) {
      const level = Math.min(6, heading[1].length)
      out.push(`<h${level}>${inlineMarkdown(heading[2].trim())}</h${level}>`)
      i += 1
      continue
    }

    if (/^\s*([-*_])(?:\s*\1){2,}\s*$/.test(line)) {
      out.push('<hr>')
      i += 1
      continue
    }

    if (/^>\s?/.test(line)) {
      const quote = []
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quote.push(lines[i].replace(/^>\s?/, ''))
        i += 1
      }
      out.push(`<blockquote><p>${inlineMarkdown(quote.join('\n'))}</p></blockquote>`)
      continue
    }

    const listMatch = /^\s*([-*+]|\d+[.)])\s+/.exec(line)
    if (listMatch) {
      const ordered = /\d/.test(listMatch[1])
      const items = []
      while (i < lines.length) {
        const item = /^\s*([-*+]|\d+[.)])\s+(.*)$/.exec(lines[i])
        if (!item) break
        items.push(`<li>${inlineMarkdown(item[2].trim())}</li>`)
        i += 1
      }
      out.push(`<${ordered ? 'ol' : 'ul'}>${items.join('')}</${ordered ? 'ol' : 'ul'}>`)
      continue
    }

    const paragraph = []
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) {
      paragraph.push(lines[i])
      i += 1
    }
    if (!paragraph.length) { paragraph.push(line); i += 1 }
    out.push(`<p>${inlineMarkdown(paragraph.join('\n'))}</p>`)
  }
  return out.join('\n')
}

function decodeText(buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    return new TextDecoder('utf-8').decode(buffer.subarray(3))
  }
  if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
    return new TextDecoder('utf-16le').decode(buffer.subarray(2))
  }
  if (buffer.length >= 2 && buffer[0] === 0xfe && buffer[1] === 0xff) {
    return new TextDecoder('utf-16be').decode(buffer.subarray(2))
  }
  return new TextDecoder('utf-8', { fatal: false }).decode(buffer)
}

function splitByHeadings(text) {
  const lines = text.split('\n')
  const headingPatterns = [
    /^(?:chapter|part|book|section)\s+(?:[ivxlcdm]+|\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\b.*$/i,
    /^第[一二三四五六七八九十百千零两\d]+[章回节卷部篇].*$/,
  ]
  const hits = []
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim()
    if (line.length > 0 && line.length <= 80 && headingPatterns.some((pattern) => pattern.test(line))) {
      hits.push({ index: i, title: line })
    }
  }
  if (hits.length < 2) return null
  const chapters = []
  const preface = lines.slice(0, hits[0].index).join('\n').trim()
  if (countWords(preface) > 120) chapters.push({ title: 'Preface', text: preface })
  for (let i = 0; i < hits.length; i += 1) {
    const start = hits[i].index + 1
    const end = i + 1 < hits.length ? hits[i + 1].index : lines.length
    const body = lines.slice(start, end).join('\n').trim()
    if (countWords(body) > 20) chapters.push({ title: hits[i].title, text: body })
  }
  return chapters.length >= 2 ? chapters : null
}

function splitByWordBudget(text, budget = 4200) {
  const paragraphs = cleanChapterText(text).split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
  const chapters = []
  let current = []
  let words = 0
  for (const paragraph of paragraphs) {
    const count = countWords(paragraph)
    if (current.length && words + count > budget) {
      chapters.push({ title: `Part ${chapters.length + 1}`, text: current.join('\n\n') })
      current = []
      words = 0
    }
    current.push(paragraph)
    words += count
  }
  if (current.length) chapters.push({ title: `Part ${chapters.length + 1}`, text: current.join('\n\n') })
  return chapters
}

async function parseEpub(buffer) {
  const zip = await JSZip.loadAsync(buffer)
  const containerFile = zip.file('META-INF/container.xml')
  if (!containerFile) throw new Error('EPUB 缺少 META-INF/container.xml')
  const container = XML.parse(await containerFile.async('string'))
  const rootfile = first(container?.container?.rootfiles?.rootfile)
  const opfPath = rootfile?.['@_full-path']
  if (!opfPath) throw new Error('EPUB 找不到 OPF 文件')
  const opfFile = zip.file(opfPath)
  if (!opfFile) throw new Error('EPUB 的 OPF 文件不存在')
  const opf = XML.parse(await opfFile.async('string'))?.package
  if (!opf) throw new Error('EPUB 的 OPF 解析失败')

  const metadata = opf.metadata ?? {}
  const title = textOf(metadata['dc:title'] ?? metadata.title) || ''
  const author = textOf(metadata['dc:creator'] ?? metadata.creator) || ''
  const language = textOf(metadata['dc:language'] ?? metadata.language) || 'en'
  const description = textOf(metadata['dc:description'] ?? metadata.description) || ''

  const items = Array.isArray(opf.manifest?.item) ? opf.manifest.item : [opf.manifest?.item].filter(Boolean)
  const byId = new Map(items.map((item) => [item['@_id'], item]))
  const spineRefs = Array.isArray(opf.spine?.itemref) ? opf.spine.itemref : [opf.spine?.itemref].filter(Boolean)

  const chapters = []
  const warnings = []
  for (let i = 0; i < spineRefs.length; i += 1) {
    const idref = spineRefs[i]['@_idref']
    const item = byId.get(idref)
    if (!item) continue
    const mediaType = String(item['@_media-type'] ?? '')
    if (!/html|xhtml/i.test(mediaType)) continue
    const href = String(item['@_href'] ?? '')
    if (!href) continue
    if (/nav|toc/i.test(item['@_properties'] ?? '') || /(^|\/)(nav|toc)\.x?html?$/i.test(href)) continue
    const path = posix.normalize(posix.join(posix.dirname(opfPath), decodeURIComponent(href)))
    const file = zip.file(path)
    if (!file) {
      warnings.push(`缺少章节文件：${href}`)
      continue
    }
    try {
      const raw = await file.async('string')
      const chapterTitle = titleFromHtml(raw, `Chapter ${chapters.length + 1}`)
      const body = /<body[^>]*>([\s\S]*?)<\/body>/i.exec(raw)
      let bodyHtml = body ? body[1] : raw
      const firstHeading = /^\s*<h[12][^>]*>([\s\S]*?)<\/h[12]>/i.exec(bodyHtml)
      if (firstHeading && htmlToText(firstHeading[1]).trim() === chapterTitle) bodyHtml = bodyHtml.slice(firstHeading[0].length)
      const clean = sanitizeChapter(bodyHtml)
      const text = htmlToText(clean)
      if (countWords(text) < 5) continue
      chapters.push({
        title: chapterTitle,
        html: clean,
        text,
      })
    } catch (error) {
      warnings.push(`第 ${i + 1} 个章节解析失败：${error.message}`)
    }
  }
  if (!chapters.length) throw new Error('EPUB 中没有可读取的章节')

  let cover = null
  const coverItem = items.find((item) => String(item['@_properties'] ?? '').split(/\s+/).includes('cover-image'))
  let coverId = coverItem?.['@_id']
  if (!coverId) {
    const metas = Array.isArray(metadata.meta) ? metadata.meta : [metadata.meta].filter(Boolean)
    const coverMeta = metas.find((meta) => meta?.['@_name'] === 'cover')
    coverId = coverMeta?.['@_content']
  }
  if (coverId) {
    const item = byId.get(coverId)
    if (item) {
      const path = posix.normalize(posix.join(posix.dirname(opfPath), decodeURIComponent(String(item['@_href'] ?? ''))))
      const file = zip.file(path)
      if (file) {
        const ext = extOf(path) || 'jpg'
        cover = { buffer: await file.async('nodebuffer'), ext }
      }
    }
  }

  return { format: 'epub', title, author, language, description, chapters, cover, warnings }
}

function parsePlain(buffer, format) {
  const text = cleanChapterText(decodeText(buffer))
  if (!text) throw new Error('文件是空的')
  let chapters = null
  if (format === 'md') {
    const lines = text.split('\n')
    const headings = []
    for (let i = 0; i < lines.length; i += 1) {
      if (/^#{1,3}\s+\S/.test(lines[i])) headings.push({ index: i, title: lines[i].replace(/^#{1,3}\s+/, '').trim() })
    }
    if (headings.length >= 2) {
      chapters = []
      const preface = lines.slice(0, headings[0].index).join('\n').trim()
      if (countWords(preface) > 120) chapters.push({ title: 'Preface', text: preface })
      for (let i = 0; i < headings.length; i += 1) {
        const start = headings[i].index + 1
        const end = i + 1 < headings.length ? headings[i + 1].index : lines.length
        const body = lines.slice(start, end).join('\n').trim()
        if (countWords(body) > 20) chapters.push({ title: headings[i].title, text: body })
      }
    } else if (headings.length === 1) {
      const body = lines.slice(headings[0].index + 1).join('\n').trim()
      if (countWords(body) > 20) chapters = [{ title: headings[0].title, text: body }]
    }
  }
  if (!chapters) chapters = splitByHeadings(text)
  if (!chapters) chapters = splitByWordBudget(text)
  if (!chapters.length) throw new Error('无法切分章节')
  return chapters.map((chapter) => ({
    title: chapter.title,
    text: chapter.text,
    html: format === 'md' ? markdownToHtml(chapter.text) : textToHtml(chapter.text),
  }))
}

export async function migrateMarkdownBooks(store) {
  const state = await store.read()
  for (const book of state.books.filter((row) => !row.deletedAt && row.format === 'md')) {
    const meta = await store.readBookMeta(book.id)
    if (!meta?.chapters) continue
    for (const summary of meta.chapters) {
      const file = store.chapterFile(book.id, summary.index)
      try {
        const chapter = JSON.parse(await readFile(file, 'utf8'))
        if (chapter.htmlVersion === 2) continue
        chapter.html = markdownToHtml(chapter.text)
        chapter.htmlVersion = 2
        await writeFile(file, JSON.stringify(chapter))
      } catch {
        // A missing or malformed chapter stays untouched; the reader will report it.
      }
    }
  }
}

export async function importBook(store, buffer, fileName) {
  const ext = extOf(fileName)
  if (!['epub', 'txt', 'md', 'markdown'].includes(ext)) {
    const error = new Error('只支持 EPUB、TXT、Markdown 文件')
    error.status = 400
    error.code = 'UNSUPPORTED_FORMAT'
    throw error
  }
  const checksum = sha256(buffer)
  const state = await store.read()
  const existing = state.books.find((book) => book.checksum === checksum && !book.deletedAt)
  if (existing) return { book: existing, duplicate: true, warnings: [] }

  const baseName = safeFileName(fileName).replace(/\.[^.]+$/, '')
  let parsed
  try {
    parsed = ext === 'epub' ? await parseEpub(buffer) : {
      format: ext === 'md' || ext === 'markdown' ? 'md' : 'txt',
      title: baseName,
      author: '',
      language: 'en',
      description: '',
      chapters: parsePlain(buffer, ext === 'md' || ext === 'markdown' ? 'md' : 'txt'),
      cover: null,
      warnings: [],
    }
  } catch (error) {
    const wrapped = new Error(error.message || '图书解析失败')
    wrapped.status = 422
    wrapped.code = 'BOOK_PARSE_FAILED'
    throw wrapped
  }

  const id = newId('bk')
  const chapters = parsed.chapters.map((chapter) => ({
    title: chapter.title,
    html: chapter.html,
    text: chapter.text,
    wordCount: countWords(chapter.text),
  }))
  const totalWords = chapters.reduce((sum, chapter) => sum + chapter.wordCount, 0)
  const now = nowIso()
  const book = {
    id,
    title: (parsed.title || baseName).slice(0, 200),
    author: (parsed.author || '').slice(0, 120),
    language: parsed.language || 'en',
    format: parsed.format,
    checksum,
    bytes: buffer.length,
    cover: null,
    chapterCount: chapters.length,
    wordCount: totalWords,
    description: (parsed.description || '').slice(0, 2000),
    tags: [],
    addedAt: now,
    updatedAt: now,
    deletedAt: null,
  }
  if (parsed.cover) {
    book.cover = await store.saveCover(id, parsed.cover.buffer, parsed.cover.ext)
  }
  await store.saveBook(book, chapters)
  await store.mutate((draft) => {
    draft.books.push(book)
  })
  return { book, duplicate: false, warnings: parsed.warnings ?? [] }
}

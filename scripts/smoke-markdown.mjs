import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Store } from '../src/store.js'
import { importBook, markdownToHtml, migrateMarkdownBooks } from '../src/library.js'

const root = await mkdtemp(join(tmpdir(), 'nr-md-'))
try {
  const store = new Store(root)
  await store.init()
  const md = [
    '# Chapter One',
    '',
    'The wedding **proceeded** three days later, everything so **efficient** that it was suffocating.',
    '',
    '> A quiet quotation.',
    '',
    '- first item',
    '- second **item**',
    '',
    'A [link](https://example.com) and *italic* text.',
  ].join('\n')
  const result = await importBook(store, Buffer.from(md, 'utf8'), 'test.md')
  const chapter = await store.readChapter(result.book.id, 0)
  console.log('md chapter', chapter.title, chapter.html.slice(0, 260))
  for (const token of ['<strong>proceeded</strong>', '<blockquote>', '<li>first item</li>', '<a href="https://example.com"']) {
    if (!chapter.html.includes(token)) throw new Error(`missing ${token}`)
  }
  const rendered = markdownToHtml('**bold** and *italic*')
  if (!rendered.includes('<strong>bold</strong>') || !rendered.includes('<em>italic</em>')) throw new Error('inline markdown failed')
  await migrateMarkdownBooks(store)
  console.log('MARKDOWN OK')
} finally {
  await rm(root, { recursive: true, force: true })
}

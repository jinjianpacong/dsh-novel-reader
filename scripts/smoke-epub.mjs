import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import JSZip from 'jszip'
import { Store } from '../src/store.js'
import { importBook } from '../src/library.js'

const zip = new JSZip()
zip.file('mimetype', 'application/epub+zip')
zip.file('META-INF/container.xml', `<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`)
zip.file('OEBPS/content.opf', `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
<dc:title>The Test Novel</dc:title><dc:creator>Jane Doe</dc:creator><dc:language>en</dc:language><dc:description>A small test book.</dc:description>
</metadata>
<manifest>
<item id="ch1" href="chapter1.xhtml" media-type="application/xhtml+xml"/>
<item id="ch2" href="chapter2.xhtml" media-type="application/xhtml+xml"/>
</manifest>
<spine><itemref idref="ch1"/><itemref idref="ch2"/></spine>
</package>`)
zip.file('OEBPS/chapter1.xhtml', `<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>Chapter One</title></head><body><h1>Chapter One</h1><p>It was a bright cold day in April, and the clocks were striking thirteen.</p><script>alert(1)</script></body></html>`)
zip.file('OEBPS/chapter2.xhtml', `<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>Chapter Two</title></head><body><h1>Chapter Two</h1><p>Winston turned a switch and the voice sank somewhat.</p></body></html>`)
const buffer = await zip.generateAsync({ type: 'nodebuffer' })

const root = await mkdtemp(join(tmpdir(), 'nr-epub-'))
try {
  const store = new Store(root)
  await store.init()
  const result = await importBook(store, buffer, 'test-novel.epub')
  console.log('book', result.book.title, result.book.author, result.book.chapterCount, result.book.wordCount)
  const chapter = await store.readChapter(result.book.id, 0)
  console.log('chapter', chapter.title, JSON.stringify(chapter.text.slice(0, 60)))
  if (chapter.html.includes('<script')) throw new Error('script was not sanitized')
  if (result.book.author !== 'Jane Doe') throw new Error('author missing')
  console.log('EPUB OK')
} finally {
  await rm(root, { recursive: true, force: true })
}

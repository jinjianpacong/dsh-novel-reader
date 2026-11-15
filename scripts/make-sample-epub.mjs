import { writeFile } from 'node:fs/promises'
import JSZip from 'jszip'

const zip = new JSZip()
zip.file('mimetype', 'application/epub+zip')
zip.file('META-INF/container.xml', `<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`)
zip.file('OEBPS/content.opf', `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
<dc:title>The Lantern by the Sea</dc:title><dc:creator>Ada Reed</dc:creator><dc:language>en</dc:language><dc:description>A short novel for testing the reader.</dc:description>
</metadata>
<manifest>
<item id="cover" href="cover.png" media-type="image/png" properties="cover-image"/>
<item id="ch1" href="chapter1.xhtml" media-type="application/xhtml+xml"/>
<item id="ch2" href="chapter2.xhtml" media-type="application/xhtml+xml"/>
</manifest>
<spine><itemref idref="ch1"/><itemref idref="ch2"/></spine>
</package>`)
zip.file('OEBPS/chapter1.xhtml', `<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>Chapter One: The Harbour</title></head><body><h1>The Harbour</h1><p>On the first evening of autumn, the lantern appeared at the end of the pier. Nobody in the village remembered who had lit it.</p><p>Mara watched from her window, counting the slow pulse of the light against the dark water.</p></body></html>`)
zip.file('OEBPS/chapter2.xhtml', `<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>Chapter Two: The Letter</title></head><body><h1>The Letter</h1><p>By morning a letter had arrived, sealed with blue wax and addressed in a hand she did not recognise.</p><p>The words inside were few, but they changed the shape of the week.</p></body></html>`)
// A 1x1 PNG as a stand-in cover.
zip.file('OEBPS/cover.png', Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl1sAAAAASUVORK5CYII=', 'base64'))
await writeFile('C:/Users/1/ego/novel-reader-check/sample.epub', await zip.generateAsync({ type: 'nodebuffer' }))
console.log('written')

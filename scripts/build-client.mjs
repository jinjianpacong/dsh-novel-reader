import { build } from 'esbuild'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const tmp = join(root, 'client', '.client.tmp.cjs')
await mkdir(join(root, 'client'), { recursive: true })

await build({
  entryPoints: [join(root, 'src-client', 'index.jsx')],
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: ['es2021'],
  external: ['react'],
  jsx: 'transform',
  loader: { '.jsx': 'jsx' },
  outfile: tmp,
  logLevel: 'info',
  legalComments: 'none',
})

const code = await readFile(tmp, 'utf8')
const wrapped = `window.__ModuleLoader__.load({
  id: '@local/dsh-novel-reader',
  factory: (require) => {
    const module = { exports: {} };
    const exports = module.exports;
${code}
    return module.exports;
  }
});
`
await writeFile(join(root, 'client', 'client.js'), wrapped)
console.log(`built ${join(root, 'client', 'client.js')} (${wrapped.length} bytes)`)

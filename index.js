import { Store } from './src/store.js'
import { migrateMarkdownBooks } from './src/library.js'
import { WebDavSync } from './src/sync.js'
import { createRouter } from './src/routes.js'

export const name = 'dsh-novel-reader'

export const inject = ['webServer', 'connection']

export async function apply(ctx) {
  const store = new Store()
  await store.init()
  await migrateMarkdownBooks(store)
  const sync = new WebDavSync(ctx, store)
  const handler = createRouter({ ctx, store, sync })
  ctx.effect(
    () => ctx.webServer.register({ kind: 'prefix', path: '/novel-reader', handler }),
    'novel-reader: /novel-reader routes',
  )
  ctx.effect(() => {
    const timer = setInterval(async () => {
      try {
        const state = await store.read()
        if (state.settings.sync?.enabled && state.settings.sync?.autoSync === '5min') {
          await sync.sync()
        }
      } catch {
        // A failed background sync keeps local data untouched; the next manual run reports the error.
      }
    }, 5 * 60 * 1000)
    return () => clearInterval(timer)
  }, 'novel-reader: automatic WebDAV sync')
}

export default { name, inject, apply }

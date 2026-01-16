import { makeWorker } from '@livestore/adapter-web/worker'
import { makeWsSync } from '@livestore/sync-cf/client'
import { schema } from '@repo/schema'

// Sync URL - use env var if set (production), otherwise default to localhost
const syncUrl = import.meta.env.VITE_SYNC_URL ?? 'http://localhost:8787/sync'

makeWorker({
  schema,
  sync: {
    backend: makeWsSync({ url: syncUrl }),
    initialSyncOptions: { _tag: 'Blocking', timeout: 5000 },
  },
})

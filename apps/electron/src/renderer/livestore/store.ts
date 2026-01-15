import { makePersistedAdapter } from '@livestore/adapter-web'
import LiveStoreSharedWorker from '@livestore/adapter-web/shared-worker?sharedworker'
import { useStore } from '@livestore/react'
import { makeWsSync } from '@livestore/sync-cf/client'
import { SyncPayload, schema } from '@repo/schema'
import { unstable_batchedUpdates as batchUpdates } from 'react-dom'
import LiveStoreWorker from './worker?worker'

// Shared store ID - must be the same across all clients for sync
const storeId = import.meta.env.VITE_LIVESTORE_STORE_ID ?? 'todo-app'

// Sync backend URL
const syncUrl = import.meta.env.VITE_LIVESTORE_SYNC_URL ?? 'http://localhost:8787/sync'

const adapter = makePersistedAdapter({
  storage: { type: 'opfs' },
  worker: LiveStoreWorker,
  sharedWorker: LiveStoreSharedWorker,
  sync: { backend: makeWsSync({ url: syncUrl }) },
})

export function useAppStore() {
  return useStore({
    storeId,
    schema,
    adapter,
    batchUpdates,
    syncPayloadSchema: SyncPayload,
    syncPayload: { authToken: 'insecure-token-change-me' },
  })
}

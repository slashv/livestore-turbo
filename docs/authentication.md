# Authentication

This project uses [better-auth](https://www.better-auth.com/) for authentication with LiveStore sync.

## Overview

| Platform | Auth Method | How It Works |
|----------|-------------|--------------|
| **Web** | Cookies | Sent automatically via browser headers |
| **Electron** | Bearer tokens | Stored in localStorage, passed via `syncPayload` |
| **Mobile (Expo)** | Cookies | Stored in `expo-secure-store`, passed via `syncPayload` |

The server validates sessions at WebSocket connection time using better-auth's session API.

## Platform-Specific Implementation

### Web

Browsers automatically include cookies with WebSocket upgrade requests. The server reads the `Cookie` header and validates the session. No special handling needed.

### Electron (Desktop)

Electron apps use bearer token authentication via better-auth's `bearer` plugin:

1. On sign-in, the server returns a `set-auth-token` header
2. The client stores this token in localStorage
3. The token is sent with API requests via `Authorization: Bearer` header
4. For WebSocket sync, the token is passed via `syncPayload.bearerToken`

```typescript
// apps/electron/src/renderer/lib/auth-client.ts
export const authClient = createAuthClient({
  baseURL,
  fetchOptions: {
    onSuccess: (ctx) => {
      const authToken = ctx.response.headers.get('set-auth-token')
      if (authToken) {
        localStorage.setItem(TOKEN_KEY, authToken)
      }
    },
    auth: {
      type: 'Bearer',
      token: () => getToken() ?? '',
    },
  },
})
```

```typescript
// apps/electron/src/renderer/livestore/store.ts
const bearerToken = getToken()

return useStore({
  syncPayload: {
    authToken: userId,
    bearerToken: bearerToken ?? undefined,
  },
})
```

### Mobile (Expo)

Mobile apps use the `@better-auth/expo` plugin which handles cookie storage:

1. `@better-auth/expo` stores session cookies in `expo-secure-store`
2. The app retrieves cookies via `authClient.getCookie()`
3. Cookies are passed to the server via `syncPayload.cookie`

```typescript
// apps/mobile/src/livestore/store.ts
const cookie = authClient.getCookie()

return useStore({
  syncPayload: {
    authToken: userId,
    cookie: cookie || undefined,
  },
})
```

## Server Configuration

The server uses both `expo` and `bearer` plugins:

```typescript
// apps/server/src/auth.ts
import { expo } from '@better-auth/expo'
import { bearer } from 'better-auth/plugins'

betterAuth({
  plugins: [expo(), bearer()],
  session: {
    expiresIn: 60 * 60 * 24 * 90, // 90 days
  },
})
```

### Session Validation

The server validates auth credentials from multiple sources:

1. **Bearer token** from `syncPayload.bearerToken` (Electron)
2. **Cookie** from HTTP headers (Web)
3. **Cookie** from `syncPayload.cookie` (Mobile)

```typescript
// apps/server/src/index.ts
const validatePayload = async (payload, { storeId, headers }) => {
  // Extract credentials (bearer token or cookie)
  const credentials = extractAuthCredentials(headers, payload)

  // Build appropriate headers for validation
  const authHeaders = new Headers()
  if (credentials.type === 'bearer') {
    authHeaders.set('authorization', `Bearer ${credentials.value}`)
  } else {
    authHeaders.set('cookie', credentials.value)
  }

  // Validate session
  const session = await auth.api.getSession({ headers: authHeaders })

  if (!session || session.user.id !== storeId) {
    throw new Error('Unauthorized')
  }
}
```

## Store Access Control

Each user can only sync their own store. The server enforces `storeId === session.user.id`.

## Security Considerations

### Bearer Tokens (Electron)

- Tokens are stored in localStorage (acceptable for desktop apps)
- Tokens are passed in WebSocket payload, encrypted via TLS
- Tokens share the same expiry as sessions (90 days)
- Tokens can be revoked server-side by invalidating the session

### Mobile Cookies

- Cookies are stored in `expo-secure-store` (encrypted at rest)
- Cookies are passed in WebSocket payload, encrypted via TLS
- Cookies can be revoked server-side if compromised

### Why Different Auth Methods?

| Platform | Why This Method |
|----------|-----------------|
| **Web** | Browsers handle cookies natively, including with WebSocket upgrades |
| **Electron** | `file://` protocol has cookie restrictions; bearer tokens work reliably |
| **Mobile** | `@better-auth/expo` provides cookie management via SecureStore |

## Session Expiry

Sessions expire after 90 days. If a session expires:

- The WebSocket connection stays open until the next sync operation
- The operation fails with an auth error
- The client must re-authenticate

## References

- [better-auth Bearer Plugin](https://www.better-auth.com/docs/plugins/bearer)
- [better-auth Expo Integration](https://www.better-auth.com/docs/integrations/expo)
- [LiveStore Auth Patterns](https://dev.docs.livestore.dev/patterns/auth/)
- [LiveStore Cloudflare Sync](https://dev.docs.livestore.dev/sync-providers/cloudflare/)

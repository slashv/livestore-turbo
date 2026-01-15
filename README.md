# LiveStore Turborepo

A cross-platform Todo application demonstrating [LiveStore](https://livestore.dev) across Web, Electron, and Mobile (Expo) with shared schema and real-time sync via Cloudflare.

## Project Structure

```
livestore-turbo/
├── apps/
│   ├── web/           # TanStack Router + Vite web app
│   ├── electron/      # Electron desktop app (uses web adapter)
│   ├── mobile/        # Expo React Native app
│   └── server/        # Cloudflare Worker (sync + auth)
├── packages/
│   ├── schema/        # Shared LiveStore schema (tables, events, materializers)
│   ├── core/          # Shared queries, actions, and utilities
│   └── tsconfig/      # Shared TypeScript configs
```

## Prerequisites

- Node.js 20+
- pnpm 9+
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (for Cloudflare Workers)

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up Cloudflare (optional, for sync)

Create a D1 database for authentication:

```bash
cd apps/server
wrangler d1 create livestore-auth
```

Update `wrangler.toml` with the database ID, then run migrations:

```bash
pnpm db:generate
pnpm db:migrate
```

### 3. Start development servers

```bash
# Web + Server (default, most common)
pnpm dev

# Or use specific commands:
pnpm dev:web       # Server + Web app
pnpm dev:mobile    # Mobile app (Expo) - run in separate terminal
pnpm dev:electron  # Server + Electron app
pnpm dev:server    # Just the sync server
pnpm dev:all       # All apps (may be chaotic)
```

**Note**: Mobile (Expo) should be run in a separate terminal since it has an interactive CLI.

### 4. Open the apps

- **Web**: http://localhost:5173
- **LiveStore Devtools**: http://localhost:5173/_livestore
- **Server**: http://localhost:8787
- **Mobile**: Use Expo Go app or iOS/Android simulator

## Architecture

### LiveStore Flow

```
[Web/Electron/Mobile Clients]
         │
         ▼ WebSocket (wss://)
[Cloudflare Worker]
         │
         ▼ Routes by storeId
[Sync Backend Durable Object]
         │
         ▼ Persists to
[DO SQLite]
```

### Shared Schema

All apps share the same LiveStore schema from `@repo/schema`:

- **Tables**: `todos`, `uiState` (client document)
- **Events**: `todoCreated`, `todoCompleted`, `todoUncompleted`, `todoDeleted`, `todoClearedCompleted`
- **Materializers**: Map events to SQLite state changes

### Platform Adapters

| Platform | Adapter | Storage |
|----------|---------|---------|
| Web | `@livestore/adapter-web` | OPFS + SharedWorker |
| Expo | `@livestore/adapter-expo` | expo-sqlite |
| Electron | `@livestore/adapter-web` | OPFS (native adapter coming soon) |
| Server | `@livestore/sync-cf` | Durable Object SQLite |

## Authentication

The server includes [better-auth](https://better-auth.com) integration with email/password authentication. The auth token is passed to the sync backend via `syncPayload`.

**Note**: The current setup uses an insecure placeholder token. For production:

1. Implement proper login UI
2. Store the auth token securely
3. Enable token validation in `apps/server/src/index.ts`

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all apps |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm clean` | Clean build artifacts |

## App-specific scripts

### Web (`apps/web`)

```bash
pnpm dev      # Start dev server
pnpm build    # Production build
pnpm preview  # Preview production build
```

### Server (`apps/server`)

```bash
pnpm dev           # Start local dev server
pnpm deploy        # Deploy to Cloudflare
pnpm db:generate   # Generate Drizzle migrations
pnpm db:migrate    # Apply migrations locally
```

### Mobile (`apps/mobile`)

```bash
pnpm start     # Start Expo dev server
pnpm ios       # Start iOS simulator
pnpm android   # Start Android emulator
```

### Electron (`apps/electron`)

```bash
pnpm dev      # Start Electron in dev mode
pnpm build    # Build for production
pnpm package  # Package for distribution
```

## Environment Variables

### Mobile (`apps/mobile`)

```bash
EXPO_PUBLIC_LIVESTORE_SYNC_URL=http://localhost:8787/sync
EXPO_PUBLIC_LIVESTORE_STORE_ID=mobile-store
```

### Server (`apps/server`)

```bash
BETTER_AUTH_SECRET=your-secret-here
BETTER_AUTH_URL=https://your-domain.com
```

## Learn More

- [LiveStore Documentation](https://dev.docs.livestore.dev)
- [TanStack Router](https://tanstack.com/router)
- [Expo](https://expo.dev)
- [Electron](https://electronjs.org)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [better-auth](https://better-auth.com)

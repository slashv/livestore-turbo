# LiveStore Turbo

> **Note:** This project targets LiveStore 0.4, which is currently in beta.

A cross-platform app template with real-time sync across web, desktop, and mobile. Uses [LiveStore](https://livestore.dev) for local-first data, [better-auth](https://better-auth.com) for authentication, and [Cloudflare](https://cloudflare.com) for deployment.

**One codebase. Four platforms. Real-time sync.**

| Platform | Stack |
|----------|-------|
| Web | TanStack Router + Vite |
| Desktop | Electron |
| Mobile | Expo React Native |
| Backend | Cloudflare Workers + D1 |

**Production-ready infrastructure:**

- E2E tests for all platforms (Playwright + Maestro)
- One-command deployment to Cloudflare, GitHub Releases, and EAS
- CI/CD pipeline with pre-commit hooks

```bash
# Develop
pnpm dev                    # Web + server
pnpm dev:electron           # Desktop
pnpm dev:mobile             # Mobile

# Test
pnpm test:e2e:web           # Playwright
pnpm test:e2e:electron      # Desktop e2e
pnpm test:e2e:mobile        # Maestro iOS

# Deploy
pnpm deploy:preview         # All platforms to preview
pnpm deploy:prod            # All platforms to production
pnpm release patch          # Bump version, tag, deploy via CI
```

---

## Project Structure

```
livestore-turbo/
├── apps/
│   ├── web/           # TanStack Router + Vite web app
│   ├── electron/      # Electron desktop app
│   ├── mobile/        # Expo React Native app
│   └── server/        # Cloudflare Worker (sync + auth)
├── packages/
│   ├── schema/        # Shared LiveStore schema
│   ├── core/          # Shared queries and utilities
│   └── tsconfig/      # Shared TypeScript configs
```

---

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up the auth database

```bash
cd apps/server
pnpm db:migrate
```

This creates a local SQLite database for better-auth (user accounts and sessions). LiveStore handles its own storage separately. For production setup, see [docs/deployment.md](./docs/deployment.md).

### 3. Start development

```bash
pnpm dev              # Web + server at localhost:5173
pnpm dev:electron     # Desktop app
pnpm dev:mobile       # Mobile (run in separate terminal)
```

---

## Architecture

All apps share the same LiveStore schema from `@repo/schema`:

- **Tables**: `todos`, `uiState`
- **Events**: `todoCreated`, `todoCompleted`, `todoDeleted`, etc.
- **Materializers**: Map events to SQLite state changes

Data syncs in real-time across all connected clients via the Cloudflare Worker.

---

## Authentication

Authentication via [better-auth](https://better-auth.com):

| Platform | Auth Method |
|----------|-------------|
| Web | Cookies (automatic via browser) |
| Electron | Bearer tokens (via `bearer` plugin) |
| Mobile | Cookies (via `expo` plugin + SecureStore) |

Each user's data is isolated (`storeId === userId`).

See [docs/authentication.md](./docs/authentication.md) for implementation details.

---

## Testing

E2E tests verify the complete flow on all platforms: registration, create todo, complete, delete.

```bash
pnpm test:e2e:web       # Playwright (web)
pnpm test:e2e:electron  # Playwright (desktop)
pnpm test:e2e:mobile    # Maestro (iOS)
```

See [docs/testing.md](./docs/testing.md) for setup and CI integration.

---

## Deployment

Deploy all platforms with one command:

```bash
pnpm deploy:preview     # Preview environments
pnpm deploy:prod        # Production
pnpm release patch      # Bump version + deploy via CI
```

| Platform | Destination |
|----------|-------------|
| Server | Cloudflare Workers |
| Web | Cloudflare Pages |
| Electron | GitHub Releases |
| Mobile | EAS Build |

See [docs/deployment.md](./docs/deployment.md) for environment setup and CI/CD details.

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start web + server |
| `pnpm dev:mobile` | Start mobile (Expo) |
| `pnpm dev:electron` | Start desktop |
| `pnpm build` | Build all apps |
| `pnpm typecheck` | TypeScript checks |
| `pnpm lint` | Run linter |
| `pnpm test:e2e:*` | E2E tests |
| `pnpm deploy:*` | Deployment commands |

# LiveStore Turborepo

A cross platform app using LiveStore that sync across web, desktop and mobile. Uses better-auth for authentication.

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

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up the database

#### Local Development (Quick Start)

For local development, you only need to run the migrations with the `--local` flag (which is the default):

```bash
cd apps/server
pnpm db:migrate
```

This creates a local SQLite database - no Cloudflare account required.

#### Production Setup (Cloudflare D1)

For production deployment, create a D1 database:

```bash
cd apps/server
wrangler d1 create livestore-auth
```

Update `wrangler.toml` with the database ID from the output, then run migrations:

```bash
pnpm db:generate
pnpm db:migrate:prod
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

### Running on a Physical Mobile Device

When testing on a physical device (via Expo Go), your phone can't reach `localhost`. You need to:

1. **Find your Mac's local IP address:**
   ```bash
   ipconfig getifaddr en0
   # Example output: 192.168.0.106
   ```

2. **Start the server** (already configured to listen on all interfaces):
   ```bash
   pnpm dev:server
   ```

3. **Start Expo with your local IP:**
   ```bash
   cd apps/mobile
   LIVESTORE_SYNC_URL="http://YOUR_IP:8787/sync" npx expo start --clear
   ```

   For example:
   ```bash
   LIVESTORE_SYNC_URL="http://192.168.0.106:8787/sync" npx expo start --clear
   ```

4. **Ensure your phone is on the same WiFi network** as your development machine.

For simulators, the default `localhost` configuration works without any changes.

### 4. Open the apps

- **Web**: http://localhost:5173
- **Server**: http://localhost:8787
- **Electron**: Opens desktop app
- **Mobile**: Use Expo Go app or iOS/Android simulator

## Architecture

### Shared Schema

All apps share the same LiveStore schema from `@repo/schema`:

- **Tables**: `todos`, `uiState` (client document)
- **Events**: `todoCreated`, `todoCompleted`, `todoUncompleted`, `todoDeleted`, `todoClearedCompleted`
- **Materializers**: Map events to SQLite state changes

## Authentication

This project uses [better-auth](https://better-auth.com) for cookie-based authentication across all platforms:

- **Web/Electron**: Cookies are sent automatically via browser headers
- **Mobile (Expo)**: Cookies are stored securely via `@better-auth/expo` and passed in the sync payload

Each user's data is isolated to their own store (`storeId === userId`).

For more details, see:
- [docs/authentication.md](./docs/authentication.md) - Implementation details
- [LiveStore Auth Patterns](https://dev.docs.livestore.dev/patterns/auth/)
- [better-auth Expo Integration](https://www.better-auth.com/docs/integrations/expo)

## E2E Testing

Each app has end-to-end tests that verify the complete todo flow: login, create todo, complete todo, and delete todo.

### Web E2E Tests (Playwright)

```bash
# Run web e2e tests (automatically starts server + web app)
cd apps/web
pnpm test:e2e
```

### Electron E2E Tests (Playwright)

```bash
# Run electron e2e tests (automatically starts server, builds app first)
cd apps/electron
pnpm test:e2e
```

### Mobile E2E Tests (Maestro)

Mobile e2e tests use [Maestro](https://maestro.mobile.dev/) to automate the iOS simulator.

#### Prerequisites

1. **Install Maestro:**
   ```bash
   curl -Ls "https://get.maestro.mobile.dev" | bash
   ```

2. **Install Java (required by Maestro):**
   ```bash
   brew install openjdk@17
   ```

3. **Build and install the app on a simulator:**
   ```bash
   cd apps/mobile
   npx expo prebuild --platform ios
   npx expo run:ios
   ```

4. **Configure environment (optional):**
   ```bash
   cd apps/mobile
   cp e2e/.env.e2e.example e2e/.env.e2e
   # Edit .env.e2e if needed (e.g., different Java path)
   ```

#### Running Mobile E2E Tests

```bash
# Start the server first
pnpm dev:server

# Start Metro bundler in another terminal
cd apps/mobile
pnpm start

# In another terminal, run mobile e2e tests
cd apps/mobile
pnpm test:e2e
```

The test script will check for:
- Maestro installation
- Java installation
- Running iOS simulator
- App installed on simulator
- Backend server running

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start web app and server |
| `pnpm dev:web` | Start web app and server |
| `pnpm dev:mobile` | Start mobile app (Expo) |
| `pnpm dev:electron` | Start Electron app |
| `pnpm dev:server` | Start sync server only |
| `pnpm dev:all` | Start all apps |
| `pnpm build` | Build all apps |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm lint` | Run linter |
| `pnpm clean` | Clean build artifacts |
| `pnpm test:e2e:web` | Run web e2e tests |
| `pnpm test:e2e:electron` | Run Electron e2e tests |
| `pnpm test:e2e:mobile` | Run mobile e2e tests |

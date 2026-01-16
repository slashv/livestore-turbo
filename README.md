# LiveStore Turborepo

A cross platform app using LiveStore.

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

### 2. Set up Cloudflare

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

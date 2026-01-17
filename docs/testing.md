# Testing

This project has end-to-end tests for all platforms: web, desktop (Electron), and mobile (iOS/Android).

## Overview

| Platform | Framework | Test Location |
|----------|-----------|---------------|
| Web | Playwright | `apps/web/e2e/` |
| Electron | Playwright | `apps/electron/e2e/` |
| Mobile | Maestro | `apps/mobile/e2e/` |

All tests verify the complete user flow: registration, login, create todo, complete todo, and delete todo.

---

## Quick Start

```bash
# Run all e2e tests (from root)
pnpm test:e2e:web
pnpm test:e2e:electron
pnpm test:e2e:mobile
```

---

## Web E2E Tests (Playwright)

```bash
cd apps/web
pnpm test:e2e
```

This automatically starts the server and web app, then runs Playwright tests.

### Testing Against Deployed Sites

```bash
TEST_BASE_URL=https://your-preview.pages.dev \
TEST_API_URL=https://your-server.workers.dev \
npx playwright test --config=e2e/playwright.config.ts
```

| Variable | Description | Default |
|----------|-------------|---------|
| `TEST_BASE_URL` | Web app URL to test | `http://localhost:5173` |
| `TEST_API_URL` | API server URL | `http://localhost:8787` |

---

## Electron E2E Tests (Playwright)

```bash
cd apps/electron
pnpm test:e2e
```

This builds the Electron app first, then runs Playwright tests against the desktop application.

---

## Mobile E2E Tests (Maestro)

Mobile tests use [Maestro](https://maestro.mobile.dev/) to automate the iOS simulator.

### Prerequisites

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

### Running Mobile Tests

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

The test script validates:
- Maestro installation
- Java installation
- Running iOS simulator
- App installed on simulator
- Backend server running

---

## CI Integration

The CI workflow (`.github/workflows/ci.yml`) runs web E2E tests on every push to `main` and on pull requests.

| Job | What It Does |
|-----|--------------|
| Lint & Typecheck | Runs `biome check` and `tsc --noEmit` |
| E2E Tests (Web) | Playwright tests with local server |
| Build All | Verifies all packages compile |

### Pre-commit Hooks

The repo uses Husky to run checks before each commit:

1. `lint-staged` - Runs `biome check` on staged files
2. `typecheck` - Runs `tsc --noEmit` across all packages

If either check fails, the commit is rejected.

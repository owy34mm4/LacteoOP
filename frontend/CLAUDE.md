# CLAUDE.md — Frontend

Agent context for the `frontend/` Vite SPA. Read this before touching any frontend file.

## Stack

| Component | Technology |
|-----------|-----------|
| UI library | React 18 (bundled via Vite) |
| Language | TypeScript 5 (`strict`) |
| Bundler | Vite 6 + `@vitejs/plugin-react` |
| Router | React Router DOM 6 (browser history) |
| Icons | `lucide-react` |
| Fonts | Onest + JetBrains Mono via Google Fonts CDN |
| Package manager | pnpm (v9 — `packageManager` field locked in `package.json`) |
| Test runner | Vitest 2 + jsdom + Testing Library |
| Runtime image | `nginxinc/nginx-unprivileged:alpine` (non-root, port **8080**) |

## Commands

```bash
pnpm install          # install deps (use pnpm — not npm/yarn)
pnpm dev              # Vite dev server with HMR on http://localhost:5173
pnpm build            # tsc -b && vite build  →  dist/
pnpm test             # vitest run (single pass, no watch)
pnpm preview          # serve dist/ locally after build
```

> `pnpm build` runs the TypeScript compiler first (`tsc -b`) and then Vite. A type error aborts the build before bundling starts.

## Entry points

```
src/main.tsx          ← ReactDOM.createRoot — mounts RouterProvider
src/app/App.tsx       ← AppSidebar shell + <Outlet /> (desktop surfaces only)
src/app/routes.tsx    ← createBrowserRouter — all 7 surface routes
```

`/ruta` mounts **outside** the `App` shell (standalone mobile surface). All other surfaces mount as children of `App` and inherit the sidebar.

## Structure

```
frontend/
├── Dockerfile                  ← multi-stage: node:20-alpine build → nginx-unprivileged
├── nginx.conf                  ← listens 8080; /api/ proxied to backend:8000
├── vite.config.ts              ← dev proxy /api → localhost:8000; outDir: dist
├── vitest.config.ts            ← separate config (jsdom env)
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── package.json                ← packageManager: pnpm@9.x.x
├── src/
│   ├── main.tsx                ← app entry
│   ├── vite-env.d.ts
│   ├── app/
│   │   ├── App.tsx             ← AppSidebar + Outlet shell
│   │   └── routes.tsx          ← all routes (lazy-loaded surfaces)
│   ├── shared/                 ← hexagonal core (tested)
│   │   ├── domain.ts           ← frozen factories + value objects (TypeScript types)
│   │   ├── ports.ts            ← port interfaces (PedidoPort, ParadaPort, …)
│   │   ├── config.ts           ← API_BASE (defaults to /api)
│   │   └── adapters/
│   │       ├── http.ts         ← REST port implementations + mapper layer
│   │       └── offline.ts      ← localStorage cache + sync queue (wraps http)
│   ├── components/             ← shared UI primitives
│   │   ├── Shell.tsx           ← AppSidebar
│   │   ├── Modal.tsx
│   │   ├── Icons.tsx
│   │   ├── PrivacyNoticeBanner.tsx
│   │   ├── DataConsentModal.tsx
│   │   ├── DataDeletionForm.tsx
│   │   └── ProtectedDataLabel.tsx
│   ├── surfaces/               ← one folder per surface
│   │   ├── pedidos/            ← real backend (PedidoPort)
│   │   ├── ruta/               ← real backend (ParadaPort + ConductorPort, offline-capable)
│   │   ├── operacion/          ← real backend (OperacionPort)
│   │   ├── clientes/           ← real backend (PedidoPort.listarClientes)
│   │   ├── inventario/         ← MOCK DATA — no backend endpoint yet
│   │   ├── privacidad/         ← MOCK DATA — no backend endpoint yet
│   │   └── configuracion/      ← MOCK DATA — no backend endpoint yet
│   └── styles/
│       ├── colors_and_type.css ← design tokens
│       ├── shell.css
│       ├── styles.css
│       └── <surface>.css       ← one file per surface
└── test/                       ← mirrors src/ (vitest + jsdom)
    ├── setup.ts
    └── shared/
        ├── domain.test.ts
        └── adapters/
            ├── http.test.ts
            └── offline.test.ts
```

## Hexagonal core (`src/shared/`)

```
domain.ts   ← frozen factories + TypeScript types for Pedido, Parada, Conductor, Alerta
ports.ts    ← port interfaces — PedidoPort, ParadaPort, ConductorPort, OperacionPort
config.ts   ← API_BASE: reads VITE_API_BASE env var; falls back to "/api"
adapters/
  http.ts   ← one factory per port (httpPedidoPort, httpParadaPort, …)
             + mapper layer (Spanish snake_case backend → English domain shape)
  offline.ts← wraps http adapter with localStorage cache + sync queue
```

**Rule**: Business logic goes in `src/shared/` and MUST have tests. Surface `.tsx` files are view glue — not unit-tested (integration/component tests via Testing Library if needed).

## Mapper rule — CRITICAL

`src/shared/adapters/http.ts` is the **only** place where backend Spanish snake_case fields are translated to the English domain shape.

Example: `cliente_nombre` → `client`, `paradas_hechas` → `done`.

`tsc` and `vitest` do **not** catch a missing mapper — `fetch` returns `unknown` at runtime. If you add a new backend field, you must add the corresponding `ApiXxx` interface and mapper function in `http.ts`. Tests that mock the API must use the backend shape (Spanish snake_case), not the domain shape.

## API configuration

| Context | Resolution |
|---------|-----------|
| Dev (`pnpm dev`) | Vite proxy rewrites `/api/*` → `http://localhost:8000/*` |
| Production (Docker) | nginx `location /api/` proxies to `backend:8000` |
| Override | Set `VITE_API_BASE` env var at build time |

## How to add a surface

1. Create `src/surfaces/<name>/<Name>Page.tsx` — content-only component, no shell (the `App` shell provides the sidebar).
2. Add a CSS file: `src/styles/<name>.css`.
3. Register a lazy route in `src/app/routes.tsx` under the `App` children array.
4. Consume ports from `src/shared/adapters/http.ts` (or `offline.ts` for offline-capable surfaces).
5. Add a port interface to `src/shared/ports.ts` if new backend endpoints are needed.
6. Add mapper functions to `src/shared/adapters/http.ts` (backend shape → domain shape).

> `/ruta` is the exception: it mounts at the router root, **not** inside `App`, because it is a standalone mobile surface with its own layout.

## How to add a port adapter

1. Define the TypeScript interface in `src/shared/ports.ts`.
2. Add the `ApiXxx` interface + mapper function in `src/shared/adapters/http.ts`.
3. Export a factory function `httpXxxPort(baseUrl = API_BASE): XxxPort`.
4. Write tests in `test/shared/adapters/http.test.ts` using the backend (Spanish) shape in mocks.
5. If offline support is needed, wrap in `offline.ts`.

## Gotchas

| Issue | Detail |
|-------|--------|
| Port **8080** | nginx-unprivileged can't bind ports < 1024. The container listens on 8080; compose maps `8080:8080`. `docker run -p 8080:80` is WRONG — use `8080:8080`. |
| pnpm only | `npm install` or `yarn` will fail: no lockfile for them. Always use `pnpm`. |
| `tsc -b` runs before Vite | Type errors abort `pnpm build` before any bundling. Fix type errors first. |
| Separate vitest config | `vitest.config.ts` is separate from `vite.config.ts` — the test env is `jsdom`, not the browser. |
| Mapper is the contract | If a backend field is renamed, update `ApiXxx` + mapper in `http.ts`. `tsc` won't catch this. |
| `/ruta` bypasses App shell | If you add layout to `App.tsx`, it won't affect `RutaPage`. Test separately. |
| Offline surfaces | `ruta/` uses `offline.ts`, which queues mutations in `localStorage` and replays them. Do not bypass it for ruta mutations. |
| Mock surfaces | `inventario`, `privacidad`, `configuracion` render static/mock data. No backend ports exist yet for them. |

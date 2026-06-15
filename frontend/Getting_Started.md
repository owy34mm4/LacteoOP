# Getting Started — Frontend

Vite + React 18 + TypeScript SPA. Package manager: **pnpm**. Runtime: **nginx-unprivileged on port 8080**.

## Surfaces

| Surface | Path | Role | Backend |
|---------|------|------|---------|
| Pedidos | `/pedidos` | Order assistant (desktop) | Real |
| Ruta | `/ruta` | Driver route UI (mobile, offline-capable) | Real |
| Operación | `/operacion` | Manager dashboard (desktop) | Real |
| Clientes | `/clientes` | Client list (desktop) | Real |
| Inventario | `/inventario` | Product inventory | Mock — no endpoint yet |
| Privacidad | `/privacidad` | Privacy notice (Ley 1581) | Mock — no endpoint yet |
| Configuración | `/configuracion` | App settings | Mock — no endpoint yet |

---

## Run locally (dev server)

```bash
cd frontend
pnpm install          # install deps — use pnpm, not npm
pnpm dev              # Vite dev server → http://localhost:5173
```

The dev server proxies `/api/*` to `http://localhost:8000` (backend must be running). To start both services at once, use Docker Compose from the project root instead.

---

## Build

```bash
pnpm build            # runs: tsc -b && vite build
                      # output → frontend/dist/
pnpm preview          # serve dist/ locally to verify the production build
```

> `tsc -b` runs before Vite. Type errors abort the build.

---

## Run tests

```bash
pnpm test             # vitest run — single pass, no watch
```

Tests cover `src/shared/` (domain factories + port adapters). No browser required — jsdom is used. `test/` and `node_modules` are excluded from the Docker image.

---

## Run via Docker (standalone)

The Dockerfile is a **multi-stage build**:

1. `node:20-alpine` — installs deps with pnpm, runs `pnpm build`, produces `dist/`.
2. `nginxinc/nginx-unprivileged:alpine` — copies `dist/` and serves it.

nginx-unprivileged runs as a non-root user and **listens on port 8080** (non-root processes cannot bind ports below 1024).

```bash
# From the frontend/ directory
docker build -t lacteoop-frontend .
docker run -p 8080:8080 lacteoop-frontend
```

Open http://localhost:8080

> Note: the container port is **8080**, not 80. `-p 8080:80` is wrong.

---

## Run via Compose (recommended)

From the project root — starts frontend, backend, and MongoDB together:

```bash
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:8080 |
| Backend API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |

In Compose, nginx proxies `/api/` requests to `backend:8000`. The frontend SPA receives all other routes via `try_files $uri $uri/ /index.html`.

---

## API routing

| Context | How `/api` resolves |
|---------|-------------------|
| `pnpm dev` | Vite proxy → `http://localhost:8000` |
| Docker / Compose | nginx `location /api/` → `http://backend:8000/` |
| Override | Set `VITE_API_BASE` at build time (e.g. `VITE_API_BASE=/v2`) |

---

## Adding a surface

1. Create `src/surfaces/<name>/<Name>Page.tsx` — content-only component (no shell).
2. Add `src/styles/<name>.css`.
3. Register a lazy route in `src/app/routes.tsx` under the `App` children.
4. Wire a port from `src/shared/adapters/http.ts` (or `offline.ts` for offline support).

See `CLAUDE.md` for the full agent context and mapper rules.

# CLAUDE.md — Frontend

Agent context for the `frontend/` static app. Read this before touching any frontend file.

## Stack

| Component | Technology |
|-----------|-----------|
| UI library | React 18 via CDN (`unpkg`) |
| JSX compiler | Babel standalone via CDN (in-browser) |
| Server | nginx:alpine |
| Test runner | Vitest + jsdom (dev-only) |

**No build step.** There is no webpack, Vite, or bundler for the runtime app. React and Babel are loaded via `<script>` tags from a CDN. JSX files use `<script type="text/babel">`. The `package.json` exists only to host vitest — it has zero effect on the served output.

## Hexagonal core (`src/shared/`)

All business logic and port adapters live in `src/shared/`. This is the tested, stable core.

```
src/shared/
├── domain.js           ← frozen factories + value objects
│                          exported on window.LacteoOp namespace
├── adapters/
│   ├── http.js         ← REST port adapters (calls the backend API)
│   └── offline.js      ← localStorage cache + sync queue
│                          wraps the http port for offline-capable surfaces
```

`window.LacteoOp` is the global namespace — all domain factories and value objects are attached here. Surface `.jsx` files consume `window.LacteoOp.*`.

**Rule**: Business logic goes in `src/shared/` and MUST have tests. `.jsx` surface files are view glue — they are not unit-tested.

## Surfaces

```
src/
├── index.html                  ← landing page — links to the 3 surfaces
├── pedidos/                    ← Asistente de ventas (desktop)
│   ├── index.html
│   ├── pedidos.css
│   ├── ConfirmModal.jsx
│   ├── Icons.jsx
│   ├── NewOrderForm.jsx
│   ├── OrderList.jsx
│   ├── Sidebar.jsx
│   └── TopBar.jsx
├── ruta/                       ← Conductor (mobile, OFFLINE-capable)
│   ├── index.html
│   ├── ruta.css
│   ├── RutaComponents.jsx
│   └── ios-frame.jsx
└── operacion/                  ← Gerente (desktop)
    ├── index.html
    ├── operacion.css
    └── OperacionComponents.jsx
```

`ruta/` is the offline-capable surface. It uses `src/shared/adapters/offline.js` which wraps `http.js` with a localStorage cache and a sync queue so it can function without a live backend connection.

## Tests

Tests live in `test/` and mirror `src/shared/`:

```
frontend/
├── package.json            ← vitest + jsdom (dev-only)
├── vitest.config.js
└── test/
    └── shared/
        ├── domain.test.js
        └── adapters/
            ├── http.test.js
            └── offline.test.js
```

The `test/` directory and `package.json`/`vitest.config.js` are excluded from the nginx Docker image — the Dockerfile copies only `src/`. Runtime stays CDN; tests are a dev concern.

```bash
# Install dev deps and run tests
cd frontend
npm ci
npm test      # vitest run (single pass, no watch)
```

## How to add a surface

1. Create `src/<name>/index.html` — copy the boilerplate from an existing surface. Load shared scripts from `../shared/`.
2. Create `src/<name>/<Name>Components.jsx` — import from `window.LacteoOp`.
3. Create `src/<name>/<name>.css` — surface-specific styles.
4. Register the new page in `src/index.html` (landing).
5. Add the new location block to `frontend/Dockerfile` nginx config if needed.
6. If the surface needs offline support, use `window.LacteoOp.adapters.offline` instead of `http` directly.

## How to add a port adapter in `src/shared/`

1. Add the function to `src/shared/adapters/http.js` (or `offline.js` if it must be cached).
2. Attach it to `window.LacteoOp.adapters` in the appropriate file.
3. Write a corresponding test in `test/shared/adapters/<file>.test.js`.
4. Consume it from the surface `.jsx` via `window.LacteoOp.adapters.*`.

## Gotchas

| Issue | Detail |
|-------|--------|
| No bundler | Never import from `node_modules` in `src/` — it won't work at runtime. CDN only. |
| `type="text/babel"` | All `.jsx` script tags must carry this attribute or Babel won't transpile them. |
| `window.LacteoOp` must be loaded first | Load `shared/domain.js` before any `.jsx` that uses it. Check script order in `index.html`. |
| Dev tools ≠ runtime | `package.json`, `node_modules`, and `test/` are dev-only. The nginx image ships only `src/`. |
| Offline sync | `offline.js` queues mutations in `localStorage` and replays them when the backend is reachable. Do not bypass it for `ruta/` surface mutations. |

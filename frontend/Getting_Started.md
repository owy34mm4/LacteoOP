# Getting Started — Frontend

Static multi-page app served by **nginx:alpine**.  
No build step — React 18 and Babel run in-browser via CDN.

## Surfaces

| Page          | Path                        | Role                       |
|---------------|-----------------------------|----------------------------|
| Landing       | `/`                         | Links to the three kits    |
| Pedidos       | `/pedidos/`                 | Order assistant (desktop)  |
| Ruta          | `/ruta/`                    | Driver route UI (mobile)   |
| Operación     | `/operacion/`               | Manager dashboard (desktop)|

## Run standalone

```bash
# From the frontend/ directory
docker build -t lacteoop-frontend .
docker run -p 8080:80 lacteoop-frontend
```

Open http://localhost:8080

## Run via Compose (recommended)

From the project root:

```bash
docker compose up --build frontend
```

## File structure

```
frontend/
├── Dockerfile
├── package.json            ← vitest + jsdom (dev tooling only)
├── vitest.config.js
├── src/
│   ├── index.html              ← landing page
│   ├── colors_and_type.css     ← design tokens
│   ├── assets/                 ← SVG brand assets
│   ├── shared/                 ← hexagonal core (tested)
│   │   ├── domain.js           ← domain factories + value objects (window.LacteoOp)
│   │   └── adapters/
│   │       ├── http.js         ← REST port adapters
│   │       └── offline.js      ← localStorage cache + sync queue
│   ├── pedidos/                ← order assistant surface (desktop)
│   ├── ruta/                   ← driver surface (mobile, offline-capable)
│   └── operacion/              ← manager dashboard surface (desktop)
└── test/                   ← mirrors src/shared/
    └── shared/
        ├── domain.test.js
        └── adapters/
            ├── http.test.js
            └── offline.test.js
```

---

## Run tests

The test suite covers `src/shared/` — the domain core and port adapters.  
**Dev tooling only** — `test/`, `package.json`, and `node_modules` are excluded from the nginx Docker image.

```bash
# From the frontend/ directory
npm install   # or: npm ci
npm test      # runs vitest in single-pass mode (no watch)
```

No browser required — tests run in jsdom via Vitest.

> Adding a new surface or JSX file does **not** require a new test. Add tests only when adding logic to `src/shared/`.

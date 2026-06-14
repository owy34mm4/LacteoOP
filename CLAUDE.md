# CLAUDE.md — LácteoOp (root)

Agent context for the LácteoOp monorepo. Read this first, then follow the layer-specific files.

## Monorepo map

```
.
├── docker-compose.yml          ← orchestrates all 3 services
├── .github/workflows/          ← CI/CD pipelines (feature / develop / main)
├── backend/                    ← FastAPI · Python 3.14 · hexagonal · MongoDB
│   ├── CLAUDE.md               ← backend agent context (read for backend work)
│   ├── Dockerfile              ← single-stage dev image (used by develop branch)
│   ├── Dockerfile.prod         ← multi-stage distroless (used by main branch)
│   ├── pytest.ini
│   ├── requirements-dev.txt
│   ├── src/                    ← application source (pythonpath root)
│   └── test/                   ← mirrors src/ — unit + integration tests
└── frontend/                   ← Static HTML/CSS/JSX · React 18 CDN · nginx
    ├── CLAUDE.md               ← frontend agent context (read for frontend work)
    ├── Dockerfile
    ├── package.json            ← dev tooling only (vitest)
    ├── vitest.config.js
    ├── src/                    ← served by nginx
    └── test/                   ← mirrors src/shared/ — vitest+jsdom tests
```

## Golden rules

| Rule | Detail |
|------|--------|
| Branch model | gitflow: `feature/**` → PR to `develop`; `develop` → PR to `main` |
| No direct push | `main` and `develop` are protected — PRs only |
| Conventional commits | `feat:`, `fix:`, `chore:`, `test:`, `docs:`, etc. |
| No Co-Authored-By | Never add AI attribution trailers to commits |
| Tests = PR gate | `feature.yml` runs all tests + builds the prod image on every PR to main/develop |
| Touch only what you own | Never edit files across both `backend/` and `frontend/` in a single commit |

## Hexagonal architecture — both sides

Both layers use hexagonal (ports & adapters). The dependency rule is identical on both sides: inner layers know nothing about outer layers.

```
Domain (innermost)
  └─ Application (uses domain ports)
       └─ Infrastructure (implements ports, wires everything)
```

- Backend detail → `backend/CLAUDE.md`
- Frontend detail → `frontend/CLAUDE.md`

## Tests

| Location | Runner | What | Marker |
|----------|--------|------|--------|
| `backend/test/` | pytest (asyncio_mode=auto) | Unit with fake repos + integration against Mongo | `@pytest.mark.integration` for Mongo tests |
| `frontend/test/` | vitest + jsdom | Unit tests for `src/shared/` only | — |

The `test/` tree mirrors `src/` in both halves. When you add a module, add its test.

Run all backend tests (unit + integration):
```bash
cd backend
uv venv --python 3.14
uv pip install -r src/requirements.txt -r requirements-dev.txt
uv run pytest
```

Run unit tests only (no Mongo needed):
```bash
uv run pytest -m "not integration"
```

Run integration tests (needs Mongo):
```bash
docker run -d --rm -p 27017:27017 mongo:7.0
MONGO_URL=mongodb://localhost:27017 uv run pytest -m integration
```

Run frontend tests:
```bash
cd frontend && npm ci && npm test
```

## Docker

| Mode | Image | Used by |
|------|-------|---------|
| Dev (single-stage) | `backend/Dockerfile` | `develop` branch CI, local `docker compose up` |
| Prod (distroless) | `backend/Dockerfile.prod` | `main` branch CI — Python 3.14 standalone → `gcr.io/distroless/cc-debian12` |
| Frontend | `frontend/Dockerfile` | Both environments — nginx:alpine |

Run everything locally:
```bash
docker compose up --build
```

Services: `frontend` (8080:80) · `backend` (8000:8000) · `mongodb` (27017:27017, mongo:7.0)

Build the prod backend image explicitly:
```bash
docker build -f backend/Dockerfile.prod -t lacteoop-backend:prod backend
```

## CI/CD workflows

| File | Trigger | Does |
|------|---------|------|
| `feature.yml` | push `feature/**`, PR to `main`/`develop` | tests + prod image build (PR gate) |
| `develop.yml` | push `develop` | tests + push single-stage image to DockerHub |
| `main.yml` | push `main`, tag `v*.*.*` | tests + push distroless image to DockerHub |
| `ci-tests.yml` | reusable | backend-tests job + frontend-tests job |
| `ci-build-push.yml` | reusable | matrix build (backend + frontend) → DockerHub |

DockerHub images: `lacteoop-backend` / `lacteoop-frontend`

Tags: `main` → `latest`/`main`/`sha-xxx`; tag `vX.Y.Z` → semver; `develop` → `develop`/`sha-xxx`

Required secrets: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`

## Commands cheatsheet

```bash
# Start full stack
docker compose up --build

# Stop and remove containers
docker compose down

# Backend — unit tests only
cd backend && uv run pytest -m "not integration"

# Backend — all tests (needs Mongo running)
docker run -d --rm -p 27017:27017 mongo:7.0
cd backend && MONGO_URL=mongodb://localhost:27017 uv run pytest

# Frontend — unit tests
cd frontend && npm ci && npm test

# Build prod backend image
docker build -f backend/Dockerfile.prod -t lacteoop-backend:prod backend
```

## Gotchas

| Issue | Fix |
|-------|-----|
| Python 3.14 required | `uv venv --python 3.14` — do not use system Python |
| `uv` manages packages | Never use `pip` directly; always go through `uv` |
| Persistence layer | Uses `pymongo.AsyncMongoClient` + `beanie` — NOT `motor`. Imports matter. |
| `MSYS_NO_PATHCONV=1` | On Windows Git Bash, absolute container paths like `/opt/...` get mangled by MSYS path conversion. Prefix docker commands with `MSYS_NO_PATHCONV=1` to suppress it. |
| `pythonpath=src` | pytest resolves imports from `backend/src/` — set in `pytest.ini`, do not change |
| Env vars | `MONGO_URL` (default `mongodb://localhost:27017`), `MONGO_DB` (default `lacteoop`) |

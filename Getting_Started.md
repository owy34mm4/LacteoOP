# Getting Started — LácteoOp

Full-stack prototype for Distribuidora Lácteos del Valle S.A.S.  
Orchestrated with Docker Compose: one command starts both services.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Compose v2)

## Run everything

```bash
docker compose up --build
```

| Service  | URL                        | Description                        |
|----------|----------------------------|------------------------------------|
| Frontend | http://localhost:8080      | Landing page + 3 UI kit surfaces   |
| Backend  | http://localhost:8000      | FastAPI root endpoint              |
| Health   | http://localhost:8000/health | Health check                     |
| Docs     | http://localhost:8000/docs | Auto-generated Swagger UI          |

## Stop

```bash
docker compose down
```

## Services

| Folder       | Stack                                     | Dockerfile              |
|--------------|-------------------------------------------|-------------------------|
| `frontend/`  | Static HTML/CSS/JSX · nginx               | `frontend/Dockerfile`   |
| `backend/`   | FastAPI · UV · Python 3.14                | `backend/Dockerfile`    |
| `mongodb`    | mongo:7.0 · healthcheck · port 27017      | (official image)        |

See each folder's own `Getting_Started.md` for standalone instructions.

---

## Run tests

### Backend (pytest)

Requires Python 3.14 and `uv`. Install once, then run any time:

```bash
cd backend
uv venv --python 3.14
uv pip install -r src/requirements.txt -r requirements-dev.txt
```

Unit tests only (no MongoDB needed):

```bash
uv run pytest -m "not integration"
```

All tests, including integration (needs a live MongoDB):

```bash
# Start a temporary MongoDB container
docker run -d --rm -p 27017:27017 mongo:7.0

# Run all tests
MONGO_URL=mongodb://localhost:27017 uv run pytest
```

### Frontend (vitest)

```bash
cd frontend
npm ci
npm test      # single pass, no watch
```

> Dev tooling only — the nginx image does not include `test/` or `node_modules`.

---

## Branches and CI

| Branch | CI behavior |
|--------|-------------|
| `feature/**` or PR → `main`/`develop` | Tests run + prod image built (PR gate) |
| `develop` | Tests + single-stage image pushed to DockerHub |
| `main` / tag `v*.*.*` | Tests + distroless image pushed to DockerHub |

Required secrets for DockerHub: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`.

---

## Build the production backend image (distroless)

```bash
docker build -f backend/Dockerfile.prod -t lacteoop-backend:prod backend
```

The prod image is multi-stage: it builds a Python 3.14 standalone binary and copies it into `gcr.io/distroless/cc-debian12` — no shell, no package manager, minimal attack surface.

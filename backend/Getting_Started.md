# Getting Started — Backend

Minimal **FastAPI** service managed with **UV** on Python 3.14.  
Image: `ghcr.io/astral-sh/uv:python3.14-trixie-slim`

## Endpoints

| Method | Path      | Description         |
|--------|-----------|---------------------|
| GET    | `/`       | Hello World message |
| GET    | `/health` | Health check        |
| GET    | `/docs`   | Swagger UI          |

## Run standalone

```bash
# From the backend/ directory
docker build -t lacteoop-backend .
docker run -p 8000:8000 lacteoop-backend
```

Open http://localhost:8000

## Run via Compose (recommended)

From the project root:

```bash
docker compose up --build backend
```

## File structure

```
backend/
├── Dockerfile              ← dev image (single-stage)
├── Dockerfile.prod         ← prod image (distroless)
├── pytest.ini              ← pythonpath=src, asyncio_mode=auto, marker: integration
├── requirements-dev.txt    ← pytest, pytest-asyncio, httpx
├── src/
│   ├── main.py             ← FastAPI app + lifespan wiring
│   ├── requirements.txt    ← runtime dependencies
│   ├── seed.py             ← initial data seed (runs at startup)
│   ├── domain/             ← entities, value objects, ports
│   ├── application/        ← services (use cases)
│   └── infrastructure/     ← routers, Mongo adapters, config
└── test/                   ← mirrors src/ structure
    ├── conftest.py
    ├── application/
    │   └── test_services.py
    └── infrastructure/
        └── adapters/
            └── outbound/
                └── mongo/
                    └── test_repositories.py
```

## Dependencies

Managed by **UV** (`uv pip install --system`). To add a package:

1. Add it to `src/requirements.txt`
2. Rebuild: `docker compose up --build backend`

---

## Environment variables

The backend reads these at startup (via `src/infrastructure/config/settings.py`):

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGO_URL` | `mongodb://localhost:27017` | MongoDB connection string |
| `MONGO_DB` | `lacteoop` | Database name |

When running via `docker compose up`, these are injected automatically. The backend **depends on the `mongodb` service** — it will not start until the MongoDB healthcheck passes.

---

## Run tests

Install dev dependencies first (one-time):

```bash
uv venv --python 3.14
uv pip install -r src/requirements.txt -r requirements-dev.txt
```

Unit tests only — no MongoDB needed:

```bash
uv run pytest -m "not integration"
```

Integration tests — requires a live MongoDB instance:

```bash
# Start a temporary MongoDB (or reuse the compose one)
docker run -d --rm -p 27017:27017 mongo:7.0

MONGO_URL=mongodb://localhost:27017 uv run pytest -m integration
```

All tests (unit + integration):

```bash
MONGO_URL=mongodb://localhost:27017 uv run pytest
```

Unit tests use in-memory fake repositories — no database is needed. Integration tests are marked `@pytest.mark.integration` and hit real MongoDB.

---

## Build the production image (distroless)

```bash
# From the project root
docker build -f backend/Dockerfile.prod -t lacteoop-backend:prod backend
```

The prod image is multi-stage: compiles a Python 3.14 standalone binary and copies it into `gcr.io/distroless/cc-debian12`. No shell or package manager at runtime.

> The `develop` branch ships `Dockerfile` (single-stage). The `main` branch ships `Dockerfile.prod` (distroless). See root `Getting_Started.md` for CI/CD details.

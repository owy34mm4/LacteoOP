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
├── Dockerfile
└── src/
    ├── main.py             ← FastAPI application
    └── requirements.txt    ← dependencies (fastapi, uvicorn)
```

## Dependencies

Managed by **UV** (`uv pip install --system`). To add a package:

1. Add it to `src/requirements.txt`
2. Rebuild: `docker compose up --build backend`

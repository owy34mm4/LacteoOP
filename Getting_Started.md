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

| Folder       | Stack                        | Dockerfile              |
|--------------|------------------------------|-------------------------|
| `frontend/`  | Static HTML/CSS/JSX · nginx  | `frontend/Dockerfile`   |
| `backend/`   | FastAPI · UV · Python 3.14   | `backend/Dockerfile`    |

See each folder's own `Getting_Started.md` for standalone instructions.

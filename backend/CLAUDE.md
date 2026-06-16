# CLAUDE.md — Backend

Agent context for the `backend/` FastAPI service. Read this before touching any backend file.

## Stack

| Component | Technology |
|-----------|-----------|
| Framework | FastAPI |
| Runtime | Python 3.14 |
| Package manager | `uv` |
| Database | MongoDB 7.0 |
| ODM | beanie (Document models) + `pymongo.AsyncMongoClient` |
| Base image (dev) | `ghcr.io/astral-sh/uv:python3.14-trixie-slim` |
| Base image (prod) | Python 3.14 standalone → `gcr.io/distroless/cc-debian12` |

## Hexagonal layers

```
src/
├── domain/                         ← innermost — knows nothing outside itself
│   ├── entities.py                 ← Pedido, Ruta, Operacion dataclasses
│   ├── value_objects.py            ← immutable value types
│   └── ports/
│       ├── inbound.py              ← use-case interfaces (ABCs)
│       └── outbound.py             ← repository interfaces (ABCs)
├── application/
│   └── services.py                 ← PedidoService, RutaService, OperacionService
│                                      (implements inbound ports, depends on outbound ports)
└── infrastructure/
    ├── adapters/
    │   ├── inbound/
    │   │   ├── pedido_router.py    ← FastAPI router — HTTP in → service call
    │   │   ├── ruta_router.py
    │   │   └── operacion_router.py
    │   └── outbound/
    │       └── mongo/
    │           ├── documents.py    ← beanie Document models (MongoDB schema)
    │           ├── mappers.py      ← Document ↔ domain entity conversion
    │           └── repositories.py ← implements outbound ports against MongoDB
    └── config/
        ├── database.py             ← beanie init + AsyncMongoClient setup
        └── settings.py             ← reads env vars (MONGO_URL, MONGO_DB)
```

**Dependency rule**: `domain` → nothing. `application` → `domain` ports only. `infrastructure` → everything (implements the ports).

Entrypoint: `src/main.py` — wires all services in a FastAPI `lifespan` (calls `init_beanie`, seeds data, registers routers).

## How to add a new service

1. Add entities/value objects to `src/domain/entities.py` and `src/domain/value_objects.py`.
2. Define the use-case interface in `src/domain/ports/inbound.py`.
3. Define the repository interface in `src/domain/ports/outbound.py`.
4. Implement the service in `src/application/services.py` (inject the outbound port).
5. Create the beanie Document in `src/infrastructure/adapters/outbound/mongo/documents.py`.
6. Add entity ↔ Document mappers in `mappers.py`.
7. Implement the repository in `repositories.py` (implement the outbound port ABC).
8. Add the FastAPI router in `src/infrastructure/adapters/inbound/<name>_router.py`.
9. Register the router and inject the repository in `src/main.py` lifespan.
10. Add mirror tests under `test/` (unit with fake repo, integration with `@pytest.mark.integration`).

## How to add an outbound Mongo adapter

When only adding a new persistence target (no new service):

1. `documents.py` — add the `Document` subclass.
2. `mappers.py` — add `to_document()` / `to_entity()` functions.
3. `repositories.py` — add the class implementing the outbound port ABC.
4. `main.py` lifespan — include the new `Document` in `init_beanie(document_models=[...])`.

## Tests

```
backend/
├── pytest.ini                  ← pythonpath=src, testpaths=test, asyncio_mode=auto, marker: integration
├── requirements-dev.txt        ← pytest, pytest-asyncio, httpx
└── test/                       ← mirrors src/ structure
    ├── conftest.py             ← shared fixtures (fake repositories, test app)
    ├── application/
    │   └── test_services.py    ← unit tests — use in-memory fake repos (no Mongo)
    └── infrastructure/
        └── adapters/
            └── outbound/
                └── mongo/
                    └── test_repositories.py  ← @pytest.mark.integration (needs Mongo)
```

Unit tests use **in-memory fake repositories** — no database needed.
Integration tests are marked `@pytest.mark.integration` and require a live MongoDB instance.

```bash
# Install dev deps
cd backend
uv venv --python 3.14
uv pip install -r src/requirements.txt -r requirements-dev.txt

# Unit tests only (no Mongo)
uv run pytest -m "not integration"

# All tests — spin up Mongo first
docker run -d --rm -p 27017:27017 mongo:7.0
MONGO_URL=mongodb://localhost:27017 uv run pytest

# Integration tests only
MONGO_URL=mongodb://localhost:27017 uv run pytest -m integration
```

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGO_URL` | `mongodb://localhost:27017` | MongoDB connection string |
| `MONGO_DB` | `lacteoop` | Database name |

In `docker-compose.yml` these are injected automatically. For local standalone runs, export them manually or rely on the defaults.

## API surface

| Router | Prefix | Domain |
|--------|--------|--------|
| `pedido_router` | `/pedidos` | Pedido CRUD |
| `ruta_router` | `/ruta` | Ruta (paradas + conductores) |
| `operacion_router` | `/operacion` | KPIs + dashboard data |
| `cliente_router` | `/clientes` | Cliente CRUD |
| `inventario_router` | `/inventario` | Existencias + movimientos |
| `configuracion_router` | `/configuracion` | App settings (singleton) |

Swagger UI available at `/docs`. Health check at `/health`.

## Gotchas

| Issue | Detail |
|-------|--------|
| `pymongo`, NOT `motor` | We use `pymongo.AsyncMongoClient` with beanie. Importing `motor` will break the setup. |
| `pythonpath=src` | pytest is configured to resolve imports from `src/`. Never change this. |
| `await client.close()` | The `AsyncMongoClient` must be explicitly closed in the lifespan shutdown; beanie does not do it automatically. |
| Seeding | `src/seed.py` is called during lifespan startup to populate initial data if collections are empty. |
| `asyncio_mode=auto` | All async test functions run automatically without `@pytest.mark.asyncio` decorators. |

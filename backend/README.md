# Backend — LácteoOp

Servicio REST construido con **FastAPI** siguiendo **arquitectura hexagonal**. Persiste en **MongoDB** usando beanie como ODM y `pymongo.AsyncMongoClient` para la conexión.

Para instrucciones de ejecución y tests → [`Getting_Started.md`](./Getting_Started.md).  
Para contexto de agente y convenciones → [`CLAUDE.md`](./CLAUDE.md).

---

## Arquitectura hexagonal

```
src/
├── domain/                         ← núcleo — sin dependencias externas
│   ├── entities.py                 ← Pedido, Ruta, Operacion
│   ├── value_objects.py
│   └── ports/
│       ├── inbound.py              ← interfaces de casos de uso (ABCs)
│       └── outbound.py             ← interfaces de repositorio (ABCs)
├── application/
│   └── services.py                 ← PedidoService · RutaService · OperacionService
└── infrastructure/
    ├── adapters/
    │   ├── inbound/
    │   │   ├── pedido_router.py
    │   │   ├── ruta_router.py
    │   │   └── operacion_router.py
    │   └── outbound/
    │       └── mongo/
    │           ├── documents.py    ← modelos beanie (esquema MongoDB)
    │           ├── mappers.py      ← Document ↔ entidad de dominio
    │           └── repositories.py ← implementa los ports outbound
    └── config/
        ├── database.py
        └── settings.py
```

**Regla de dependencia**: `domain` no importa nada externo. `application` depende solo de ports del dominio. `infrastructure` implementa los ports y conecta todo.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | FastAPI |
| Runtime | Python 3.14 |
| Gestor de paquetes | `uv` |
| Base de datos | MongoDB 7.0 |
| ODM | beanie + `pymongo.AsyncMongoClient` |
| Imagen dev | `ghcr.io/astral-sh/uv:python3.14-trixie-slim` |
| Imagen prod | Python 3.14 standalone → `gcr.io/distroless/cc-debian12` |

---

## API

| Router | Prefijo | Dominio |
|--------|---------|---------|
| `pedido_router` | `/pedidos` | CRUD de pedidos |
| `ruta_router` | `/rutas` | Gestión de rutas |
| `operacion_router` | `/operaciones` | KPIs y datos del dashboard |

Endpoints de infraestructura:

| Método | Path | Descripción |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/docs` | Swagger UI (auto-generado) |

---

## Persistencia (MongoDB + beanie)

La conexión usa `pymongo.AsyncMongoClient` (no `motor`). beanie se inicializa en el `lifespan` de FastAPI junto con el seed de datos iniciales.

Variables de entorno:

| Variable | Valor por defecto | Descripción |
|----------|------------------|-------------|
| `MONGO_URL` | `mongodb://localhost:27017` | String de conexión |
| `MONGO_DB` | `lacteoop` | Nombre de la base de datos |

---

## Tests

```
backend/
├── pytest.ini              ← pythonpath=src, asyncio_mode=auto, marker: integration
├── requirements-dev.txt
└── test/                   ← espeja la estructura de src/
    ├── conftest.py
    ├── application/
    │   └── test_services.py        ← unitarios con repos fake (sin Mongo)
    └── infrastructure/
        └── adapters/
            └── outbound/
                └── mongo/
                    └── test_repositories.py  ← @pytest.mark.integration
```

Los tests unitarios usan repositorios fake en memoria — no necesitan base de datos.  
Los tests de integración llevan `@pytest.mark.integration` y requieren MongoDB activo.

---

## Imágenes Docker

| Imagen | Archivo | Usado en |
|--------|---------|---------|
| Dev (single-stage) | `Dockerfile` | rama `develop`, `docker compose up` local |
| Prod (distroless) | `Dockerfile.prod` | rama `main` → DockerHub `lacteoop-backend` |

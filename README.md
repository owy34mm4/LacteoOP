# LácteoOp

Plataforma de distribución interna para **Distribuidora Lácteos del Valle S.A.S.**, una pyme láctea colombiana. Diseñada para cubrir los tres roles operativos clave del negocio: asistente de pedidos, conductor en ruta y gerente de operaciones.

Este repositorio contiene el prototipo funcional resultado del proceso de diseño de software — tres superficies de UI conectadas a un backend REST, orquestadas con Docker Compose.

---

## Superficies

| Superficie | Rol | Tipo |
|---|---|---|
| **Pedidos** | Asistente de ventas | Desktop — entrada rápida de pedidos por teléfono, autocompletado de clientes y productos, confirmación con toast |
| **Ruta** | Conductor | Móvil — lista de paradas, confirmación de entrega, modo sin conexión |
| **Operación** | Gerente | Desktop — KPIs en tiempo real, gráfico de pedidos por día, tabla ordenable, alertas activas |

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | HTML · CSS · React 18 (CDN) · Babel standalone |
| Servidor frontend | nginx:alpine |
| Backend | FastAPI · Python 3.14 |
| Gestor de paquetes | UV (`ghcr.io/astral-sh/uv:python3.14-trixie-slim`) |
| Base de datos | MongoDB 7.0 (`beanie` + `pymongo.AsyncMongoClient`) |
| Orquestación | Docker Compose |
| Tests backend | pytest · pytest-asyncio |
| Tests frontend | Vitest · jsdom |

---

## Inicio rápido

```bash
docker compose up --build
```

| Servicio | URL |
|---|---|
| Frontend | http://localhost:8080 |
| Backend API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |

> Para instrucciones detalladas por servicio, consultá [`Getting_Started.md`](./Getting_Started.md).  
> Cada subcarpeta también tiene su propia guía: [`frontend/Getting_Started.md`](./frontend/Getting_Started.md) y [`backend/Getting_Started.md`](./backend/Getting_Started.md).

---

## Estructura

```
.
├── docker-compose.yml
├── Getting_Started.md
├── .github/
│   └── workflows/              ← CI/CD (feature / develop / main)
├── backend/
│   ├── Dockerfile              ← imagen dev (single-stage)
│   ├── Dockerfile.prod         ← imagen prod (distroless)
│   ├── pytest.ini
│   ├── requirements-dev.txt
│   ├── Getting_Started.md
│   ├── src/
│   │   ├── main.py
│   │   ├── requirements.txt
│   │   ├── seed.py
│   │   ├── domain/
│   │   ├── application/
│   │   └── infrastructure/
│   └── test/                   ← espeja src/
└── frontend/
    ├── Dockerfile
    ├── package.json            ← vitest (solo dev)
    ├── vitest.config.js
    ├── Getting_Started.md
    ├── src/
    │   ├── index.html
    │   ├── colors_and_type.css
    │   ├── assets/
    │   ├── shared/             ← núcleo hexagonal
    │   ├── pedidos/
    │   ├── ruta/
    │   └── operacion/
    └── test/                   ← espeja src/shared/
```

---

## Tests / Calidad

Ambas capas tienen tests automáticos que son **puerta de entrada a PRs** (`feature.yml` los ejecuta en cada PR hacia `main` o `develop`).

| Capa | Runner | Cobertura | Comando |
|------|--------|-----------|---------|
| Backend | pytest (asyncio) | Unitarios con repos fake + integración con Mongo | `cd backend && uv run pytest` |
| Frontend | Vitest + jsdom | Núcleo `src/shared/` (domain + adapters) | `cd frontend && npm test` |

Los tests de integración del backend requieren MongoDB y se marcan con `@pytest.mark.integration`.  
Los tests del frontend son solo de desarrollo — la imagen nginx no los incluye.

---

## CI/CD + DockerHub

| Workflow | Disparador | Acción |
|----------|-----------|--------|
| `feature.yml` | push `feature/**`, PR a `main`/`develop` | Tests + build imagen prod (puerta de PR) |
| `develop.yml` | push `develop` | Tests + push imagen single-stage a DockerHub |
| `main.yml` | push `main`, tag `v*.*.*` | Tests + push imagen distroless a DockerHub |

Imágenes publicadas: `lacteoop-backend` · `lacteoop-frontend`

Tags: `main` → `latest`/`main`/`sha-xxx` · tag semver `vX.Y.Z` → versión semántica · `develop` → `develop`/`sha-xxx`

Secrets requeridos: `DOCKERHUB_USERNAME` · `DOCKERHUB_TOKEN`

---

## Modelo de ramas (gitflow)

```
feature/**  →  PR  →  develop  →  PR  →  main
```

- `main` y `develop` son ramas protegidas — sin push directo.
- Commits en formato convencional: `feat:`, `fix:`, `chore:`, `test:`, `docs:`, etc.
- `feature.yml` corre tests y construye la imagen prod en cada PR (puerta obligatoria).

---

## MongoDB

El servicio `mongodb` corre en el compose local (puerto 27017, imagen `mongo:7.0` con healthcheck). El backend depende de él y no arranca hasta que el healthcheck pasa.

Variables de entorno leídas por el backend:

| Variable | Valor por defecto |
|----------|------------------|
| `MONGO_URL` | `mongodb://localhost:27017` |
| `MONGO_DB` | `lacteoop` |

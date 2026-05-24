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
| Orquestación | Docker Compose |

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
├── backend/
│   ├── Dockerfile
│   ├── Getting_Started.md
│   └── src/
│       ├── main.py
│       └── requirements.txt
└── frontend/
    ├── Dockerfile
    ├── Getting_Started.md
    └── src/
        ├── index.html
        ├── colors_and_type.css
        ├── assets/
        ├── pedidos/
        ├── ruta/
        └── operacion/
```

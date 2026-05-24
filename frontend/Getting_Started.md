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
└── src/
    ├── index.html              ← landing page
    ├── colors_and_type.css     ← design tokens
    ├── assets/                 ← SVG brand assets
    ├── pedidos/                ← order assistant kit
    ├── ruta/                   ← driver mobile kit
    └── operacion/              ← manager dashboard kit
```

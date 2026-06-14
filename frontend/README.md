# Frontend — LácteoOp

App multi-página estática servida por **nginx:alpine**. Sin bundler: React 18 y Babel corren en el navegador vía CDN. La lógica de negocio reside en un núcleo hexagonal (`src/shared/`) que es independiente de las vistas.

Para instrucciones de ejecución y tests → [`Getting_Started.md`](./Getting_Started.md).  
Para contexto de agente y convenciones → [`CLAUDE.md`](./CLAUDE.md).

---

## Las 3 superficies

| Superficie | Ruta | Rol | Tipo |
|-----------|------|-----|------|
| Pedidos | `/pedidos/` | Asistente de ventas | Desktop — entrada rápida, autocompletado, toast de confirmación |
| Ruta | `/ruta/` | Conductor | Móvil — lista de paradas, confirmación de entrega, **sin conexión** |
| Operación | `/operacion/` | Gerente | Desktop — KPIs en tiempo real, gráfico, tabla ordenable, alertas |

La superficie **Ruta** es offline-capable: usa `src/shared/adapters/offline.js`, que encola mutaciones en `localStorage` y las sincroniza cuando el backend vuelve a estar disponible.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| UI library | React 18 (CDN — `unpkg`) |
| Compilador JSX | Babel standalone (CDN, in-browser) |
| Servidor | nginx:alpine |
| Tests | Vitest + jsdom (solo desarrollo) |

No hay paso de build para el runtime. Los archivos `.jsx` se cargan con `<script type="text/babel">`.

---

## Núcleo hexagonal (`src/shared/`)

```
src/shared/
├── domain.js           ← factories y value objects inmutables
│                          disponibles en window.LacteoOp
└── adapters/
    ├── http.js         ← port adapters REST (llama al backend)
    └── offline.js      ← caché localStorage + cola de sincronización
                           envuelve http.js para soporte offline
```

Regla: la lógica de negocio va en `src/shared/` y tiene tests. Los archivos `.jsx` son glue de vista — no se testean unitariamente.

---

## Estructura

```
frontend/
├── Dockerfile
├── package.json            ← vitest (solo dev)
├── vitest.config.js
├── src/
│   ├── index.html          ← landing page
│   ├── colors_and_type.css ← tokens de diseño
│   ├── assets/             ← SVGs de marca
│   ├── shared/             ← núcleo hexagonal
│   │   ├── domain.js
│   │   └── adapters/
│   │       ├── http.js
│   │       └── offline.js
│   ├── pedidos/            ← superficie asistente
│   ├── ruta/               ← superficie conductor (offline)
│   └── operacion/          ← superficie gerente
└── test/                   ← espeja src/shared/
    └── shared/
        ├── domain.test.js
        └── adapters/
            ├── http.test.js
            └── offline.test.js
```

---

## Tests

Los tests cubren únicamente `src/shared/` — el núcleo de dominio y los port adapters.

```bash
cd frontend
npm ci
npm test   # vitest run — pase único, sin watch
```

`test/` y `package.json` son excluidos de la imagen nginx — el Dockerfile copia solo `src/`.

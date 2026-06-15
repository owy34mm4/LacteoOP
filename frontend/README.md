# Frontend — LácteoOp

SPA **Vite + React 18 + TypeScript** servida por **nginx-unprivileged** en el puerto **8080**. La lógica de negocio reside en un núcleo hexagonal (`src/shared/`) independiente de las vistas. Paquetes gestionados con **pnpm**.

Para instrucciones de ejecución y Docker → [`Getting_Started.md`](./Getting_Started.md).  
Para contexto de agente y convenciones → [`CLAUDE.md`](./CLAUDE.md).

---

## Las 7 superficies

| Superficie | Ruta | Rol | Backend |
|-----------|------|-----|---------|
| **Pedidos** | `/pedidos` | Asistente de ventas | Real — `PedidoPort` |
| **Ruta** | `/ruta` | Conductor (móvil, sin conexión) | Real — `ParadaPort` + `ConductorPort` |
| **Operación** | `/operacion` | Gerente (KPIs, alertas, gráfico) | Real — `OperacionPort` |
| **Clientes** | `/clientes` | Lista de clientes | Real — `PedidoPort.listarClientes` |
| **Inventario** | `/inventario` | Inventario de productos | **Mock** — sin endpoint de backend aún |
| **Privacidad** | `/privacidad` | Aviso de privacidad (Ley 1581) | **Mock** — sin endpoint de backend aún |
| **Configuración** | `/configuracion` | Ajustes de la app | **Mock** — sin endpoint de backend aún |

La superficie **Ruta** es offline-capable: usa `src/shared/adapters/offline.ts`, que encola mutaciones en `localStorage` y las sincroniza cuando el backend vuelve a estar disponible.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| UI library | React 18 (bundled) |
| Lenguaje | TypeScript 5 (`strict`) |
| Bundler | Vite 6 + `@vitejs/plugin-react` |
| Router | React Router DOM 6 |
| Iconos | `lucide-react` |
| Fuentes | Onest + JetBrains Mono (Google Fonts CDN) |
| Gestor de paquetes | pnpm |
| Tests | Vitest 2 + jsdom + Testing Library |
| Imagen runtime | `nginxinc/nginx-unprivileged:alpine` (no-root, puerto 8080) |

---

## Núcleo hexagonal (`src/shared/`)

```
src/shared/
├── domain.ts           ← factories y tipos TypeScript (Pedido, Parada, Conductor, Alerta)
├── ports.ts            ← interfaces de puerto (PedidoPort, ParadaPort, …)
├── config.ts           ← API_BASE (VITE_API_BASE env var o "/api")
└── adapters/
    ├── http.ts         ← implementaciones REST + capa de mapeo
    │                      backend Spanish snake_case ↔ domain English shape
    └── offline.ts      ← caché localStorage + cola de sincronización (envuelve http)
```

**Regla**: la lógica de negocio va en `src/shared/` y tiene tests. Los archivos de superficie son glue de vista — no se testean unitariamente.

---

## Estructura

```
frontend/
├── Dockerfile              ← multi-stage: node:20-alpine build → nginx-unprivileged (8080)
├── nginx.conf              ← /api/ proxied a backend:8000; SPA fallback a index.html
├── vite.config.ts          ← proxy dev /api → localhost:8000; outDir: dist/
├── vitest.config.ts        ← config de tests separada (env: jsdom)
├── package.json            ← packageManager: pnpm
├── src/
│   ├── main.tsx            ← entry point
│   ├── app/
│   │   ├── App.tsx         ← shell AppSidebar + <Outlet />
│   │   └── routes.tsx      ← 7 rutas (lazy-loaded)
│   ├── shared/             ← núcleo hexagonal
│   ├── components/         ← primitivos de UI compartidos (Shell, Modal, Icons, Ley-1581)
│   ├── surfaces/           ← una carpeta por superficie
│   └── styles/             ← tokens de diseño + CSS por superficie
└── test/                   ← espeja src/ (vitest + jsdom)
    ├── setup.ts
    └── shared/
        ├── domain.test.ts
        └── adapters/
            ├── http.test.ts
            └── offline.test.ts
```

---

## Tests

Los tests cubren `src/shared/` — dominio y port adapters.

```bash
cd frontend
pnpm install
pnpm test        # vitest run — pase único, sin watch
```

`test/` se excluye de la imagen nginx — el Dockerfile copia solo `dist/` (salida del build).

---

## Componentes de cumplimiento (Ley 1581)

`src/components/` incluye los componentes de privacidad requeridos por la Ley 1581 de Colombia:

| Componente | Propósito |
|-----------|---------|
| `PrivacyNoticeBanner` | Banner de aviso de privacidad |
| `DataConsentModal` | Modal de consentimiento de datos |
| `DataDeletionForm` | Formulario de solicitud de eliminación |
| `ProtectedDataLabel` | Etiqueta para campos de datos protegidos |

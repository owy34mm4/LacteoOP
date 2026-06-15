import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import { lazy, Suspense } from 'react';

const PedidosPage     = lazy(() => import('../surfaces/pedidos/PedidosPage'));
const RutaPage        = lazy(() => import('../surfaces/ruta/RutaPage'));
const OperacionPage   = lazy(() => import('../surfaces/operacion/OperacionPage'));
const ClientesPage    = lazy(() => import('../surfaces/clientes/ClientesPage'));
const InventarioPage  = lazy(() => import('../surfaces/inventario/InventarioPage'));
const PrivacidadPage  = lazy(() => import('../surfaces/privacidad/PrivacidadPage'));
const ConfiguracionPage = lazy(() => import('../surfaces/configuracion/ConfiguracionPage'));

const Fallback = () => <div style={{ padding: 40, textAlign: 'center', color: 'var(--fg-3)' }}>Cargando…</div>;

// Ruta is a standalone mobile surface — mounts at root, bypasses the App shell.
// All desktop surfaces (including operacion) mount as children of App.
export const router = createBrowserRouter([
  {
    path: '/ruta',
    element: <Suspense fallback={<Fallback />}><RutaPage /></Suspense>,
  },
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Suspense fallback={<Fallback />}><PedidosPage /></Suspense> },
      { path: 'pedidos',       element: <Suspense fallback={<Fallback />}><PedidosPage /></Suspense> },
      { path: 'operacion',     element: <Suspense fallback={<Fallback />}><OperacionPage /></Suspense> },
      { path: 'clientes',      element: <Suspense fallback={<Fallback />}><ClientesPage /></Suspense> },
      { path: 'inventario',    element: <Suspense fallback={<Fallback />}><InventarioPage /></Suspense> },
      { path: 'privacidad',    element: <Suspense fallback={<Fallback />}><PrivacidadPage /></Suspense> },
      { path: 'configuracion', element: <Suspense fallback={<Fallback />}><ConfiguracionPage /></Suspense> },
    ],
  },
]);

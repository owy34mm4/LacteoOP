import { API_BASE } from '../config';
import type { Pedido, Parada, Conductor, Alerta, EstadoPedidoValue, EstadoParadaValue, TipoAlertaValue, Existencia, Movimiento } from '../domain';
import type { PedidoPort, ParadaPort, ConductorPort, OperacionPort, ClientePort, InventarioPort, KPIs, BarData, Cliente, Producto, NuevoCliente } from '../ports';

// ---- Backend (snake_case Spanish) <-> domain (UI shape) mapping ----
// CRITICAL: backend serializes in Spanish snake_case; UI domain shape is English.
// This adapter is the ONLY place translations happen — tsc + vitest do NOT catch
// a missing mapper because fetch returns `any`/`unknown` at runtime.

// ---- Pedido ----
interface ApiLinea {
  producto_sku: string;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
}
interface ApiPedido {
  id: string;
  hora: string;
  cliente_nombre: string;
  lineas?: ApiLinea[];
  monto: number;
  direccion: string;
  ciudad: string;
  estado: string;
  timestamp: string;
}

const mapPedido = (p: ApiPedido): Pedido => ({
  id: p.id,
  time: p.hora,
  client: p.cliente_nombre,
  items: p.lineas?.length ?? 0,
  address: p.direccion,
  amount: p.monto,
  state: p.estado as EstadoPedidoValue,
});

// ---- Parada ----
interface ApiParada {
  id: string;
  numero: number;
  cliente: string;
  direccion: string;
  items: number;
  monto: number;
  eta: string;
  estado: string;
  recibido_por: string | null;
  problema: string | null;
}

const ESTADO_LABEL_MAP: Record<string, string> = {
  pending: 'pendiente',
  active: 'próxima parada',
  done: 'entregado',
  problem: 'problema',
};

const mapParada = (p: ApiParada): Parada => {
  const status = p.estado as EstadoParadaValue;
  return {
    id: p.id,
    num: p.numero,
    client: p.cliente,
    addr: p.direccion,
    items: p.items,
    amount: p.monto,
    eta: p.eta,
    status,
    label: ESTADO_LABEL_MAP[status] ?? p.estado,
    receivedBy: p.recibido_por,
  };
};

// ---- Conductor ----
interface ApiConductor {
  id: string;
  nombre: string;
  iniciales: string;
  zona: string;
  paradas_hechas: number;
  total_paradas: number;
}

const mapConductor = (c: ApiConductor): Conductor => ({
  id: c.id,
  name: c.nombre,
  initials: c.iniciales,
  zone: c.zona,
  done: c.paradas_hechas,
  total: c.total_paradas,
});

// ---- Alerta ----
interface ApiAlerta {
  id: string;
  tipo: string;
  titulo: string;
  subtitulo: string;
  timestamp: string;
}

const mapAlerta = (a: ApiAlerta): Alerta => ({
  id: a.id,
  kind: a.tipo as TipoAlertaValue,
  title: a.titulo,
  sub: a.subtitulo,
  when: a.timestamp,
});

// ---- Cliente ----
interface ApiCliente {
  id: string;
  nombre: string;
  ciudad: string;
  direccion: string;
  telefono: string;
}

const mapCliente = (c: ApiCliente): Cliente => ({
  id: c.id,
  name: c.nombre,
  city: c.ciudad,
  addr: c.direccion,
  phone: c.telefono,
});

const mapClienteToApi = (input: Partial<NuevoCliente>): Partial<{nombre: string; ciudad: string; direccion: string; telefono: string}> => {
  const body: Partial<{nombre: string; ciudad: string; direccion: string; telefono: string}> = {};
  if (input.name !== undefined) body.nombre = input.name;
  if (input.city !== undefined) body.ciudad = input.city;
  if (input.addr !== undefined) body.direccion = input.addr;
  if (input.phone !== undefined) body.telefono = input.phone;
  return body;
};

// ---- Producto ----
interface ApiProducto {
  sku: string;
  nombre: string;
  precio: number;
}

const mapProducto = (p: ApiProducto): Producto => ({
  sku: p.sku,
  name: p.nombre,
  price: p.precio,
});

// ---- Existencia ----
interface ApiExistencia {
  sku: string;
  nombre: string;
  categoria: string;
  stock: number;
  max_stock: number;
  unidad: string;
  precio: number;
  dias_vencimiento: number;
  lote: string;
}

export const mapExistencia = (e: ApiExistencia): Existencia => ({
  sku: e.sku,
  name: e.nombre,
  cat: e.categoria,
  stock: e.stock,
  max: e.max_stock,
  unit: e.unidad,
  price: e.precio,
  expiry: e.dias_vencimiento,
  lot: e.lote,
});

// ---- Movimiento ----
interface ApiMovimiento {
  id: string;
  tipo: string;
  titulo: string;
  cantidad: number;
  unidad: string;
  hora: string;
}

export const mapMovimiento = (m: ApiMovimiento): Movimiento => ({
  id: m.id,
  type: m.tipo,
  title: m.titulo,
  qty: m.cantidad,
  unit: m.unidad,
  time: m.hora,
});

// ---- HTTP helpers ----
const jsonHeaders = { 'Content-Type': 'application/json' };

const get = async <T>(url: string): Promise<T> => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(r.statusText);
  return r.json() as Promise<T>;
};

const post = async <T>(url: string, body: unknown): Promise<T> => {
  const r = await fetch(url, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(r.statusText);
  return r.json() as Promise<T>;
};

const patch = async <T>(url: string, body: unknown): Promise<T> => {
  const r = await fetch(url, {
    method: 'PATCH',
    headers: jsonHeaders,
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(r.statusText);
  return r.json() as Promise<T>;
};

const del = async (url: string): Promise<void> => {
  const r = await fetch(url, { method: 'DELETE' });
  if (!r.ok) throw new Error(r.statusText);
};

// ---- Port implementations ----

export const httpPedidoPort = (baseUrl: string = API_BASE): PedidoPort => ({
  // Trailing slash matches the backend collection routes (@router.get/post "/") and
  // avoids a 307 redirect that would not survive the /api proxy rewrite.
  listar: async () => (await get<ApiPedido[]>(`${baseUrl}/pedidos/`)).map(mapPedido),
  crear: async (input) =>
    mapPedido(
      await post<ApiPedido>(`${baseUrl}/pedidos/`, {
        cliente_nombre: input.client.name,
        ciudad: input.client.city,
        direccion: input.client.addr,
        telefono: input.phone,
        lineas: input.lines.map((l) => ({
          producto_sku: l.sku,
          nombre: l.name,
          cantidad: l.qty,
          precio_unitario: l.price,
        })),
      }),
    ),
  actualizarEstado: async (id, estado) =>
    mapPedido(await patch<ApiPedido>(`${baseUrl}/pedidos/${id}/estado`, { estado })),
  listarClientes: async () => (await get<ApiCliente[]>(`${baseUrl}/pedidos/clientes`)).map(mapCliente),
  listarProductos: async () => (await get<ApiProducto[]>(`${baseUrl}/pedidos/productos`)).map(mapProducto),
});

export const httpParadaPort = (baseUrl: string = API_BASE): ParadaPort => ({
  listar: async () => (await get<ApiParada[]>(`${baseUrl}/ruta/paradas`)).map(mapParada),
  marcarEntrega: async (id, recibidoPor) =>
    mapParada(await patch<ApiParada>(`${baseUrl}/ruta/paradas/${id}/entrega`, { recibido_por: recibidoPor })),
  reportarProblema: async (id, problema) =>
    mapParada(await patch<ApiParada>(`${baseUrl}/ruta/paradas/${id}/problema`, { problema })),
  sincronizar: async (acciones) =>
    (await post<ApiParada[]>(`${baseUrl}/ruta/paradas/sync`, acciones)).map(mapParada),
});

export const httpConductorPort = (baseUrl: string = API_BASE): ConductorPort => ({
  listar: async () => (await get<ApiConductor[]>(`${baseUrl}/ruta/conductores`)).map(mapConductor),
});

export const httpOperacionPort = (baseUrl: string = API_BASE): OperacionPort => ({
  obtenerKpis: () => get<KPIs>(`${baseUrl}/operacion/kpis`),
  obtenerAlertas: async () => (await get<ApiAlerta[]>(`${baseUrl}/operacion/alertas`)).map(mapAlerta),
  obtenerGrafico: () => get<BarData[]>(`${baseUrl}/operacion/grafico`),
  obtenerPedidos: async () => (await get<ApiPedido[]>(`${baseUrl}/operacion/pedidos`)).map(mapPedido),
  obtenerConductores: async () => (await get<ApiConductor[]>(`${baseUrl}/operacion/conductores`)).map(mapConductor),
});

export const httpClientePort = (baseUrl: string = API_BASE): ClientePort => ({
  listar: async () => (await get<ApiCliente[]>(`${baseUrl}/clientes/`)).map(mapCliente),
  obtener: async (id) => mapCliente(await get<ApiCliente>(`${baseUrl}/clientes/${id}`)),
  crear: async (input) =>
    mapCliente(
      await post<ApiCliente>(`${baseUrl}/clientes/`, {
        nombre: input.name,
        ciudad: input.city,
        direccion: input.addr,
        telefono: input.phone,
      }),
    ),
  actualizar: async (id, input) =>
    mapCliente(await patch<ApiCliente>(`${baseUrl}/clientes/${id}`, mapClienteToApi(input))),
  eliminar: async (id) => del(`${baseUrl}/clientes/${id}`),
});

export const httpInventarioPort = (baseUrl: string = API_BASE): InventarioPort => ({
  listarExistencias: async () =>
    (await get<ApiExistencia[]>(`${baseUrl}/inventario/existencias`)).map(mapExistencia),
  ajustarStock: async (sku, delta) =>
    mapExistencia(
      await patch<ApiExistencia>(`${baseUrl}/inventario/existencias/${sku}/stock`, { delta }),
    ),
  listarMovimientos: async () =>
    (await get<ApiMovimiento[]>(`${baseUrl}/inventario/movimientos`)).map(mapMovimiento),
});

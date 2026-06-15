import { API_BASE } from '../config';
import type { Pedido, EstadoPedidoValue } from '../domain';
import type { PedidoPort, ParadaPort, ConductorPort, OperacionPort } from '../ports';

// ---- Backend (snake_case Spanish) <-> domain (UI shape) mapping ----
// The backend serializes pedidos as {id, hora, cliente_nombre, lineas[], monto,
// direccion, ciudad, estado, timestamp} (see infrastructure/adapters/inbound/pedido_router.py).
// The UI/domain shape is {id, time, client, items, address, amount, state}. This adapter
// translates between them — that translation is the outbound adapter's responsibility.
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
  lineas: ApiLinea[];
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
  listarClientes: () => get(`${baseUrl}/pedidos/clientes`),
  listarProductos: () => get(`${baseUrl}/pedidos/productos`),
});

export const httpParadaPort = (baseUrl: string = API_BASE): ParadaPort => ({
  listar: () => get(`${baseUrl}/ruta/paradas`),
  marcarEntrega: (id, recibidoPor) => patch(`${baseUrl}/ruta/paradas/${id}/entrega`, { recibido_por: recibidoPor }),
  reportarProblema: (id, problema) => patch(`${baseUrl}/ruta/paradas/${id}/problema`, { problema }),
  sincronizar: (acciones) => post(`${baseUrl}/ruta/paradas/sync`, acciones),
});

export const httpConductorPort = (baseUrl: string = API_BASE): ConductorPort => ({
  listar: () => get(`${baseUrl}/ruta/conductores`),
});

export const httpOperacionPort = (baseUrl: string = API_BASE): OperacionPort => ({
  obtenerKpis: () => get(`${baseUrl}/operacion/kpis`),
  obtenerAlertas: () => get(`${baseUrl}/operacion/alertas`),
  obtenerGrafico: () => get(`${baseUrl}/operacion/grafico`),
  obtenerPedidos: () => get(`${baseUrl}/operacion/pedidos`),
  obtenerConductores: () => get(`${baseUrl}/operacion/conductores`),
});

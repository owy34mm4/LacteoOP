import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { httpPedidoPort, httpParadaPort, httpConductorPort, httpOperacionPort } from '../../../src/shared/adapters/http';

const BASE = '/api';

function mockFetchOk(data: unknown) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: async () => data,
    statusText: 'OK',
  });
}

function mockFetchFail(statusText = 'Internal Server Error') {
  return vi.fn().mockResolvedValue({
    ok: false,
    json: async () => ({}),
    statusText,
  });
}

beforeEach(() => {
  global.fetch = mockFetchOk({}) as unknown as typeof fetch;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('PedidoPort', () => {
  it('listar GETs /api/pedidos/ and maps the backend shape to the domain shape', async () => {
    const apiPedido = {
      id: '4817', hora: '09:14', cliente_nombre: 'Tienda La Esquina',
      lineas: [{ producto_sku: 'LEC-1L', nombre: 'Leche', cantidad: 12, precio_unitario: 3500 }],
      monto: 142500, direccion: 'Cra 5 #10-20', ciudad: 'Palmira', estado: 'recibido',
      timestamp: '2026-05-22T09:14:00',
    };
    global.fetch = mockFetchOk([apiPedido]) as unknown as typeof fetch;
    const result = await httpPedidoPort(BASE).listar();
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/pedidos/`);
    expect(result[0]).toEqual({
      id: '4817', time: '09:14', client: 'Tienda La Esquina',
      items: 1, address: 'Cra 5 #10-20', amount: 142500, state: 'recibido',
    });
  });

  it('crear maps a domain draft to the backend request body and POSTs /api/pedidos/', async () => {
    global.fetch = mockFetchOk({}) as unknown as typeof fetch;
    const draft = {
      client: { name: 'Tienda La Esquina', city: 'Palmira', addr: 'Cra 5 #10-20' },
      phone: '+57 312 555 4821',
      lines: [{ sku: 'LEC-1L', name: 'Leche', qty: 12, price: 3500 }],
    };
    await httpPedidoPort(BASE).crear(draft);
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/pedidos/`,
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_nombre: 'Tienda La Esquina',
          ciudad: 'Palmira',
          direccion: 'Cra 5 #10-20',
          telefono: '+57 312 555 4821',
          lineas: [{ producto_sku: 'LEC-1L', nombre: 'Leche', cantidad: 12, precio_unitario: 3500 }],
        }),
      }),
    );
  });

  it('actualizarEstado calls PATCH /api/pedidos/{id}/estado', async () => {
    global.fetch = mockFetchOk({}) as unknown as typeof fetch;
    await httpPedidoPort(BASE).actualizarEstado('4817', 'enruta');
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/pedidos/4817/estado`,
      expect.objectContaining({
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'enruta' }),
      }),
    );
  });

  it('listarClientes calls GET /api/pedidos/clientes', async () => {
    global.fetch = mockFetchOk([]) as unknown as typeof fetch;
    await httpPedidoPort(BASE).listarClientes();
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/pedidos/clientes`);
  });

  it('listarProductos calls GET /api/pedidos/productos', async () => {
    global.fetch = mockFetchOk([]) as unknown as typeof fetch;
    await httpPedidoPort(BASE).listarProductos();
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/pedidos/productos`);
  });

  it('get rejects when response ok:false', async () => {
    global.fetch = mockFetchFail('Not Found') as unknown as typeof fetch;
    await expect(httpPedidoPort(BASE).listar()).rejects.toThrow('Not Found');
  });

  it('post rejects when response ok:false', async () => {
    global.fetch = mockFetchFail('Bad Request') as unknown as typeof fetch;
    const draft = { client: { name: 'X', city: 'Y', addr: 'Z' }, phone: '', lines: [] };
    await expect(httpPedidoPort(BASE).crear(draft)).rejects.toThrow('Bad Request');
  });

  it('patch rejects when response ok:false', async () => {
    global.fetch = mockFetchFail('Unprocessable Entity') as unknown as typeof fetch;
    await expect(httpPedidoPort(BASE).actualizarEstado('1', 'enruta')).rejects.toThrow('Unprocessable Entity');
  });
});

describe('ParadaPort', () => {
  it('listar calls GET /api/ruta/paradas', async () => {
    global.fetch = mockFetchOk([]) as unknown as typeof fetch;
    await httpParadaPort(BASE).listar();
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/ruta/paradas`);
  });

  it('marcarEntrega calls PATCH /api/ruta/paradas/{id}/entrega', async () => {
    global.fetch = mockFetchOk({}) as unknown as typeof fetch;
    await httpParadaPort(BASE).marcarEntrega('p1', 'Juan');
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/ruta/paradas/p1/entrega`,
      expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ recibido_por: 'Juan' }) }),
    );
  });

  it('reportarProblema calls PATCH', async () => {
    global.fetch = mockFetchOk({}) as unknown as typeof fetch;
    await httpParadaPort(BASE).reportarProblema('p2', 'Sin acceso');
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/ruta/paradas/p2/problema`,
      expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ problema: 'Sin acceso' }) }),
    );
  });

  it('sincronizar calls POST', async () => {
    global.fetch = mockFetchOk([]) as unknown as typeof fetch;
    const acciones = [{ action: 'entrega', id: 'p1', recibido_por: 'X' }];
    await httpParadaPort(BASE).sincronizar(acciones);
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/ruta/paradas/sync`,
      expect.objectContaining({ method: 'POST', body: JSON.stringify(acciones) }),
    );
  });
});

describe('ConductorPort', () => {
  it('listar calls GET /api/ruta/conductores', async () => {
    global.fetch = mockFetchOk([]) as unknown as typeof fetch;
    await httpConductorPort(BASE).listar();
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/ruta/conductores`);
  });
});

describe('OperacionPort', () => {
  it('obtenerKpis', async () => {
    global.fetch = mockFetchOk({}) as unknown as typeof fetch;
    await httpOperacionPort(BASE).obtenerKpis();
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/operacion/kpis`);
  });
  it('obtenerAlertas', async () => {
    global.fetch = mockFetchOk([]) as unknown as typeof fetch;
    await httpOperacionPort(BASE).obtenerAlertas();
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/operacion/alertas`);
  });
  it('obtenerGrafico', async () => {
    global.fetch = mockFetchOk([]) as unknown as typeof fetch;
    await httpOperacionPort(BASE).obtenerGrafico();
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/operacion/grafico`);
  });
  it('obtenerPedidos', async () => {
    global.fetch = mockFetchOk([]) as unknown as typeof fetch;
    await httpOperacionPort(BASE).obtenerPedidos();
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/operacion/pedidos`);
  });
  it('obtenerConductores', async () => {
    global.fetch = mockFetchOk([]) as unknown as typeof fetch;
    await httpOperacionPort(BASE).obtenerConductores();
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/operacion/conductores`);
  });
});

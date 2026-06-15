import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { httpPedidoPort, httpParadaPort, httpConductorPort, httpOperacionPort, httpClientePort } from '../../../src/shared/adapters/http';

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

describe('ParadaPort — URL routing', () => {
  it('listar calls GET /api/ruta/paradas', async () => {
    global.fetch = mockFetchOk([]) as unknown as typeof fetch;
    await httpParadaPort(BASE).listar();
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/ruta/paradas`);
  });

  it('marcarEntrega calls PATCH /api/ruta/paradas/{id}/entrega', async () => {
    // Return a minimal ApiParada so the mapper has something to work with
    const apiParada = {
      id: 'p1', numero: 1, cliente: 'C', direccion: 'D', items: 2,
      monto: 10000, eta: '10:00', estado: 'done', recibido_por: 'Juan', problema: null,
    };
    global.fetch = mockFetchOk(apiParada) as unknown as typeof fetch;
    await httpParadaPort(BASE).marcarEntrega('p1', 'Juan');
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/ruta/paradas/p1/entrega`,
      expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ recibido_por: 'Juan' }) }),
    );
  });

  it('reportarProblema calls PATCH', async () => {
    const apiParada = {
      id: 'p2', numero: 2, cliente: 'C', direccion: 'D', items: 1,
      monto: 5000, eta: '11:00', estado: 'problem', recibido_por: null, problema: 'Sin acceso',
    };
    global.fetch = mockFetchOk(apiParada) as unknown as typeof fetch;
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

// ---- Mapping assertions (guard against the Phase-1 class of bug) ----
// These tests prove that the Spanish snake_case backend shape is translated to the
// English domain shape. `fetch` returning `r.json() as T` is unchecked — only these
// tests catch a missing/wrong field mapping at dev-time.

describe('ParadaPort — backend→domain mapping', () => {
  it('listar maps Spanish snake_case backend shape to English domain shape', async () => {
    const apiParada = {
      id: 'p1',
      numero: 3,
      cliente: 'Lácteos El Norte',
      direccion: 'Cra 10 #5-20',
      items: 4,
      monto: 85000,
      eta: '09:30',
      estado: 'active',
      recibido_por: null,
      problema: null,
    };
    global.fetch = mockFetchOk([apiParada]) as unknown as typeof fetch;
    const result = await httpParadaPort(BASE).listar();
    expect(result[0]).toEqual({
      id: 'p1',
      num: 3,
      client: 'Lácteos El Norte',
      addr: 'Cra 10 #5-20',
      items: 4,
      amount: 85000,
      eta: '09:30',
      status: 'active',
      label: 'próxima parada',
      receivedBy: null,
    });
  });

  it('maps estado→label correctly for all four estados', async () => {
    const base = { id: 'x', numero: 1, cliente: 'C', direccion: 'D', items: 0, monto: 0, eta: '08:00', recibido_por: null, problema: null };
    const cases: Array<[string, string]> = [
      ['pending', 'pendiente'],
      ['active',  'próxima parada'],
      ['done',    'entregado'],
      ['problem', 'problema'],
    ];
    for (const [estado, expectedLabel] of cases) {
      global.fetch = mockFetchOk([{ ...base, estado }]) as unknown as typeof fetch;
      const [p] = await httpParadaPort(BASE).listar();
      expect(p.status).toBe(estado);
      expect(p.label).toBe(expectedLabel);
    }
  });

  it('marcarEntrega returns a mapped domain Parada', async () => {
    const apiParada = {
      id: 'p1', numero: 1, cliente: 'C', direccion: 'D', items: 2,
      monto: 10000, eta: '10:00', estado: 'done', recibido_por: 'Ana', problema: null,
    };
    global.fetch = mockFetchOk(apiParada) as unknown as typeof fetch;
    const result = await httpParadaPort(BASE).marcarEntrega('p1', 'Ana');
    expect(result.receivedBy).toBe('Ana');
    expect(result.status).toBe('done');
    expect(result.label).toBe('entregado');
    // confirms Spanish fields are NOT leaking through
    expect((result as Record<string, unknown>)['recibido_por']).toBeUndefined();
    expect((result as Record<string, unknown>)['numero']).toBeUndefined();
  });
});

describe('ConductorPort — backend→domain mapping', () => {
  it('listar calls GET /api/ruta/conductores', async () => {
    global.fetch = mockFetchOk([]) as unknown as typeof fetch;
    await httpConductorPort(BASE).listar();
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/ruta/conductores`);
  });

  it('listar maps Spanish snake_case to English domain shape', async () => {
    const apiConductor = {
      id: 'c1',
      nombre: 'Carlos Ruiz',
      iniciales: 'CR',
      zona: 'Norte',
      paradas_hechas: 5,
      total_paradas: 12,
    };
    global.fetch = mockFetchOk([apiConductor]) as unknown as typeof fetch;
    const result = await httpConductorPort(BASE).listar();
    expect(result[0]).toEqual({
      id: 'c1',
      name: 'Carlos Ruiz',
      initials: 'CR',
      zone: 'Norte',
      done: 5,
      total: 12,
    });
    // Spanish fields must NOT leak through
    expect((result[0] as Record<string, unknown>)['nombre']).toBeUndefined();
    expect((result[0] as Record<string, unknown>)['paradas_hechas']).toBeUndefined();
  });
});

describe('OperacionPort — backend→domain mapping', () => {
  it('obtenerKpis returns typed KPI dict', async () => {
    const apiKpis = { pedidos_hoy: 42, en_ruta: 8, devoluciones: 2, cartera: 1500000 };
    global.fetch = mockFetchOk(apiKpis) as unknown as typeof fetch;
    const result = await httpOperacionPort(BASE).obtenerKpis();
    expect(result).toEqual(apiKpis);
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/operacion/kpis`);
  });

  it('obtenerAlertas maps Spanish snake_case to English domain shape', async () => {
    const apiAlerta = {
      id: 'a1',
      tipo: 'danger',
      titulo: 'Stock agotado',
      subtitulo: 'Leche entera sin stock',
      timestamp: '08:14',
    };
    global.fetch = mockFetchOk([apiAlerta]) as unknown as typeof fetch;
    const result = await httpOperacionPort(BASE).obtenerAlertas();
    expect(result[0]).toEqual({
      id: 'a1',
      kind: 'danger',
      title: 'Stock agotado',
      sub: 'Leche entera sin stock',
      when: '08:14',
    });
    // Spanish fields must NOT leak through
    expect((result[0] as Record<string, unknown>)['tipo']).toBeUndefined();
    expect((result[0] as Record<string, unknown>)['titulo']).toBeUndefined();
  });

  it('obtenerGrafico returns BarData as-is (already domain-friendly)', async () => {
    const apiBar = { label: 'Lun', entregados: 10, devueltos: 1, pendientes: 3 };
    global.fetch = mockFetchOk([apiBar]) as unknown as typeof fetch;
    const result = await httpOperacionPort(BASE).obtenerGrafico();
    expect(result[0]).toEqual(apiBar);
  });

  it('obtenerPedidos maps via mapPedido (items=0 when lineas absent)', async () => {
    const apiPedido = {
      id: 'p99', hora: '07:45', cliente_nombre: 'Tienda X',
      monto: 55000, direccion: 'Cl 8 #2-10', ciudad: 'Cali',
      estado: 'enruta', timestamp: '2026-06-15T07:45:00',
      // no lineas field — operacion endpoint omits it
    };
    global.fetch = mockFetchOk([apiPedido]) as unknown as typeof fetch;
    const result = await httpOperacionPort(BASE).obtenerPedidos();
    expect(result[0]).toEqual({
      id: 'p99', time: '07:45', client: 'Tienda X',
      items: 0, address: 'Cl 8 #2-10', amount: 55000, state: 'enruta',
    });
  });

  it('obtenerConductores maps Spanish fields to English domain', async () => {
    const apiConductor = {
      id: 'c2', nombre: 'María López', iniciales: 'ML',
      zona: 'Sur', paradas_hechas: 3, total_paradas: 10,
    };
    global.fetch = mockFetchOk([apiConductor]) as unknown as typeof fetch;
    const result = await httpOperacionPort(BASE).obtenerConductores();
    expect(result[0].name).toBe('María López');
    expect(result[0].done).toBe(3);
    expect(result[0].total).toBe(10);
    expect((result[0] as Record<string, unknown>)['nombre']).toBeUndefined();
  });

  it('obtenerAlertas', async () => {
    global.fetch = mockFetchOk([]) as unknown as typeof fetch;
    await httpOperacionPort(BASE).obtenerAlertas();
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/operacion/alertas`);
  });
  it('obtenerGrafico route', async () => {
    global.fetch = mockFetchOk([]) as unknown as typeof fetch;
    await httpOperacionPort(BASE).obtenerGrafico();
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/operacion/grafico`);
  });
  it('obtenerPedidos route', async () => {
    global.fetch = mockFetchOk([]) as unknown as typeof fetch;
    await httpOperacionPort(BASE).obtenerPedidos();
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/operacion/pedidos`);
  });
  it('obtenerConductores route', async () => {
    global.fetch = mockFetchOk([]) as unknown as typeof fetch;
    await httpOperacionPort(BASE).obtenerConductores();
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/operacion/conductores`);
  });
});

describe('PedidoPort — listarClientes backend→domain mapping', () => {
  it('maps Spanish snake_case cliente to English domain Cliente', async () => {
    const apiCliente = {
      id: 'C-128',
      nombre: 'Tienda La Esquina',
      ciudad: 'Palmira',
      direccion: 'Cra 28 #14-12',
    };
    global.fetch = mockFetchOk([apiCliente]) as unknown as typeof fetch;
    const result = await httpPedidoPort(BASE).listarClientes();
    expect(result[0]).toEqual({
      id: 'C-128',
      name: 'Tienda La Esquina',
      city: 'Palmira',
      addr: 'Cra 28 #14-12',
    });
    // Spanish fields must NOT leak through
    expect((result[0] as Record<string, unknown>)['nombre']).toBeUndefined();
    expect((result[0] as Record<string, unknown>)['ciudad']).toBeUndefined();
    expect((result[0] as Record<string, unknown>)['direccion']).toBeUndefined();
  });
});

describe('PedidoPort — listarProductos backend→domain mapping', () => {
  it('maps Spanish snake_case producto to English domain Producto', async () => {
    const apiProducto = {
      sku: 'L-ENT-1L',
      nombre: 'Leche entera 1 L',
      precio: 28800,
    };
    global.fetch = mockFetchOk([apiProducto]) as unknown as typeof fetch;
    const result = await httpPedidoPort(BASE).listarProductos();
    expect(result[0]).toEqual({
      sku: 'L-ENT-1L',
      name: 'Leche entera 1 L',
      price: 28800,
    });
    // Spanish fields must NOT leak through
    expect((result[0] as Record<string, unknown>)['nombre']).toBeUndefined();
    expect((result[0] as Record<string, unknown>)['precio']).toBeUndefined();
  });
});

describe('ClientePort — backend→domain mapping', () => {
  const apiCliente = {
    id: 'C-128',
    nombre: 'Tienda La Esquina',
    ciudad: 'Palmira',
    direccion: 'Cra 28 #14-12',
    telefono: '+57 312 000 0001',
  };

  it('listar GETs /api/clientes/ and maps backend shape to domain shape', async () => {
    global.fetch = mockFetchOk([apiCliente]) as unknown as typeof fetch;
    const result = await httpClientePort(BASE).listar();
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/clientes/`);
    expect(result[0]).toEqual({
      id: 'C-128',
      name: 'Tienda La Esquina',
      city: 'Palmira',
      addr: 'Cra 28 #14-12',
      phone: '+57 312 000 0001',
    });
    // Spanish fields must NOT leak through
    expect((result[0] as Record<string, unknown>)['nombre']).toBeUndefined();
    expect((result[0] as Record<string, unknown>)['telefono']).toBeUndefined();
  });

  it('obtener GETs /api/clientes/{id} and maps the shape', async () => {
    global.fetch = mockFetchOk(apiCliente) as unknown as typeof fetch;
    const result = await httpClientePort(BASE).obtener('C-128');
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/clientes/C-128`);
    expect(result.phone).toBe('+57 312 000 0001');
  });

  it('crear POSTs /api/clientes/ with the correct backend body', async () => {
    global.fetch = mockFetchOk(apiCliente) as unknown as typeof fetch;
    await httpClientePort(BASE).crear({
      name: 'Tienda La Esquina',
      city: 'Palmira',
      addr: 'Cra 28 #14-12',
      phone: '+57 312 000 0001',
    });
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/clientes/`,
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: 'Tienda La Esquina',
          ciudad: 'Palmira',
          direccion: 'Cra 28 #14-12',
          telefono: '+57 312 000 0001',
        }),
      }),
    );
  });

  it('crear returns a mapped domain Cliente including phone', async () => {
    global.fetch = mockFetchOk(apiCliente) as unknown as typeof fetch;
    const result = await httpClientePort(BASE).crear({ name: 'X', city: 'Y', addr: 'Z', phone: '+57 300 000 0000' });
    expect(result.phone).toBe('+57 312 000 0001');
    expect((result as Record<string, unknown>)['telefono']).toBeUndefined();
  });

  it('actualizar PATCHes /api/clientes/{id} with mapped body', async () => {
    global.fetch = mockFetchOk(apiCliente) as unknown as typeof fetch;
    await httpClientePort(BASE).actualizar('C-128', { name: 'Nuevo Nombre', phone: '+57 315 999 0000' });
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/clientes/C-128`,
      expect.objectContaining({
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: 'Nuevo Nombre', telefono: '+57 315 999 0000' }),
      }),
    );
  });

  it('eliminar DELETEs /api/clientes/{id} with no body', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true }) as unknown as typeof fetch;
    await httpClientePort(BASE).eliminar('C-128');
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/clientes/C-128`,
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('eliminar rejects when response ok:false', async () => {
    global.fetch = mockFetchFail('Not Found') as unknown as typeof fetch;
    await expect(httpClientePort(BASE).eliminar('NOPE')).rejects.toThrow('Not Found');
  });
});

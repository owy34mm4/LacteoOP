/**
 * Unit tests for frontend/src/shared/adapters/http.js
 *
 * Loads domain first (http.js depends on window.LacteoOp existing),
 * then loads http.js for its side-effects.
 * Stubs global fetch with vi.fn().
 */
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../../../src/shared/domain.js';
import '../../../src/shared/adapters/http.js';

const { PedidoPort, ParadaPort, ConductorPort, OperacionPort } = window.LacteoOp.adapters.http;

const BASE = '/api';

function mockFetchOk(data) {
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
  global.fetch = mockFetchOk({});
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// PedidoPort
// ---------------------------------------------------------------------------

describe('PedidoPort', () => {
  it('listar calls GET /api/pedidos', async () => {
    global.fetch = mockFetchOk([]);
    await PedidoPort(BASE).listar();
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/pedidos`);
  });

  it('crear calls POST /api/pedidos with JSON body', async () => {
    global.fetch = mockFetchOk({});
    const data = { cliente_nombre: 'Test', ciudad: 'BA' };
    await PedidoPort(BASE).crear(data);
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/pedidos`,
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    );
  });

  it('actualizarEstado calls PATCH /api/pedidos/{id}/estado with body {estado}', async () => {
    global.fetch = mockFetchOk({});
    await PedidoPort(BASE).actualizarEstado('4817', 'enruta');
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
    global.fetch = mockFetchOk([]);
    await PedidoPort(BASE).listarClientes();
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/pedidos/clientes`);
  });

  it('listarProductos calls GET /api/pedidos/productos', async () => {
    global.fetch = mockFetchOk([]);
    await PedidoPort(BASE).listarProductos();
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/pedidos/productos`);
  });

  it('get rejects when response ok:false', async () => {
    global.fetch = mockFetchFail('Not Found');
    await expect(PedidoPort(BASE).listar()).rejects.toThrow('Not Found');
  });

  it('post rejects when response ok:false', async () => {
    global.fetch = mockFetchFail('Bad Request');
    await expect(PedidoPort(BASE).crear({})).rejects.toThrow('Bad Request');
  });

  it('patch rejects when response ok:false', async () => {
    global.fetch = mockFetchFail('Unprocessable Entity');
    await expect(PedidoPort(BASE).actualizarEstado('1', 'enruta')).rejects.toThrow('Unprocessable Entity');
  });
});

// ---------------------------------------------------------------------------
// ParadaPort
// ---------------------------------------------------------------------------

describe('ParadaPort', () => {
  it('listar calls GET /api/ruta/paradas', async () => {
    global.fetch = mockFetchOk([]);
    await ParadaPort(BASE).listar();
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/ruta/paradas`);
  });

  it('marcarEntrega calls PATCH /api/ruta/paradas/{id}/entrega with recibido_por', async () => {
    global.fetch = mockFetchOk({});
    await ParadaPort(BASE).marcarEntrega('p1', 'Juan');
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/ruta/paradas/p1/entrega`,
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ recibido_por: 'Juan' }),
      }),
    );
  });

  it('reportarProblema calls PATCH /api/ruta/paradas/{id}/problema with problema', async () => {
    global.fetch = mockFetchOk({});
    await ParadaPort(BASE).reportarProblema('p2', 'Sin acceso');
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/ruta/paradas/p2/problema`,
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ problema: 'Sin acceso' }),
      }),
    );
  });

  it('sincronizar calls POST /api/ruta/paradas/sync with acciones array', async () => {
    global.fetch = mockFetchOk([]);
    const acciones = [{ action: 'entrega', id: 'p1', recibido_por: 'X' }];
    await ParadaPort(BASE).sincronizar(acciones);
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/ruta/paradas/sync`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(acciones),
      }),
    );
  });
});

// ---------------------------------------------------------------------------
// ConductorPort
// ---------------------------------------------------------------------------

describe('ConductorPort', () => {
  it('listar calls GET /api/ruta/conductores', async () => {
    global.fetch = mockFetchOk([]);
    await ConductorPort(BASE).listar();
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/ruta/conductores`);
  });
});

// ---------------------------------------------------------------------------
// OperacionPort
// ---------------------------------------------------------------------------

describe('OperacionPort', () => {
  it('obtenerKpis calls GET /api/operacion/kpis', async () => {
    global.fetch = mockFetchOk({});
    await OperacionPort(BASE).obtenerKpis();
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/operacion/kpis`);
  });

  it('obtenerAlertas calls GET /api/operacion/alertas', async () => {
    global.fetch = mockFetchOk([]);
    await OperacionPort(BASE).obtenerAlertas();
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/operacion/alertas`);
  });

  it('obtenerGrafico calls GET /api/operacion/grafico', async () => {
    global.fetch = mockFetchOk([]);
    await OperacionPort(BASE).obtenerGrafico();
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/operacion/grafico`);
  });

  it('obtenerPedidos calls GET /api/operacion/pedidos', async () => {
    global.fetch = mockFetchOk([]);
    await OperacionPort(BASE).obtenerPedidos();
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/operacion/pedidos`);
  });

  it('obtenerConductores calls GET /api/operacion/conductores', async () => {
    global.fetch = mockFetchOk([]);
    await OperacionPort(BASE).obtenerConductores();
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/operacion/conductores`);
  });
});

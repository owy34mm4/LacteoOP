window.LacteoOp = window.LacteoOp || {};
window.LacteoOp.adapters = window.LacteoOp.adapters || {};

const jsonHeaders = { 'Content-Type': 'application/json' };
const get = (url) => fetch(url).then(r => { if (!r.ok) throw new Error(r.statusText); return r.json(); });
const post = (url, body) => fetch(url, { method: 'POST', headers: jsonHeaders, body: JSON.stringify(body) }).then(r => { if (!r.ok) throw new Error(r.statusText); return r.json(); });
const patch = (url, body) => fetch(url, { method: 'PATCH', headers: jsonHeaders, body: JSON.stringify(body) }).then(r => { if (!r.ok) throw new Error(r.statusText); return r.json(); });

window.LacteoOp.adapters.http = {
  PedidoPort: (baseUrl) => ({
    listar: () => get(`${baseUrl}/pedidos`),
    crear: (data) => post(`${baseUrl}/pedidos`, data),
    actualizarEstado: (id, estado) => patch(`${baseUrl}/pedidos/${id}/estado`, { estado }),
    listarClientes: () => get(`${baseUrl}/pedidos/clientes`),
    listarProductos: () => get(`${baseUrl}/pedidos/productos`),
  }),
  ParadaPort: (baseUrl) => ({
    listar: () => get(`${baseUrl}/ruta/paradas`),
    marcarEntrega: (id, recibidoPor) => patch(`${baseUrl}/ruta/paradas/${id}/entrega`, { recibido_por: recibidoPor }),
    reportarProblema: (id, problema) => patch(`${baseUrl}/ruta/paradas/${id}/problema`, { problema }),
    sincronizar: (acciones) => post(`${baseUrl}/ruta/paradas/sync`, acciones),
  }),
  ConductorPort: (baseUrl) => ({
    listar: () => get(`${baseUrl}/ruta/conductores`),
  }),
  OperacionPort: (baseUrl) => ({
    obtenerKpis: () => get(`${baseUrl}/operacion/kpis`),
    obtenerAlertas: () => get(`${baseUrl}/operacion/alertas`),
    obtenerGrafico: () => get(`${baseUrl}/operacion/grafico`),
    obtenerPedidos: () => get(`${baseUrl}/operacion/pedidos`),
    obtenerConductores: () => get(`${baseUrl}/operacion/conductores`),
  }),
};

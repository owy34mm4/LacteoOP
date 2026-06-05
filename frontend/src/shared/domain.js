window.LacteoOp = window.LacteoOp || {};
const L = window.LacteoOp;

// Value Objects
L.EstadoPedido = Object.freeze({
  RECIBIDO: 'recibido',
  ALISTANDO: 'alistando',
  ENRUTA: 'enruta',
  ENTREGADO: 'entregado',
  DEVUELTO: 'devuelto'
});

L.EstadoParada = Object.freeze({
  PENDING: 'pending',
  ACTIVE: 'active',
  DONE: 'done',
  PROBLEM: 'problem'
});

L.TipoAlerta = Object.freeze({
  DANGER: 'danger',
  WARN: 'warn'
});

// Entity factories (return frozen objects)
L.crearPedido = ({ id, time, client, items, address, amount, state }) =>
  Object.freeze({ id, time, client, items, address, amount, state });

L.crearParada = ({ id, num, client, addr, items, amount, eta, label, status, receivedBy }) =>
  Object.freeze({ id, num, client, addr, items, amount, eta, label, status, receivedBy: receivedBy || null });

L.crearConductor = ({ id, name, initials, zone, done, total }) =>
  Object.freeze({ id, name, initials, zone, done, total });

L.crearAlerta = ({ id, kind, title, sub, when }) =>
  Object.freeze({ id, kind, title, sub, when });

// Port contracts documented as JSDoc (not enforced at runtime in a no-build env):
// PedidoPort: { listar() -> Promise<Pedido[]>, crear(data) -> Promise<Pedido>, actualizarEstado(id, estado) -> Promise<Pedido>, listarClientes() -> Promise<Cliente[]>, listarProductos() -> Promise<Producto[]> }
// ParadaPort: { listar() -> Promise<Parada[]>, marcarEntrega(id, recibidoPor) -> Promise<Parada>, reportarProblema(id, problema) -> Promise<Parada>, sincronizar(acciones) -> Promise<Parada[]> }
// ConductorPort: { listar() -> Promise<Conductor[]> }
// OperacionPort: { obtenerKpis() -> Promise<KPIs>, obtenerAlertas() -> Promise<Alerta[]>, obtenerGrafico() -> Promise<BarData[]>, obtenerPedidos() -> Promise<Pedido[]>, obtenerConductores() -> Promise<Conductor[]> }

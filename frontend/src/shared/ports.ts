import type { Pedido, Parada, Conductor, Alerta, Existencia, Movimiento, Configuracion } from './domain';

export interface Cliente {
  id: string;
  name: string;
  city: string;
  addr: string;
  phone: string;
}

export interface NuevoCliente {
  name: string;
  city: string;
  addr: string;
  phone: string;
}

export interface ClientePort {
  listar(): Promise<Cliente[]>;
  obtener(id: string): Promise<Cliente>;
  crear(input: NuevoCliente): Promise<Cliente>;
  actualizar(id: string, input: Partial<NuevoCliente>): Promise<Cliente>;
  eliminar(id: string): Promise<void>;
}

export interface Producto {
  sku: string;
  name: string;
  price: number;
}

/** Typed shape returned by GET /operacion/kpis */
export interface KPIs {
  pedidos_hoy: number;
  en_ruta: number;
  devoluciones: number;
  cartera: number;
}

/** Typed shape returned by GET /operacion/grafico */
export interface BarData {
  label: string;
  entregados: number;
  devueltos: number;
  pendientes: number;
}

export interface NuevoPedidoLinea {
  sku: string;
  name: string;
  qty: number;
  price: number;
}

export interface NuevoPedido {
  client: { name: string; city: string; addr: string };
  phone: string;
  lines: NuevoPedidoLinea[];
}

export interface PedidoPort {
  listar(): Promise<Pedido[]>;
  crear(input: NuevoPedido): Promise<Pedido>;
  actualizarEstado(id: string, estado: string): Promise<Pedido>;
  listarClientes(): Promise<Cliente[]>;
  listarProductos(): Promise<Producto[]>;
}

export interface ParadaPort {
  listar(): Promise<Parada[]>;
  marcarEntrega(id: string, recibidoPor: string): Promise<Parada>;
  reportarProblema(id: string, problema: string): Promise<Parada>;
  sincronizar(acciones: unknown[]): Promise<Parada[]>;
}

export interface ConductorPort {
  listar(): Promise<Conductor[]>;
}

export interface OperacionPort {
  obtenerKpis(): Promise<KPIs>;
  obtenerAlertas(): Promise<Alerta[]>;
  obtenerGrafico(): Promise<BarData[]>;
  obtenerPedidos(): Promise<Pedido[]>;
  obtenerConductores(): Promise<Conductor[]>;
}

export interface InventarioPort {
  listarExistencias(): Promise<Existencia[]>;
  ajustarStock(sku: string, delta: number): Promise<Existencia>;
  listarMovimientos(): Promise<Movimiento[]>;
}

/** Partial patch shapes for PATCH /configuracion/ */
export interface PatchPerfil {
  iniciales?: string;
  nombre?: string;
  email?: string;
  telefono?: string;
  rol?: string;
}

export interface PatchNotificaciones {
  newOrder?: boolean;
  lowStock?: boolean;
  expiry?: boolean;
  driverDelay?: boolean;
  dailySummary?: boolean;
  sound?: boolean;
}

export interface PatchSistema {
  autoRefresh?: boolean;
  refreshInterval?: string;
}

export interface PatchConfiguracion {
  perfil?: PatchPerfil;
  notificaciones?: PatchNotificaciones;
  sistema?: PatchSistema;
}

export interface ConfiguracionPort {
  obtener(): Promise<Configuracion>;
  actualizar(patch: PatchConfiguracion): Promise<Configuracion>;
}

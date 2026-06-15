import type { Pedido, Parada, Conductor } from './domain';

export interface Cliente {
  id: string;
  name: string;
  city: string;
  addr: string;
}

export interface Producto {
  sku: string;
  name: string;
  price: number;
}

export interface KPIs {
  [key: string]: unknown;
}

export interface BarData {
  [key: string]: unknown;
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
  obtenerAlertas(): Promise<unknown[]>;
  obtenerGrafico(): Promise<BarData[]>;
  obtenerPedidos(): Promise<Pedido[]>;
  obtenerConductores(): Promise<Conductor[]>;
}

// Value Objects
export const EstadoPedido = Object.freeze({
  RECIBIDO: 'recibido',
  ALISTANDO: 'alistando',
  ENRUTA: 'enruta',
  ENTREGADO: 'entregado',
  DEVUELTO: 'devuelto',
} as const);

export type EstadoPedidoValue = typeof EstadoPedido[keyof typeof EstadoPedido];

export const EstadoParada = Object.freeze({
  PENDING: 'pending',
  ACTIVE: 'active',
  DONE: 'done',
  PROBLEM: 'problem',
} as const);

export type EstadoParadaValue = typeof EstadoParada[keyof typeof EstadoParada];

export const TipoAlerta = Object.freeze({
  DANGER: 'danger',
  WARN: 'warn',
} as const);

export type TipoAlertaValue = typeof TipoAlerta[keyof typeof TipoAlerta];

// Entity types
export interface Pedido {
  id: string;
  time: string;
  client: string;
  items: number;
  address: string;
  amount: number;
  state: EstadoPedidoValue;
}

export interface Parada {
  id: string;
  num: number;
  client: string;
  addr: string;
  items: number;
  amount: number;
  eta: string;
  label: string;
  status: EstadoParadaValue;
  receivedBy: string | null;
}

export interface Conductor {
  id: string;
  name: string;
  initials: string;
  zone: string;
  done: number;
  total: number;
}

export interface Alerta {
  id: string;
  kind: TipoAlertaValue;
  title: string;
  sub: string;
  when: string;
}

export interface Existencia {
  sku: string;
  name: string;
  cat: string;
  stock: number;
  max: number;
  unit: string;
  price: number;
  expiry: number;
  lot: string;
}

export interface Movimiento {
  id: string;
  type: string;
  title: string;
  qty: number;
  unit: string;
  time: string;
}

// Entity factories (return frozen objects — identical to JS version)
export const crearPedido = (data: Pedido): Readonly<Pedido> =>
  Object.freeze({ ...data });

export const crearParada = (data: Omit<Parada, 'receivedBy'> & { receivedBy?: string | null }): Readonly<Parada> =>
  Object.freeze({ ...data, receivedBy: data.receivedBy ?? null });

export const crearConductor = (data: Conductor): Readonly<Conductor> =>
  Object.freeze({ ...data });

export const crearAlerta = (data: Alerta): Readonly<Alerta> =>
  Object.freeze({ ...data });

// ---- Configuracion (singleton settings) ----

export interface Perfil {
  iniciales: string;
  nombre: string;
  email: string;
  telefono: string;
  rol: string;
}

export interface Notificaciones {
  newOrder: boolean;      // nuevo_pedido
  lowStock: boolean;      // stock_bajo
  expiry: boolean;        // vencimiento
  driverDelay: boolean;   // conductor_sin_reporte
  dailySummary: boolean;  // resumen_diario
  sound: boolean;         // sonido
}

export interface Sistema {
  autoRefresh: boolean;       // actualizacion_automatica
  refreshInterval: string;    // intervalo_actualizacion ("1"|"3"|"5"|"10")
}

export interface Configuracion {
  id: string;
  perfil: Perfil;
  notificaciones: Notificaciones;
  sistema: Sistema;
}

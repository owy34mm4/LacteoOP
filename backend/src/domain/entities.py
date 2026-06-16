from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime

from domain.value_objects import EstadoPedido, EstadoParada, TipoAlerta


@dataclass
class Cliente:
    id: str
    nombre: str
    ciudad: str
    direccion: str
    telefono: str = ""


@dataclass
class Producto:
    sku: str
    nombre: str
    precio: int


@dataclass
class LineaPedido:
    producto_sku: str
    nombre: str
    cantidad: int
    precio_unitario: int


@dataclass
class Pedido:
    id: str
    hora: str
    cliente_nombre: str
    lineas: list[LineaPedido]
    monto: int
    direccion: str
    ciudad: str
    estado: EstadoPedido
    timestamp: datetime


@dataclass
class Conductor:
    id: str
    nombre: str
    iniciales: str
    zona: str
    paradas_hechas: int
    total_paradas: int


@dataclass
class Parada:
    id: str
    numero: int
    cliente: str
    direccion: str
    items: int
    monto: int
    eta: str
    estado: EstadoParada
    recibido_por: str | None = None
    problema: str | None = None


@dataclass
class Alerta:
    id: str
    tipo: TipoAlerta
    titulo: str
    subtitulo: str
    timestamp: str


@dataclass
class DatosGrafico:
    label: str
    entregados: int
    devueltos: int
    pendientes: int


@dataclass
class Existencia:
    sku: str
    nombre: str
    categoria: str
    stock: int
    max_stock: int
    unidad: str
    precio: int
    dias_vencimiento: int
    lote: str


@dataclass
class MovimientoInventario:
    id: str
    tipo: str          # "in" | "out"
    titulo: str
    cantidad: int
    unidad: str
    hora: str


# ---- Configuracion (singleton settings, id always "app") ----

@dataclass
class Perfil:
    iniciales: str
    nombre: str
    email: str
    telefono: str
    rol: str


@dataclass
class Notificaciones:
    nuevo_pedido: bool
    stock_bajo: bool
    vencimiento: bool
    conductor_sin_reporte: bool
    resumen_diario: bool
    sonido: bool


@dataclass
class Sistema:
    actualizacion_automatica: bool
    intervalo_actualizacion: str   # "1" | "3" | "5" | "10" (minutes)


@dataclass
class Configuracion:
    id: str
    perfil: Perfil
    notificaciones: Notificaciones
    sistema: Sistema

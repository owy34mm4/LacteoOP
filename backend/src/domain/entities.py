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

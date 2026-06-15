from __future__ import annotations

from datetime import datetime
from typing import Optional

from beanie import Document
from pydantic import Field

from domain.value_objects import EstadoParada, EstadoPedido, TipoAlerta


class LineaPedidoEmbedded:
    producto_sku: str
    nombre: str
    cantidad: int
    precio_unitario: int


class PedidoDocument(Document):
    pedido_id: str
    hora: str
    cliente_nombre: str
    lineas: list[dict] = Field(default_factory=list)
    monto: int
    direccion: str
    ciudad: str
    estado: EstadoPedido
    timestamp: datetime

    class Settings:
        name = "pedidos"


class ParadaDocument(Document):
    parada_id: str
    numero: int
    cliente: str
    direccion: str
    items: int
    monto: int
    eta: str
    estado: EstadoParada
    recibido_por: Optional[str] = None
    problema: Optional[str] = None

    class Settings:
        name = "paradas"


class ConductorDocument(Document):
    conductor_id: str
    nombre: str
    iniciales: str
    zona: str
    paradas_hechas: int
    total_paradas: int

    class Settings:
        name = "conductores"


class AlertaDocument(Document):
    alerta_id: str
    tipo: TipoAlerta
    titulo: str
    subtitulo: str
    timestamp: str

    class Settings:
        name = "alertas"


class ClienteDocument(Document):
    cliente_id: str
    nombre: str
    ciudad: str
    direccion: str
    telefono: str = ""

    class Settings:
        name = "clientes"


class ProductoDocument(Document):
    sku: str
    nombre: str
    precio: int

    class Settings:
        name = "productos"


class DatosGraficoDocument(Document):
    label: str
    entregados: int
    devueltos: int
    pendientes: int

    class Settings:
        name = "datos_grafico"

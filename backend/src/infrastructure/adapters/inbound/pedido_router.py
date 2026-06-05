from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from domain.entities import LineaPedido
from domain.ports.inbound import PedidoServicePort
from domain.value_objects import EstadoPedido


# ---- DTOs ----

class LineaPedidoDTO(BaseModel):
    producto_sku: str
    nombre: str
    cantidad: int
    precio_unitario: int


class CrearPedidoRequest(BaseModel):
    cliente_nombre: str
    ciudad: str
    direccion: str
    telefono: str
    lineas: list[LineaPedidoDTO]


class ActualizarEstadoRequest(BaseModel):
    estado: str


def _serialize_pedido(pedido) -> dict:
    return {
        "id": pedido.id,
        "hora": pedido.hora,
        "cliente_nombre": pedido.cliente_nombre,
        "lineas": [
            {
                "producto_sku": l.producto_sku,
                "nombre": l.nombre,
                "cantidad": l.cantidad,
                "precio_unitario": l.precio_unitario,
            }
            for l in pedido.lineas
        ],
        "monto": pedido.monto,
        "direccion": pedido.direccion,
        "ciudad": pedido.ciudad,
        "estado": pedido.estado.value,
        "timestamp": pedido.timestamp.isoformat(),
    }


def _serialize_cliente(cliente) -> dict:
    return {
        "id": cliente.id,
        "nombre": cliente.nombre,
        "ciudad": cliente.ciudad,
        "direccion": cliente.direccion,
    }


def _serialize_producto(producto) -> dict:
    return {
        "sku": producto.sku,
        "nombre": producto.nombre,
        "precio": producto.precio,
    }


# ---- Factory ----

def create_pedido_router(service: PedidoServicePort) -> APIRouter:
    router = APIRouter(prefix="/pedidos", tags=["Pedidos"])

    @router.get("/")
    async def listar_pedidos():
        pedidos = await service.listar_pedidos()
        return [_serialize_pedido(p) for p in pedidos]

    @router.post("/", status_code=201)
    async def crear_pedido(body: CrearPedidoRequest):
        lineas = [
            LineaPedido(
                producto_sku=l.producto_sku,
                nombre=l.nombre,
                cantidad=l.cantidad,
                precio_unitario=l.precio_unitario,
            )
            for l in body.lineas
        ]
        pedido = await service.crear_pedido(
            cliente_nombre=body.cliente_nombre,
            ciudad=body.ciudad,
            direccion=body.direccion,
            telefono=body.telefono,
            lineas=lineas,
        )
        return _serialize_pedido(pedido)

    @router.patch("/{pedido_id}/estado")
    async def actualizar_estado(pedido_id: str, body: ActualizarEstadoRequest):
        try:
            estado = EstadoPedido(body.estado)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Estado invalido: {body.estado}")
        try:
            pedido = await service.actualizar_estado(pedido_id, estado)
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))
        return _serialize_pedido(pedido)

    @router.get("/clientes")
    async def listar_clientes():
        clientes = await service.listar_clientes()
        return [_serialize_cliente(c) for c in clientes]

    @router.get("/productos")
    async def listar_productos():
        productos = await service.listar_productos()
        return [_serialize_producto(p) for p in productos]

    return router

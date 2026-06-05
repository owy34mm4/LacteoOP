from __future__ import annotations

from fastapi import APIRouter

from domain.ports.inbound import OperacionServicePort


def _serialize_alerta(alerta) -> dict:
    return {
        "id": alerta.id,
        "tipo": alerta.tipo.value,
        "titulo": alerta.titulo,
        "subtitulo": alerta.subtitulo,
        "timestamp": alerta.timestamp,
    }


def _serialize_grafico(dato) -> dict:
    return {
        "label": dato.label,
        "entregados": dato.entregados,
        "devueltos": dato.devueltos,
        "pendientes": dato.pendientes,
    }


def _serialize_pedido(pedido) -> dict:
    return {
        "id": pedido.id,
        "hora": pedido.hora,
        "cliente_nombre": pedido.cliente_nombre,
        "monto": pedido.monto,
        "direccion": pedido.direccion,
        "ciudad": pedido.ciudad,
        "estado": pedido.estado.value,
        "timestamp": pedido.timestamp.isoformat(),
    }


def _serialize_conductor(conductor) -> dict:
    return {
        "id": conductor.id,
        "nombre": conductor.nombre,
        "iniciales": conductor.iniciales,
        "zona": conductor.zona,
        "paradas_hechas": conductor.paradas_hechas,
        "total_paradas": conductor.total_paradas,
    }


def create_operacion_router(service: OperacionServicePort) -> APIRouter:
    router = APIRouter(prefix="/operacion", tags=["Operación"])

    @router.get("/kpis")
    async def obtener_kpis():
        return await service.obtener_kpis()

    @router.get("/alertas")
    async def listar_alertas():
        alertas = await service.listar_alertas()
        return [_serialize_alerta(a) for a in alertas]

    @router.get("/grafico")
    async def obtener_datos_grafico():
        datos = await service.obtener_datos_grafico()
        return [_serialize_grafico(d) for d in datos]

    @router.get("/pedidos")
    async def listar_pedidos_operacion():
        pedidos = await service.listar_pedidos_operacion()
        return [_serialize_pedido(p) for p in pedidos]

    @router.get("/conductores")
    async def listar_conductores():
        conductores = await service.listar_conductores()
        return [_serialize_conductor(c) for c in conductores]

    return router

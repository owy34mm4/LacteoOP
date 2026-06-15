from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from domain.ports.inbound import InventarioServicePort


# ---- DTOs ----

class AjustarStockRequest(BaseModel):
    delta: int


def _serialize_existencia(e) -> dict:
    return {
        "sku": e.sku,
        "nombre": e.nombre,
        "categoria": e.categoria,
        "stock": e.stock,
        "max_stock": e.max_stock,
        "unidad": e.unidad,
        "precio": e.precio,
        "dias_vencimiento": e.dias_vencimiento,
        "lote": e.lote,
    }


def _serialize_movimiento(m) -> dict:
    return {
        "id": m.id,
        "tipo": m.tipo,
        "titulo": m.titulo,
        "cantidad": m.cantidad,
        "unidad": m.unidad,
        "hora": m.hora,
    }


# ---- Factory ----

def create_inventario_router(service: InventarioServicePort) -> APIRouter:
    router = APIRouter(prefix="/inventario", tags=["Inventario"])

    @router.get("/existencias")
    async def listar_existencias():
        existencias = await service.listar_existencias()
        return [_serialize_existencia(e) for e in existencias]

    @router.patch("/existencias/{sku}/stock")
    async def ajustar_stock(sku: str, body: AjustarStockRequest):
        try:
            existencia = await service.ajustar_stock(sku, body.delta)
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))
        return _serialize_existencia(existencia)

    @router.get("/movimientos")
    async def listar_movimientos():
        movimientos = await service.listar_movimientos()
        return [_serialize_movimiento(m) for m in movimientos]

    return router

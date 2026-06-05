from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from domain.ports.inbound import RutaServicePort


# ---- DTOs ----

class MarcarEntregaRequest(BaseModel):
    recibido_por: str


class ReportarProblemaRequest(BaseModel):
    problema: str


class AccionOfflineDTO(BaseModel):
    action: str
    id: str
    recibido_por: str | None = None
    problema: str | None = None


def _serialize_parada(parada) -> dict:
    return {
        "id": parada.id,
        "numero": parada.numero,
        "cliente": parada.cliente,
        "direccion": parada.direccion,
        "items": parada.items,
        "monto": parada.monto,
        "eta": parada.eta,
        "estado": parada.estado.value,
        "recibido_por": parada.recibido_por,
        "problema": parada.problema,
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


# ---- Factory ----

def create_ruta_router(service: RutaServicePort) -> APIRouter:
    router = APIRouter(prefix="/ruta", tags=["Ruta"])

    @router.get("/paradas")
    async def listar_paradas():
        paradas = await service.listar_paradas()
        return [_serialize_parada(p) for p in paradas]

    @router.patch("/paradas/{parada_id}/entrega")
    async def marcar_entrega(parada_id: str, body: MarcarEntregaRequest):
        try:
            parada = await service.marcar_entrega(parada_id, body.recibido_por)
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))
        return _serialize_parada(parada)

    @router.patch("/paradas/{parada_id}/problema")
    async def reportar_problema(parada_id: str, body: ReportarProblemaRequest):
        try:
            parada = await service.reportar_problema(parada_id, body.problema)
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))
        return _serialize_parada(parada)

    @router.get("/conductores")
    async def listar_conductores():
        conductores = await service.listar_conductores()
        return [_serialize_conductor(c) for c in conductores]

    @router.post("/paradas/sync")
    async def sincronizar_offline(acciones: list[AccionOfflineDTO]):
        raw = [a.model_dump() for a in acciones]
        paradas = await service.sincronizar_offline(raw)
        return [_serialize_parada(p) for p in paradas]

    return router

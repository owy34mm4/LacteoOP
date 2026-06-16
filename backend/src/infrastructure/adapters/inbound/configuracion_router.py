from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from domain.ports.inbound import ConfiguracionServicePort


# ---- DTOs ----

class PatchPerfilBody(BaseModel):
    iniciales: Optional[str] = None
    nombre: Optional[str] = None
    email: Optional[str] = None
    telefono: Optional[str] = None
    rol: Optional[str] = None


class PatchNotificacionesBody(BaseModel):
    nuevo_pedido: Optional[bool] = None
    stock_bajo: Optional[bool] = None
    vencimiento: Optional[bool] = None
    conductor_sin_reporte: Optional[bool] = None
    resumen_diario: Optional[bool] = None
    sonido: Optional[bool] = None


class PatchSistemaBody(BaseModel):
    actualizacion_automatica: Optional[bool] = None
    intervalo_actualizacion: Optional[str] = None


class PatchConfiguracionBody(BaseModel):
    perfil: Optional[PatchPerfilBody] = None
    notificaciones: Optional[PatchNotificacionesBody] = None
    sistema: Optional[PatchSistemaBody] = None


# ---- Serializer ----

def _serialize_configuracion(c) -> dict:
    return {
        "id": c.id,
        "perfil": {
            "iniciales": c.perfil.iniciales,
            "nombre": c.perfil.nombre,
            "email": c.perfil.email,
            "telefono": c.perfil.telefono,
            "rol": c.perfil.rol,
        },
        "notificaciones": {
            "nuevo_pedido": c.notificaciones.nuevo_pedido,
            "stock_bajo": c.notificaciones.stock_bajo,
            "vencimiento": c.notificaciones.vencimiento,
            "conductor_sin_reporte": c.notificaciones.conductor_sin_reporte,
            "resumen_diario": c.notificaciones.resumen_diario,
            "sonido": c.notificaciones.sonido,
        },
        "sistema": {
            "actualizacion_automatica": c.sistema.actualizacion_automatica,
            "intervalo_actualizacion": c.sistema.intervalo_actualizacion,
        },
    }


# ---- Factory ----

def create_configuracion_router(service: ConfiguracionServicePort) -> APIRouter:
    router = APIRouter(prefix="/configuracion", tags=["Configuracion"])

    @router.get("/")
    async def obtener_configuracion():
        config = await service.obtener()
        return _serialize_configuracion(config)

    @router.patch("/")
    async def actualizar_configuracion(body: PatchConfiguracionBody):
        patch: dict = {}
        if body.perfil is not None:
            patch["perfil"] = {
                k: v for k, v in body.perfil.model_dump().items() if v is not None
            }
        if body.notificaciones is not None:
            patch["notificaciones"] = {
                k: v for k, v in body.notificaciones.model_dump().items() if v is not None
            }
        if body.sistema is not None:
            patch["sistema"] = {
                k: v for k, v in body.sistema.model_dump().items() if v is not None
            }
        config = await service.actualizar(patch)
        return _serialize_configuracion(config)

    return router

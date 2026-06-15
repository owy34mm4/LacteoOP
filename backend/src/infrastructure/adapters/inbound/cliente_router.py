from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from domain.ports.inbound import ClienteServicePort


# ---- DTOs ----

class CrearClienteRequest(BaseModel):
    nombre: str
    ciudad: str
    direccion: str
    telefono: str


class ActualizarClienteRequest(BaseModel):
    nombre: Optional[str] = None
    ciudad: Optional[str] = None
    direccion: Optional[str] = None
    telefono: Optional[str] = None


def _serialize_cliente(cliente) -> dict:
    return {
        "id": cliente.id,
        "nombre": cliente.nombre,
        "ciudad": cliente.ciudad,
        "direccion": cliente.direccion,
        "telefono": cliente.telefono,
    }


# ---- Factory ----

def create_cliente_router(service: ClienteServicePort) -> APIRouter:
    router = APIRouter(prefix="/clientes", tags=["Clientes"])

    @router.get("/")
    async def listar_clientes():
        clientes = await service.listar()
        return [_serialize_cliente(c) for c in clientes]

    @router.get("/{cliente_id}")
    async def obtener_cliente(cliente_id: str):
        try:
            cliente = await service.obtener(cliente_id)
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))
        return _serialize_cliente(cliente)

    @router.post("/", status_code=201)
    async def crear_cliente(body: CrearClienteRequest):
        cliente = await service.crear(
            nombre=body.nombre,
            ciudad=body.ciudad,
            direccion=body.direccion,
            telefono=body.telefono,
        )
        return _serialize_cliente(cliente)

    @router.patch("/{cliente_id}")
    async def actualizar_cliente(cliente_id: str, body: ActualizarClienteRequest):
        campos = {k: v for k, v in body.model_dump().items() if v is not None}
        try:
            cliente = await service.actualizar(cliente_id, **campos)
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))
        return _serialize_cliente(cliente)

    @router.delete("/{cliente_id}", status_code=204)
    async def eliminar_cliente(cliente_id: str):
        """Ley 1581 erasure endpoint — deletes all personal data for this client."""
        try:
            await service.eliminar(cliente_id)
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))

    return router

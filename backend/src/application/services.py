from __future__ import annotations

import dataclasses
from datetime import datetime

from domain.entities import Alerta, Cliente, Conductor, DatosGrafico, LineaPedido, Parada, Pedido, Producto
from domain.ports.inbound import OperacionServicePort, PedidoServicePort, RutaServicePort
from domain.ports.outbound import (
    AlertaRepository,
    ClienteRepository,
    ConductorRepository,
    DatosGraficoRepository,
    ParadaRepository,
    PedidoRepository,
    ProductoRepository,
)
from domain.value_objects import EstadoParada, EstadoPedido


class PedidoService(PedidoServicePort):
    def __init__(
        self,
        pedido_repo: PedidoRepository,
        cliente_repo: ClienteRepository,
        producto_repo: ProductoRepository,
    ) -> None:
        self._pedido_repo = pedido_repo
        self._cliente_repo = cliente_repo
        self._producto_repo = producto_repo

    async def listar_pedidos(self) -> list[Pedido]:
        return await self._pedido_repo.find_all()

    async def crear_pedido(
        self,
        cliente_nombre: str,
        ciudad: str,
        direccion: str,
        telefono: str,
        lineas: list[LineaPedido],
    ) -> Pedido:
        count = await self._pedido_repo.count()
        next_id = str(count + 4817)
        hora = datetime.now().strftime("%H:%M")
        monto = sum(l.cantidad * l.precio_unitario for l in lineas)
        pedido = Pedido(
            id=next_id,
            hora=hora,
            cliente_nombre=cliente_nombre,
            lineas=lineas,
            monto=monto,
            direccion=direccion,
            ciudad=ciudad,
            estado=EstadoPedido.RECIBIDO,
            timestamp=datetime.now(),
        )
        return await self._pedido_repo.save(pedido)

    async def actualizar_estado(self, pedido_id: str, estado: EstadoPedido) -> Pedido:
        pedido = await self._pedido_repo.find_by_id(pedido_id)
        if not pedido:
            raise ValueError(f"Pedido {pedido_id} not found")
        pedido = dataclasses.replace(pedido, estado=estado)
        return await self._pedido_repo.update(pedido)

    async def listar_clientes(self) -> list[Cliente]:
        return await self._cliente_repo.find_all()

    async def listar_productos(self) -> list[Producto]:
        return await self._producto_repo.find_all()


class RutaService(RutaServicePort):
    def __init__(
        self,
        parada_repo: ParadaRepository,
        conductor_repo: ConductorRepository,
    ) -> None:
        self._parada_repo = parada_repo
        self._conductor_repo = conductor_repo

    async def listar_paradas(self) -> list[Parada]:
        return await self._parada_repo.find_all()

    async def listar_conductores(self) -> list[Conductor]:
        return await self._conductor_repo.find_all()

    async def marcar_entrega(self, parada_id: str, recibido_por: str) -> Parada:
        parada = await self._parada_repo.find_by_id(parada_id)
        if not parada:
            raise ValueError(f"Parada {parada_id} not found")

        parada = dataclasses.replace(
            parada,
            estado=EstadoParada.DONE,
            recibido_por=recibido_por,
        )
        updated = await self._parada_repo.update(parada)

        # Advance next pending stop to active
        all_paradas = await self._parada_repo.find_all()
        next_pending = next(
            (p for p in sorted(all_paradas, key=lambda x: x.numero)
             if p.estado == EstadoParada.PENDING),
            None,
        )
        if next_pending:
            next_active = dataclasses.replace(next_pending, estado=EstadoParada.ACTIVE)
            await self._parada_repo.update(next_active)

        # Update conductor done count
        conductores = await self._conductor_repo.find_all()
        if conductores:
            conductor = conductores[0]
            updated_conductor = dataclasses.replace(
                conductor,
                paradas_hechas=conductor.paradas_hechas + 1,
            )
            await self._conductor_repo.update(updated_conductor)

        return updated

    async def reportar_problema(self, parada_id: str, problema: str) -> Parada:
        parada = await self._parada_repo.find_by_id(parada_id)
        if not parada:
            raise ValueError(f"Parada {parada_id} not found")
        parada = dataclasses.replace(
            parada,
            estado=EstadoParada.PROBLEM,
            problema=problema,
        )
        return await self._parada_repo.update(parada)

    async def sincronizar_offline(self, acciones: list[dict]) -> list[Parada]:
        results: list[Parada] = []
        for accion in acciones:
            action = accion.get("action")
            parada_id = accion.get("id", "")
            if action == "entrega":
                recibido_por = accion.get("recibido_por", "Cliente")
                try:
                    parada = await self.marcar_entrega(parada_id, recibido_por)
                    results.append(parada)
                except ValueError:
                    pass
            elif action == "problema":
                problema = accion.get("problema", "Problema reportado")
                try:
                    parada = await self.reportar_problema(parada_id, problema)
                    results.append(parada)
                except ValueError:
                    pass
        return results


class OperacionService(OperacionServicePort):
    def __init__(
        self,
        pedido_repo: PedidoRepository,
        conductor_repo: ConductorRepository,
        alerta_repo: AlertaRepository,
        grafico_repo: DatosGraficoRepository,
    ) -> None:
        self._pedido_repo = pedido_repo
        self._conductor_repo = conductor_repo
        self._alerta_repo = alerta_repo
        self._grafico_repo = grafico_repo

    async def obtener_kpis(self) -> dict:
        pedidos_hoy = await self._pedido_repo.count()
        en_ruta = await self._pedido_repo.count_by_estado(EstadoPedido.ENRUTA)
        devoluciones = await self._pedido_repo.count_by_estado(EstadoPedido.DEVUELTO)
        cartera = await self._pedido_repo.sum_monto_by_estado(EstadoPedido.DEVUELTO)

        return {
            "pedidos_hoy": pedidos_hoy,
            "en_ruta": en_ruta,
            "devoluciones": devoluciones,
            "cartera": cartera,
        }

    async def listar_alertas(self) -> list[Alerta]:
        return await self._alerta_repo.find_all()

    async def obtener_datos_grafico(self) -> list[DatosGrafico]:
        return await self._grafico_repo.find_all()

    async def listar_pedidos_operacion(self) -> list[Pedido]:
        return await self._pedido_repo.find_all()

    async def listar_conductores(self) -> list[Conductor]:
        return await self._conductor_repo.find_all()

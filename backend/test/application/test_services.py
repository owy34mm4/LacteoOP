"""
Unit tests for application services.

These tests use in-memory fake repositories (defined in conftest.py) and do NOT
require a live MongoDB instance. They run without any pytest marker filter.
"""
from __future__ import annotations

import pytest

from domain.entities import LineaPedido
from domain.value_objects import EstadoParada, EstadoPedido
from test.conftest import (
    FakeConductorRepository,
    FakePedidoRepository,
    FakeParadaRepository,
    make_conductor,
    make_parada,
    make_pedido,
)
from application.services import OperacionService, PedidoService, RutaService


# ---------------------------------------------------------------------------
# PedidoService
# ---------------------------------------------------------------------------

class TestCrearPedido:
    async def test_monto_calculado_correctamente(self, pedido_service: PedidoService, pedido_repo: FakePedidoRepository) -> None:
        lineas = [
            LineaPedido(producto_sku="LAC001", nombre="Leche 1L", cantidad=3, precio_unitario=500),
            LineaPedido(producto_sku="LAC002", nombre="Queso 200g", cantidad=2, precio_unitario=800),
        ]
        pedido = await pedido_service.crear_pedido(
            cliente_nombre="Ana Lopez",
            ciudad="Cordoba",
            direccion="Belgrano 200",
            telefono="351-1234",
            lineas=lineas,
        )
        # 3 * 500 + 2 * 800 = 1500 + 1600 = 3100
        assert pedido.monto == 3100

    async def test_next_id_con_count_cero(self) -> None:
        """When the repo is empty (count == 0), next_id == str(0 + 4817) == '4817'."""
        empty_pedido_repo = FakePedidoRepository()
        from test.conftest import FakeClienteRepository, FakeProductoRepository
        service = PedidoService(empty_pedido_repo, FakeClienteRepository(), FakeProductoRepository())
        lineas = [LineaPedido(producto_sku="X", nombre="X", cantidad=1, precio_unitario=100)]
        pedido = await service.crear_pedido(
            cliente_nombre="Test",
            ciudad="BA",
            direccion="Dir",
            telefono="000",
            lineas=lineas,
        )
        assert pedido.id == "4817"

    async def test_next_id_con_count_tres(self, pedido_service: PedidoService) -> None:
        """pedido_repo fixture has 3 items, so next_id == str(3 + 4817) == '4820'."""
        lineas = [LineaPedido(producto_sku="X", nombre="X", cantidad=1, precio_unitario=100)]
        pedido = await pedido_service.crear_pedido(
            cliente_nombre="Test",
            ciudad="BA",
            direccion="Dir",
            telefono="000",
            lineas=lineas,
        )
        assert pedido.id == "4820"

    async def test_estado_inicial_recibido(self, pedido_service: PedidoService) -> None:
        lineas = [LineaPedido(producto_sku="X", nombre="X", cantidad=1, precio_unitario=100)]
        pedido = await pedido_service.crear_pedido(
            cliente_nombre="Test",
            ciudad="BA",
            direccion="Dir",
            telefono="000",
            lineas=lineas,
        )
        assert pedido.estado == EstadoPedido.RECIBIDO

    async def test_persiste_en_repo(self, pedido_service: PedidoService, pedido_repo: FakePedidoRepository) -> None:
        initial_count = await pedido_repo.count()
        lineas = [LineaPedido(producto_sku="X", nombre="X", cantidad=1, precio_unitario=100)]
        await pedido_service.crear_pedido(
            cliente_nombre="Test",
            ciudad="BA",
            direccion="Dir",
            telefono="000",
            lineas=lineas,
        )
        assert await pedido_repo.count() == initial_count + 1


class TestActualizarEstado:
    async def test_actualiza_estado_existente(self, pedido_service: PedidoService) -> None:
        pedido = await pedido_service.actualizar_estado("4817", EstadoPedido.ALISTANDO)
        assert pedido.estado == EstadoPedido.ALISTANDO

    async def test_raises_value_error_si_no_existe(self, pedido_service: PedidoService) -> None:
        with pytest.raises(ValueError, match="9999"):
            await pedido_service.actualizar_estado("9999", EstadoPedido.ENRUTA)

    async def test_preserva_otros_campos(self, pedido_service: PedidoService) -> None:
        pedido = await pedido_service.actualizar_estado("4817", EstadoPedido.ENTREGADO)
        assert pedido.cliente_nombre == "Cliente Test"
        assert pedido.monto == 2000


# ---------------------------------------------------------------------------
# RutaService
# ---------------------------------------------------------------------------

class TestMarcarEntrega:
    async def test_estado_becomes_done(self, ruta_service: RutaService) -> None:
        parada = await ruta_service.marcar_entrega("p1", "Juan Perez")
        assert parada.estado == EstadoParada.DONE

    async def test_recibido_por_set(self, ruta_service: RutaService) -> None:
        parada = await ruta_service.marcar_entrega("p1", "Maria Garcia")
        assert parada.recibido_por == "Maria Garcia"

    async def test_next_pending_becomes_active(
        self,
        ruta_service: RutaService,
        parada_repo: FakeParadaRepository,
    ) -> None:
        # p1=ACTIVE, p2=PENDING, p3=PENDING
        await ruta_service.marcar_entrega("p1", "Someone")
        p2 = await parada_repo.find_by_id("p2")
        assert p2 is not None
        assert p2.estado == EstadoParada.ACTIVE

    async def test_paradas_hechas_incremented(
        self,
        ruta_service: RutaService,
        conductor_repo: FakeConductorRepository,
    ) -> None:
        initial = (await conductor_repo.find_all())[0].paradas_hechas
        await ruta_service.marcar_entrega("p1", "Someone")
        updated = (await conductor_repo.find_all())[0].paradas_hechas
        assert updated == initial + 1

    async def test_raises_value_error_si_no_existe(self, ruta_service: RutaService) -> None:
        with pytest.raises(ValueError, match="NOPE"):
            await ruta_service.marcar_entrega("NOPE", "Someone")

    async def test_no_crash_cuando_no_hay_pending(self, conductor_repo: FakeConductorRepository) -> None:
        """When all paradas are DONE, advancing next pending should not crash."""
        parada_repo_no_pending = FakeParadaRepository(
            paradas=[
                make_parada("x1", 1, EstadoParada.ACTIVE),
                make_parada("x2", 2, EstadoParada.DONE),
            ]
        )
        service = RutaService(parada_repo_no_pending, conductor_repo)
        parada = await service.marcar_entrega("x1", "Alguien")
        assert parada.estado == EstadoParada.DONE


class TestReportarProblema:
    async def test_estado_becomes_problem(self, ruta_service: RutaService) -> None:
        parada = await ruta_service.reportar_problema("p1", "Dirección incorrecta")
        assert parada.estado == EstadoParada.PROBLEM

    async def test_problema_set(self, ruta_service: RutaService) -> None:
        parada = await ruta_service.reportar_problema("p1", "No answer")
        assert parada.problema == "No answer"

    async def test_raises_value_error_si_no_existe(self, ruta_service: RutaService) -> None:
        with pytest.raises(ValueError, match="NOPE"):
            await ruta_service.reportar_problema("NOPE", "Problema")


class TestSincronizarOffline:
    async def test_procesa_entregas(self, ruta_service: RutaService, parada_repo: FakeParadaRepository) -> None:
        acciones = [{"action": "entrega", "id": "p1", "recibido_por": "Cliente"}]
        results = await ruta_service.sincronizar_offline(acciones)
        assert len(results) == 1
        assert results[0].estado == EstadoParada.DONE

    async def test_procesa_problemas(self, ruta_service: RutaService) -> None:
        acciones = [{"action": "problema", "id": "p1", "problema": "Roto"}]
        results = await ruta_service.sincronizar_offline(acciones)
        assert len(results) == 1
        assert results[0].estado == EstadoParada.PROBLEM

    async def test_ignora_ids_invalidos(self, ruta_service: RutaService) -> None:
        acciones = [
            {"action": "entrega", "id": "INVALID", "recibido_por": "X"},
            {"action": "entrega", "id": "p1", "recibido_por": "Y"},
        ]
        results = await ruta_service.sincronizar_offline(acciones)
        # Only the valid one should be in results
        assert len(results) == 1
        assert results[0].estado == EstadoParada.DONE

    async def test_lista_vacia_retorna_vacia(self, ruta_service: RutaService) -> None:
        results = await ruta_service.sincronizar_offline([])
        assert results == []

    async def test_acciones_mixtas(self, ruta_service: RutaService) -> None:
        acciones = [
            {"action": "entrega", "id": "p1", "recibido_por": "A"},
            {"action": "problema", "id": "p2", "problema": "No hay nadie"},
        ]
        results = await ruta_service.sincronizar_offline(acciones)
        assert len(results) == 2


# ---------------------------------------------------------------------------
# OperacionService
# ---------------------------------------------------------------------------

class TestObtenerKpis:
    async def test_pedidos_hoy_es_count_total(self, operacion_service: OperacionService) -> None:
        kpis = await operacion_service.obtener_kpis()
        # pedido_repo fixture has 3 pedidos
        assert kpis["pedidos_hoy"] == 3

    async def test_en_ruta_count_by_enruta(self, operacion_service: OperacionService) -> None:
        kpis = await operacion_service.obtener_kpis()
        # pedido_repo fixture has 1 ENRUTA pedido
        assert kpis["en_ruta"] == 1

    async def test_devoluciones_count_by_devuelto(self, operacion_service: OperacionService) -> None:
        kpis = await operacion_service.obtener_kpis()
        # pedido_repo fixture has 1 DEVUELTO pedido
        assert kpis["devoluciones"] == 1

    async def test_cartera_sum_monto_devuelto(self, operacion_service: OperacionService) -> None:
        kpis = await operacion_service.obtener_kpis()
        # DEVUELTO pedido has monto=1500
        assert kpis["cartera"] == 1500

    async def test_kpis_dict_keys(self, operacion_service: OperacionService) -> None:
        kpis = await operacion_service.obtener_kpis()
        assert set(kpis.keys()) == {"pedidos_hoy", "en_ruta", "devoluciones", "cartera"}

    async def test_kpis_con_repo_vacio(self) -> None:
        from test.conftest import FakeAlertaRepository, FakeConductorRepository, FakeDatosGraficoRepository
        service = OperacionService(
            FakePedidoRepository(),
            FakeConductorRepository(),
            FakeAlertaRepository(),
            FakeDatosGraficoRepository(),
        )
        kpis = await service.obtener_kpis()
        assert kpis["pedidos_hoy"] == 0
        assert kpis["en_ruta"] == 0
        assert kpis["devoluciones"] == 0
        assert kpis["cartera"] == 0

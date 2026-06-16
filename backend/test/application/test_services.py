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
    FakeClienteRepository,
    FakeConfiguracionRepository,
    FakeConductorRepository,
    FakeExistenciaRepository,
    FakeMovimientoRepository,
    FakePedidoRepository,
    FakeParadaRepository,
    make_conductor,
    make_existencia,
    make_parada,
    make_pedido,
)
from application.services import ClienteService, ConfiguracionService, InventarioService, OperacionService, PedidoService, RutaService
from domain.entities import Cliente


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

# ---------------------------------------------------------------------------
# ClienteService
# ---------------------------------------------------------------------------

class TestClienteServiceCrear:
    async def test_id_derivado_de_count(self) -> None:
        """Empty repo (count 0) → id = C-700."""
        repo = FakeClienteRepository()
        svc = ClienteService(repo)
        cliente = await svc.crear("Tienda X", "Cali", "Cra 1", "+57 300 000 0000")
        assert cliente.id == "C-700"

    async def test_id_derivado_de_count_no_vacio(self, cliente_service: ClienteService) -> None:
        """Fixture repo has 2 clientes (count 2) → id = C-702."""
        cliente = await cliente_service.crear("Tienda Y", "Bogota", "Calle 10", "+57 301 000 0000")
        assert cliente.id == "C-702"

    async def test_persiste_en_repo(self, cliente_service: ClienteService, cliente_repo: FakeClienteRepository) -> None:
        initial = await cliente_repo.count()
        await cliente_service.crear("Tienda Z", "Medellin", "Av 80", "+57 302 000 0000")
        assert await cliente_repo.count() == initial + 1

    async def test_telefono_guardado(self, cliente_service: ClienteService) -> None:
        cliente = await cliente_service.crear("Tienda W", "Cali", "Cra 5", "+57 315 111 2222")
        assert cliente.telefono == "+57 315 111 2222"


class TestClienteServiceObtener:
    async def test_obtener_existente(self, cliente_service: ClienteService) -> None:
        cliente = await cliente_service.obtener("C-100")
        assert cliente.nombre == "Maria Garcia"

    async def test_obtener_no_encontrado_raises(self, cliente_service: ClienteService) -> None:
        with pytest.raises(ValueError, match="NOPE"):
            await cliente_service.obtener("NOPE")


class TestClienteServiceActualizar:
    async def test_actualiza_nombre(self, cliente_service: ClienteService) -> None:
        cliente = await cliente_service.actualizar("C-100", nombre="Nuevo Nombre")
        assert cliente.nombre == "Nuevo Nombre"

    async def test_preserva_campos_no_actualizados(self, cliente_service: ClienteService) -> None:
        cliente = await cliente_service.actualizar("C-100", ciudad="Palmira")
        assert cliente.nombre == "Maria Garcia"
        assert cliente.ciudad == "Palmira"

    async def test_actualizar_no_encontrado_raises(self, cliente_service: ClienteService) -> None:
        with pytest.raises(ValueError, match="NOPE"):
            await cliente_service.actualizar("NOPE", nombre="X")


class TestClienteServiceEliminar:
    async def test_eliminar_existente(self, cliente_service: ClienteService, cliente_repo: FakeClienteRepository) -> None:
        initial = await cliente_repo.count()
        await cliente_service.eliminar("C-100")
        assert await cliente_repo.count() == initial - 1

    async def test_eliminar_no_encontrado_raises(self, cliente_service: ClienteService) -> None:
        with pytest.raises(ValueError, match="NOPE"):
            await cliente_service.eliminar("NOPE")


# ---------------------------------------------------------------------------
# InventarioService
# ---------------------------------------------------------------------------

class TestInventarioServiceListar:
    async def test_listar_existencias_returns_all(self, inventario_service: InventarioService) -> None:
        result = await inventario_service.listar_existencias()
        assert len(result) == 2

    async def test_listar_movimientos_returns_all(self, inventario_service: InventarioService) -> None:
        result = await inventario_service.listar_movimientos()
        assert len(result) == 1
        assert result[0].id == "MOV-1"


class TestInventarioServiceAjustarStock:
    async def test_ajustar_stock_positivo(self, inventario_service: InventarioService) -> None:
        result = await inventario_service.ajustar_stock("L-ENT-1L", 50)
        assert result.stock == 298  # 248 + 50

    async def test_ajustar_stock_negativo(self, inventario_service: InventarioService) -> None:
        result = await inventario_service.ajustar_stock("L-ENT-1L", -100)
        assert result.stock == 148  # 248 - 100

    async def test_ajustar_stock_clamp_at_zero(self, inventario_service: InventarioService) -> None:
        result = await inventario_service.ajustar_stock("L-ENT-1L", -9999)
        assert result.stock == 0  # never goes negative

    async def test_ajustar_stock_sku_no_encontrado(self, inventario_service: InventarioService) -> None:
        with pytest.raises(ValueError, match="NOPE"):
            await inventario_service.ajustar_stock("NOPE", -10)

    async def test_ajustar_stock_persiste_en_repo(
        self,
        inventario_service: InventarioService,
        existencia_repo: FakeExistenciaRepository,
    ) -> None:
        await inventario_service.ajustar_stock("YOG-NAT", -24)
        found = await existencia_repo.find_by_sku("YOG-NAT")
        assert found is not None
        assert found.stock == 100  # 124 - 24

    async def test_ajustar_stock_con_repo_vacio_raises(self) -> None:
        svc = InventarioService(FakeExistenciaRepository(), FakeMovimientoRepository())
        with pytest.raises(ValueError):
            await svc.ajustar_stock("ANYTHING", -1)


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


# ---------------------------------------------------------------------------
# ConfiguracionService
# ---------------------------------------------------------------------------

class TestConfiguracionServiceObtener:
    async def test_obtener_retorna_default_cuando_repo_vacio(self, configuracion_service: ConfiguracionService) -> None:
        config = await configuracion_service.obtener()
        assert config.id == "app"
        assert config.perfil.iniciales == "SR"
        assert config.notificaciones.nuevo_pedido is True
        assert config.sistema.intervalo_actualizacion == "5"

    async def test_obtener_persiste_default_en_repo(
        self,
        configuracion_service: ConfiguracionService,
        configuracion_repo: FakeConfiguracionRepository,
    ) -> None:
        await configuracion_service.obtener()
        stored = await configuracion_repo.get()
        assert stored is not None
        assert stored.id == "app"

    async def test_obtener_retorna_existente_sin_sobreescribir(self, configuracion_repo: FakeConfiguracionRepository) -> None:
        from application.services import DEFAULT_CONFIGURACION
        import dataclasses
        custom = dataclasses.replace(
            DEFAULT_CONFIGURACION,
            perfil=dataclasses.replace(DEFAULT_CONFIGURACION.perfil, nombre="Custom"),
        )
        await configuracion_repo.save(custom)
        svc = ConfiguracionService(configuracion_repo)
        config = await svc.obtener()
        assert config.perfil.nombre == "Custom"


class TestConfiguracionServiceActualizar:
    async def test_actualizar_una_notificacion_preserva_otras(self, configuracion_service: ConfiguracionService) -> None:
        # First create the default
        original = await configuracion_service.obtener()
        assert original.notificaciones.nuevo_pedido is True
        assert original.notificaciones.sonido is False

        # Patch only sonido
        updated = await configuracion_service.actualizar({"notificaciones": {"sonido": True}})
        assert updated.notificaciones.sonido is True
        # All other fields must remain intact
        assert updated.notificaciones.nuevo_pedido is True
        assert updated.notificaciones.stock_bajo is True
        assert updated.notificaciones.vencimiento is True
        assert updated.notificaciones.conductor_sin_reporte is False
        assert updated.notificaciones.resumen_diario is True

    async def test_actualizar_perfil_deepmerge(self, configuracion_service: ConfiguracionService) -> None:
        await configuracion_service.obtener()
        updated = await configuracion_service.actualizar({"perfil": {"nombre": "Nuevo Nombre"}})
        assert updated.perfil.nombre == "Nuevo Nombre"
        assert updated.perfil.email == "sara.restrepo@lacteosv.co"

    async def test_actualizar_sistema(self, configuracion_service: ConfiguracionService) -> None:
        await configuracion_service.obtener()
        updated = await configuracion_service.actualizar({"sistema": {"intervalo_actualizacion": "10"}})
        assert updated.sistema.intervalo_actualizacion == "10"
        assert updated.sistema.actualizacion_automatica is True

    async def test_actualizar_persiste_en_repo(
        self,
        configuracion_service: ConfiguracionService,
        configuracion_repo: FakeConfiguracionRepository,
    ) -> None:
        await configuracion_service.obtener()
        await configuracion_service.actualizar({"notificaciones": {"sonido": True}})
        stored = await configuracion_repo.get()
        assert stored is not None
        assert stored.notificaciones.sonido is True

    async def test_patch_vacio_no_modifica_nada(self, configuracion_service: ConfiguracionService) -> None:
        original = await configuracion_service.obtener()
        updated = await configuracion_service.actualizar({})
        assert updated.perfil.nombre == original.perfil.nombre
        assert updated.notificaciones.nuevo_pedido == original.notificaciones.nuevo_pedido

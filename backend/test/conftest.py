"""
Shared test fixtures and in-memory fake repositories.

All fakes implement the full port interface so they satisfy isinstance checks
against the ABC and can be used as drop-in replacements for the real Mongo
repositories in unit tests.
"""
from __future__ import annotations

import copy
from datetime import datetime

import pytest

from domain.entities import (
    Alerta,
    Cliente,
    Configuracion,
    Conductor,
    DatosGrafico,
    Existencia,
    LineaPedido,
    MovimientoInventario,
    Notificaciones,
    Parada,
    Pedido,
    Perfil,
    Producto,
    Sistema,
)
from domain.ports.outbound import (
    AlertaRepository,
    ClienteRepository,
    ConfiguracionRepository,
    ConductorRepository,
    DatosGraficoRepository,
    ExistenciaRepository,
    MovimientoRepository,
    ParadaRepository,
    PedidoRepository,
    ProductoRepository,
)
from domain.value_objects import EstadoParada, EstadoPedido, TipoAlerta
from application.services import ClienteService, ConfiguracionService, InventarioService, OperacionService, PedidoService, RutaService


# ---------------------------------------------------------------------------
# In-memory fake implementations
# ---------------------------------------------------------------------------

class FakePedidoRepository(PedidoRepository):
    def __init__(self, pedidos: list[Pedido] | None = None) -> None:
        self._store: dict[str, Pedido] = {}
        for p in (pedidos or []):
            self._store[p.id] = copy.deepcopy(p)

    async def find_all(self) -> list[Pedido]:
        return list(self._store.values())

    async def find_by_id(self, id: str) -> Pedido | None:
        return copy.deepcopy(self._store.get(id))

    async def save(self, pedido: Pedido) -> Pedido:
        saved = copy.deepcopy(pedido)
        self._store[saved.id] = saved
        return copy.deepcopy(saved)

    async def update(self, pedido: Pedido) -> Pedido:
        if pedido.id not in self._store:
            raise ValueError(f"Pedido {pedido.id} not found")
        updated = copy.deepcopy(pedido)
        self._store[updated.id] = updated
        return copy.deepcopy(updated)

    async def count(self) -> int:
        return len(self._store)

    async def count_by_estado(self, estado: EstadoPedido) -> int:
        return sum(1 for p in self._store.values() if p.estado == estado)

    async def sum_monto_by_estado(self, estado: EstadoPedido) -> int:
        return sum(p.monto for p in self._store.values() if p.estado == estado)


class FakeParadaRepository(ParadaRepository):
    def __init__(self, paradas: list[Parada] | None = None) -> None:
        self._store: dict[str, Parada] = {}
        for p in (paradas or []):
            self._store[p.id] = copy.deepcopy(p)

    async def find_all(self) -> list[Parada]:
        return list(self._store.values())

    async def find_by_id(self, id: str) -> Parada | None:
        return copy.deepcopy(self._store.get(id))

    async def save(self, parada: Parada) -> Parada:
        saved = copy.deepcopy(parada)
        self._store[saved.id] = saved
        return copy.deepcopy(saved)

    async def update(self, parada: Parada) -> Parada:
        if parada.id not in self._store:
            raise ValueError(f"Parada {parada.id} not found")
        updated = copy.deepcopy(parada)
        self._store[updated.id] = updated
        return copy.deepcopy(updated)

    async def count(self) -> int:
        return len(self._store)


class FakeConductorRepository(ConductorRepository):
    def __init__(self, conductores: list[Conductor] | None = None) -> None:
        self._store: dict[str, Conductor] = {}
        for c in (conductores or []):
            self._store[c.id] = copy.deepcopy(c)

    async def find_all(self) -> list[Conductor]:
        return list(self._store.values())

    async def find_by_id(self, id: str) -> Conductor | None:
        return copy.deepcopy(self._store.get(id))

    async def save(self, conductor: Conductor) -> Conductor:
        saved = copy.deepcopy(conductor)
        self._store[saved.id] = saved
        return copy.deepcopy(saved)

    async def update(self, conductor: Conductor) -> Conductor:
        if conductor.id not in self._store:
            raise ValueError(f"Conductor {conductor.id} not found")
        updated = copy.deepcopy(conductor)
        self._store[updated.id] = updated
        return copy.deepcopy(updated)

    async def count(self) -> int:
        return len(self._store)


class FakeAlertaRepository(AlertaRepository):
    def __init__(self, alertas: list[Alerta] | None = None) -> None:
        self._store: list[Alerta] = list(alertas or [])

    async def find_all(self) -> list[Alerta]:
        return list(self._store)

    async def save(self, alerta: Alerta) -> Alerta:
        self._store.append(copy.deepcopy(alerta))
        return copy.deepcopy(alerta)

    async def count(self) -> int:
        return len(self._store)


class FakeClienteRepository(ClienteRepository):
    def __init__(self, clientes: list[Cliente] | None = None) -> None:
        self._store: dict[str, Cliente] = {}
        for c in (clientes or []):
            self._store[c.id] = copy.deepcopy(c)

    async def find_all(self) -> list[Cliente]:
        return list(self._store.values())

    async def find_by_id(self, id: str) -> Cliente | None:
        return copy.deepcopy(self._store.get(id))

    async def save(self, cliente: Cliente) -> Cliente:
        saved = copy.deepcopy(cliente)
        self._store[saved.id] = saved
        return copy.deepcopy(saved)

    async def update(self, cliente: Cliente) -> Cliente:
        if cliente.id not in self._store:
            raise ValueError(f"Cliente {cliente.id} not found")
        updated = copy.deepcopy(cliente)
        self._store[updated.id] = updated
        return copy.deepcopy(updated)

    async def delete(self, id: str) -> None:
        if id not in self._store:
            raise ValueError(f"Cliente {id} not found")
        del self._store[id]

    async def count(self) -> int:
        return len(self._store)


class FakeProductoRepository(ProductoRepository):
    def __init__(self, productos: list[Producto] | None = None) -> None:
        self._store: list[Producto] = list(productos or [])

    async def find_all(self) -> list[Producto]:
        return list(self._store)

    async def save(self, producto: Producto) -> Producto:
        self._store.append(copy.deepcopy(producto))
        return copy.deepcopy(producto)

    async def count(self) -> int:
        return len(self._store)


class FakeDatosGraficoRepository(DatosGraficoRepository):
    def __init__(self, datos: list[DatosGrafico] | None = None) -> None:
        self._store: list[DatosGrafico] = list(datos or [])

    async def find_all(self) -> list[DatosGrafico]:
        return list(self._store)

    async def save(self, dato: DatosGrafico) -> DatosGrafico:
        self._store.append(copy.deepcopy(dato))
        return copy.deepcopy(dato)

    async def count(self) -> int:
        return len(self._store)


class FakeExistenciaRepository(ExistenciaRepository):
    def __init__(self, existencias: list[Existencia] | None = None) -> None:
        self._store: dict[str, Existencia] = {}
        for e in (existencias or []):
            self._store[e.sku] = copy.deepcopy(e)

    async def find_all(self) -> list[Existencia]:
        return list(self._store.values())

    async def find_by_sku(self, sku: str) -> Existencia | None:
        return copy.deepcopy(self._store.get(sku))

    async def save(self, existencia: Existencia) -> Existencia:
        saved = copy.deepcopy(existencia)
        self._store[saved.sku] = saved
        return copy.deepcopy(saved)

    async def update(self, existencia: Existencia) -> Existencia:
        if existencia.sku not in self._store:
            raise ValueError(f"Existencia {existencia.sku} not found")
        updated = copy.deepcopy(existencia)
        self._store[updated.sku] = updated
        return copy.deepcopy(updated)

    async def count(self) -> int:
        return len(self._store)


class FakeMovimientoRepository(MovimientoRepository):
    def __init__(self, movimientos: list[MovimientoInventario] | None = None) -> None:
        self._store: list[MovimientoInventario] = list(movimientos or [])

    async def find_all(self) -> list[MovimientoInventario]:
        return list(self._store)

    async def save(self, movimiento: MovimientoInventario) -> MovimientoInventario:
        self._store.append(copy.deepcopy(movimiento))
        return copy.deepcopy(movimiento)

    async def count(self) -> int:
        return len(self._store)


# ---------------------------------------------------------------------------
# Seed data helpers
# ---------------------------------------------------------------------------

def make_pedido(id: str, estado: EstadoPedido = EstadoPedido.RECIBIDO, monto: int = 1000) -> Pedido:
    return Pedido(
        id=id,
        hora="10:00",
        cliente_nombre="Cliente Test",
        lineas=[],
        monto=monto,
        direccion="Calle 123",
        ciudad="Buenos Aires",
        estado=estado,
        timestamp=datetime(2024, 1, 1, 10, 0),
    )


def make_parada(id: str, numero: int, estado: EstadoParada = EstadoParada.PENDING) -> Parada:
    return Parada(
        id=id,
        numero=numero,
        cliente="Cliente Test",
        direccion="Calle 123",
        items=2,
        monto=500,
        eta="10:00",
        estado=estado,
    )


def make_conductor(id: str = "c1", paradas_hechas: int = 0) -> Conductor:
    return Conductor(
        id=id,
        nombre="Juan Perez",
        iniciales="JP",
        zona="Norte",
        paradas_hechas=paradas_hechas,
        total_paradas=5,
    )


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def pedido_repo() -> FakePedidoRepository:
    return FakePedidoRepository(
        pedidos=[
            make_pedido("4817", EstadoPedido.RECIBIDO, 2000),
            make_pedido("4818", EstadoPedido.ENRUTA, 3000),
            make_pedido("4819", EstadoPedido.DEVUELTO, 1500),
        ]
    )


@pytest.fixture
def cliente_repo() -> FakeClienteRepository:
    return FakeClienteRepository(
        clientes=[
            Cliente(id="C-100", nombre="Maria Garcia", ciudad="Rosario", direccion="Av. Corrientes 100", telefono="+57 310 000 0001"),
            Cliente(id="C-101", nombre="Juan Perez",   ciudad="Cali",    direccion="Calle 5 #10-20",      telefono="+57 311 000 0002"),
        ]
    )


@pytest.fixture
def cliente_service(cliente_repo: FakeClienteRepository) -> ClienteService:
    return ClienteService(cliente_repo)


@pytest.fixture
def producto_repo() -> FakeProductoRepository:
    return FakeProductoRepository(
        productos=[
            Producto(sku="LAC001", nombre="Leche 1L", precio=500),
        ]
    )


@pytest.fixture
def parada_repo() -> FakeParadaRepository:
    return FakeParadaRepository(
        paradas=[
            make_parada("p1", 1, EstadoParada.ACTIVE),
            make_parada("p2", 2, EstadoParada.PENDING),
            make_parada("p3", 3, EstadoParada.PENDING),
        ]
    )


@pytest.fixture
def conductor_repo() -> FakeConductorRepository:
    return FakeConductorRepository(
        conductores=[make_conductor("c1", paradas_hechas=2)]
    )


@pytest.fixture
def alerta_repo() -> FakeAlertaRepository:
    return FakeAlertaRepository(
        alertas=[
            Alerta(id="a1", tipo=TipoAlerta.WARN, titulo="Aviso", subtitulo="Prueba", timestamp="10:00"),
        ]
    )


@pytest.fixture
def grafico_repo() -> FakeDatosGraficoRepository:
    return FakeDatosGraficoRepository(
        datos=[
            DatosGrafico(label="Lunes", entregados=10, devueltos=2, pendientes=3),
        ]
    )


@pytest.fixture
def pedido_service(
    pedido_repo: FakePedidoRepository,
    cliente_repo: FakeClienteRepository,
    producto_repo: FakeProductoRepository,
) -> PedidoService:
    return PedidoService(pedido_repo, cliente_repo, producto_repo)


@pytest.fixture
def ruta_service(
    parada_repo: FakeParadaRepository,
    conductor_repo: FakeConductorRepository,
) -> RutaService:
    return RutaService(parada_repo, conductor_repo)


@pytest.fixture
def operacion_service(
    pedido_repo: FakePedidoRepository,
    conductor_repo: FakeConductorRepository,
    alerta_repo: FakeAlertaRepository,
    grafico_repo: FakeDatosGraficoRepository,
) -> OperacionService:
    return OperacionService(pedido_repo, conductor_repo, alerta_repo, grafico_repo)


def make_existencia(sku: str, stock: int = 100) -> Existencia:
    return Existencia(
        sku=sku,
        nombre=f"Producto {sku}",
        categoria="Leches",
        stock=stock,
        max_stock=200,
        unidad="cajas",
        precio=28800,
        dias_vencimiento=18,
        lote="LOT-TEST",
    )


@pytest.fixture
def existencia_repo() -> FakeExistenciaRepository:
    return FakeExistenciaRepository(
        existencias=[
            make_existencia("L-ENT-1L", 248),
            make_existencia("YOG-NAT", 124),
        ]
    )


@pytest.fixture
def movimiento_repo() -> FakeMovimientoRepository:
    return FakeMovimientoRepository(
        movimientos=[
            MovimientoInventario(id="MOV-1", tipo="out", titulo="Pedido #4823", cantidad=-12, unidad="cajas", hora="09:42"),
        ]
    )


@pytest.fixture
def inventario_service(
    existencia_repo: FakeExistenciaRepository,
    movimiento_repo: FakeMovimientoRepository,
) -> InventarioService:
    return InventarioService(existencia_repo, movimiento_repo)


class FakeConfiguracionRepository(ConfiguracionRepository):
    def __init__(self, config: Configuracion | None = None) -> None:
        self._store: Configuracion | None = copy.deepcopy(config) if config else None

    async def get(self) -> Configuracion | None:
        return copy.deepcopy(self._store)

    async def save(self, config: Configuracion) -> Configuracion:
        self._store = copy.deepcopy(config)
        return copy.deepcopy(self._store)


@pytest.fixture
def configuracion_repo() -> FakeConfiguracionRepository:
    return FakeConfiguracionRepository()


@pytest.fixture
def configuracion_service(
    configuracion_repo: FakeConfiguracionRepository,
) -> ConfiguracionService:
    return ConfiguracionService(configuracion_repo)

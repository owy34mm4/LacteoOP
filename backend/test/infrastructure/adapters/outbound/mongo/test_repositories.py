"""
Integration tests for MongoDB repositories.

These tests REQUIRE a live MongoDB instance. All tests are decorated with
@pytest.mark.integration so they are skipped when running with:
    pytest -m "not integration"

The test database is created fresh for each test session and dropped afterwards.
"""
from __future__ import annotations

import os
from datetime import datetime

import pytest

# Guard: skip entire module only if the Mongo runtime deps are absent.
# pymongo + beanie come from src/requirements.txt. In CI they ARE installed, so these
# integration tests RUN. Locally (dev deps only) they are absent and the module skips.
# NOTE: the app uses pymongo's AsyncMongoClient (see infrastructure/config/database.py),
# NOT motor — mirror the real runtime client here.
pytest.importorskip("pymongo", reason="pymongo not installed — skipping integration tests")
pytest.importorskip("beanie", reason="beanie not installed — skipping integration tests")

from pymongo import AsyncMongoClient  # noqa: E402
from beanie import init_beanie  # noqa: E402

from domain.entities import LineaPedido, Pedido  # noqa: E402
from domain.value_objects import EstadoPedido  # noqa: E402
from infrastructure.adapters.outbound.mongo.documents import (  # noqa: E402
    AlertaDocument,
    ClienteDocument,
    ConductorDocument,
    DatosGraficoDocument,
    ParadaDocument,
    PedidoDocument,
    ProductoDocument,
)
from infrastructure.adapters.outbound.mongo.repositories import MongoPedidoRepository  # noqa: E402

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
TEST_DB = "lacteoop_test"

ALL_DOCUMENT_MODELS = [
    PedidoDocument,
    ParadaDocument,
    ConductorDocument,
    AlertaDocument,
    ClienteDocument,
    ProductoDocument,
    DatosGraficoDocument,
]


@pytest.fixture(scope="module")
async def mongo_db():
    """Create a test database connection and drop it after all tests in this module."""
    client = AsyncMongoClient(MONGO_URL)
    db = client[TEST_DB]
    await init_beanie(database=db, document_models=ALL_DOCUMENT_MODELS)
    yield db
    # Cleanup: drop the test database
    await client.drop_database(TEST_DB)
    client.close()


@pytest.fixture(autouse=True)
async def clean_collections(mongo_db):
    """Drop all collections before each test for isolation."""
    for collection_name in await mongo_db.list_collection_names():
        await mongo_db[collection_name].drop()


def make_test_pedido(id: str = "TEST-001") -> Pedido:
    return Pedido(
        id=id,
        hora="09:00",
        cliente_nombre="Cliente Integración",
        lineas=[
            LineaPedido(
                producto_sku="LAC001",
                nombre="Leche 1L",
                cantidad=5,
                precio_unitario=600,
            )
        ],
        monto=3000,
        direccion="Avenida Siempreviva 742",
        ciudad="Springfield",
        estado=EstadoPedido.RECIBIDO,
        timestamp=datetime(2024, 6, 14, 9, 0),
    )


@pytest.mark.integration
async def test_save_and_find_by_id(mongo_db):
    """Saving a Pedido and then finding it by ID returns an equivalent entity."""
    repo = MongoPedidoRepository()
    pedido = make_test_pedido("INT-001")

    saved = await repo.save(pedido)
    assert saved.id == "INT-001"
    assert saved.cliente_nombre == "Cliente Integración"

    found = await repo.find_by_id("INT-001")
    assert found is not None
    assert found.id == "INT-001"
    assert found.monto == 3000
    assert found.estado == EstadoPedido.RECIBIDO


@pytest.mark.integration
async def test_find_all_returns_saved_pedido(mongo_db):
    """After saving two pedidos, find_all returns both."""
    repo = MongoPedidoRepository()
    await repo.save(make_test_pedido("INT-A"))
    await repo.save(make_test_pedido("INT-B"))

    all_pedidos = await repo.find_all()
    ids = {p.id for p in all_pedidos}
    assert "INT-A" in ids
    assert "INT-B" in ids
    assert len(all_pedidos) == 2


@pytest.mark.integration
async def test_find_by_id_returns_none_for_missing(mongo_db):
    """Querying a non-existent ID returns None."""
    repo = MongoPedidoRepository()
    result = await repo.find_by_id("DOES-NOT-EXIST")
    assert result is None


@pytest.mark.integration
async def test_count_reflects_saved_documents(mongo_db):
    """count() returns the number of saved documents."""
    repo = MongoPedidoRepository()
    assert await repo.count() == 0

    await repo.save(make_test_pedido("INT-C1"))
    await repo.save(make_test_pedido("INT-C2"))
    assert await repo.count() == 2

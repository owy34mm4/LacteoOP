from __future__ import annotations

from pymongo import AsyncMongoClient
from beanie import init_beanie

from infrastructure.adapters.outbound.mongo.documents import (
    AlertaDocument,
    ClienteDocument,
    ConductorDocument,
    DatosGraficoDocument,
    ParadaDocument,
    PedidoDocument,
    ProductoDocument,
)
from infrastructure.config.settings import Settings

_client: AsyncMongoClient | None = None


async def init_database(settings: Settings) -> None:
    global _client
    _client = AsyncMongoClient(settings.mongo_url)
    db = _client[settings.mongo_db]
    await init_beanie(
        database=db,
        document_models=[
            PedidoDocument,
            ParadaDocument,
            ConductorDocument,
            AlertaDocument,
            ClienteDocument,
            ProductoDocument,
            DatosGraficoDocument,
        ],
    )


async def close_database() -> None:
    global _client
    if _client is not None:
        _client.close()
        _client = None

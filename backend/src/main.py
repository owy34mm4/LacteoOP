from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from application.services import ClienteService, ConfiguracionService, InventarioService, OperacionService, PedidoService, RutaService
from infrastructure.adapters.inbound.cliente_router import create_cliente_router
from infrastructure.adapters.inbound.configuracion_router import create_configuracion_router
from infrastructure.adapters.inbound.inventario_router import create_inventario_router
from infrastructure.adapters.inbound.operacion_router import create_operacion_router
from infrastructure.adapters.inbound.pedido_router import create_pedido_router
from infrastructure.adapters.inbound.ruta_router import create_ruta_router
from infrastructure.adapters.outbound.mongo.repositories import (
    MongoAlertaRepository,
    MongoClienteRepository,
    MongoConfiguracionRepository,
    MongoConductorRepository,
    MongoDatosGraficoRepository,
    MongoExistenciaRepository,
    MongoMovimientoRepository,
    MongoParadaRepository,
    MongoPedidoRepository,
    MongoProductoRepository,
)
from infrastructure.config.database import close_database, init_database
from infrastructure.config.settings import Settings
from seed import seed_if_empty

settings = Settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_database(settings)

    # Outbound adapters
    pedido_repo = MongoPedidoRepository()
    parada_repo = MongoParadaRepository()
    conductor_repo = MongoConductorRepository()
    alerta_repo = MongoAlertaRepository()
    cliente_repo = MongoClienteRepository()
    producto_repo = MongoProductoRepository()
    grafico_repo = MongoDatosGraficoRepository()
    existencia_repo = MongoExistenciaRepository()
    movimiento_repo = MongoMovimientoRepository()
    configuracion_repo = MongoConfiguracionRepository()

    # Application services
    pedido_svc = PedidoService(pedido_repo, cliente_repo, producto_repo)
    ruta_svc = RutaService(parada_repo, conductor_repo)
    operacion_svc = OperacionService(pedido_repo, conductor_repo, alerta_repo, grafico_repo)
    cliente_svc = ClienteService(cliente_repo)
    inventario_svc = InventarioService(existencia_repo, movimiento_repo)
    configuracion_svc = ConfiguracionService(configuracion_repo)

    # Inbound adapters
    app.include_router(create_pedido_router(pedido_svc))
    app.include_router(create_ruta_router(ruta_svc))
    app.include_router(create_operacion_router(operacion_svc))
    app.include_router(create_cliente_router(cliente_svc))
    app.include_router(create_inventario_router(inventario_svc))
    app.include_router(create_configuracion_router(configuracion_svc))

    # Seed initial data if collections are empty.
    # Configuracion is NOT seeded here — ConfiguracionService.obtener() creates
    # the default document on first request (create-on-first-get pattern).
    await seed_if_empty(
        pedido_repo,
        parada_repo,
        conductor_repo,
        alerta_repo,
        cliente_repo,
        producto_repo,
        grafico_repo,
        existencia_repo,
        movimiento_repo,
    )

    yield

    await close_database()


app = FastAPI(title="LácteoOp API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}

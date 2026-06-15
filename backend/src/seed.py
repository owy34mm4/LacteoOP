from __future__ import annotations

from datetime import datetime

from domain.entities import (
    Alerta,
    Cliente,
    Conductor,
    DatosGrafico,
    Existencia,
    LineaPedido,
    MovimientoInventario,
    Parada,
    Pedido,
    Producto,
)
from domain.ports.outbound import (
    AlertaRepository,
    ClienteRepository,
    ConductorRepository,
    DatosGraficoRepository,
    ExistenciaRepository,
    MovimientoRepository,
    ParadaRepository,
    PedidoRepository,
    ProductoRepository,
)
from domain.value_objects import EstadoParada, EstadoPedido, TipoAlerta

# ---- Reference date for timestamps ----
_REF_DATE = datetime(2026, 5, 22)


def _ts(hour: int, minute: int) -> datetime:
    return _REF_DATE.replace(hour=hour, minute=minute)


# ---- Seed data matching frontend INITIAL_ORDERS ----
_PEDIDOS = [
    Pedido(
        id="4823",
        hora="09:42",
        cliente_nombre="Panadería Doña Rosa",
        lineas=[
            LineaPedido("L-ENT-1L", "Leche entera 1 L (caja x12)", 3, 28800),
            LineaPedido("YOG-NAT", "Yogur natural 1 kg", 3, 14500),
        ],
        monto=142500,
        direccion="Cra 31 #20-15",
        ciudad="Palmira",
        estado=EstadoPedido.RECIBIDO,
        timestamp=_ts(9, 42),
    ),
    Pedido(
        id="4822",
        hora="09:31",
        cliente_nombre="Tienda Don Pacho",
        lineas=[
            LineaPedido("L-DES-1L", "Leche deslactosada 1 L", 2, 32400),
            LineaPedido("MANT-250", "Mantequilla 250 g", 2, 9800),
        ],
        monto=86200,
        direccion="Calle 70 #5-12",
        ciudad="Cali",
        estado=EstadoPedido.RECIBIDO,
        timestamp=_ts(9, 31),
    ),
    Pedido(
        id="4821",
        hora="09:14",
        cliente_nombre="Tienda La Esquina",
        lineas=[
            LineaPedido("L-ENT-1L", "Leche entera 1 L (caja x12)", 4, 28800),
            LineaPedido("YOG-NAT", "Yogur natural 1 kg", 4, 14500),
        ],
        monto=248500,
        direccion="Cra 28 #14-12",
        ciudad="Palmira",
        estado=EstadoPedido.ALISTANDO,
        timestamp=_ts(9, 14),
    ),
    Pedido(
        id="4820",
        hora="08:52",
        cliente_nombre="Restaurante El Buen Sabor",
        lineas=[
            LineaPedido("L-ENT-1L", "Leche entera 1 L (caja x12)", 6, 28800),
            LineaPedido("QUE-CAMP", "Queso campesino 500 g", 6, 18200),
        ],
        monto=412000,
        direccion="Av 6N #28-04",
        ciudad="Cali",
        estado=EstadoPedido.ENRUTA,
        timestamp=_ts(8, 52),
    ),
    Pedido(
        id="4819",
        hora="08:21",
        cliente_nombre="Minimarket Yumbo Centro",
        lineas=[
            LineaPedido("L-ENT-1L", "Leche entera 1 L (caja x12)", 2, 28800),
            LineaPedido("YOG-NAT", "Yogur natural 1 kg", 2, 14500),
            LineaPedido("MANT-250", "Mantequilla 250 g", 1, 9800),
        ],
        monto=98700,
        direccion="Calle 5 #3-22",
        ciudad="Yumbo",
        estado=EstadoPedido.ENTREGADO,
        timestamp=_ts(8, 21),
    ),
    Pedido(
        id="4818",
        hora="07:55",
        cliente_nombre="Café Los Almendros",
        lineas=[
            LineaPedido("L-DES-1L", "Leche deslactosada 1 L", 1, 32400),
            LineaPedido("MANT-250", "Mantequilla 250 g", 2, 9800),
        ],
        monto=54200,
        direccion="Av 6N #28-04",
        ciudad="Cali",
        estado=EstadoPedido.ENTREGADO,
        timestamp=_ts(7, 55),
    ),
    Pedido(
        id="4817",
        hora="07:42",
        cliente_nombre="Tienda La Sirena",
        lineas=[
            LineaPedido("L-ENT-1L", "Leche entera 1 L (caja x12)", 4, 28800),
            LineaPedido("YOG-NAT", "Yogur natural 1 kg", 3, 14500),
        ],
        monto=188900,
        direccion="Cra 28 #14-12",
        ciudad="Palmira",
        estado=EstadoPedido.DEVUELTO,
        timestamp=_ts(7, 42),
    ),
]

# ---- Seed data matching frontend INITIAL_STOPS ----
_PARADAS = [
    Parada(
        id="P-1",
        numero=1,
        cliente="Minimarket Yumbo Centro",
        direccion="Yumbo · Calle 5 #3-22",
        items=5,
        monto=98700,
        eta="10:42",
        estado=EstadoParada.DONE,
        recibido_por="María González",
    ),
    Parada(
        id="P-2",
        numero=2,
        cliente="Café Los Almendros",
        direccion="Cali · Av 6N #28-04",
        items=3,
        monto=54200,
        eta="11:02",
        estado=EstadoParada.DONE,
        recibido_por="Don Jorge",
    ),
    Parada(
        id="P-3",
        numero=3,
        cliente="Tienda La Esquina",
        direccion="Palmira · Cra 28 #14-12",
        items=8,
        monto=248500,
        eta="11:20",
        estado=EstadoParada.ACTIVE,
    ),
    Parada(
        id="P-4",
        numero=4,
        cliente="Restaurante El Buen Sabor",
        direccion="Cali · Av 6N #28-04",
        items=12,
        monto=412000,
        eta="12:05",
        estado=EstadoParada.PENDING,
    ),
    Parada(
        id="P-5",
        numero=5,
        cliente="Panadería Doña Rosa",
        direccion="Palmira · Cra 31 #20-15",
        items=6,
        monto=142500,
        eta="12:40",
        estado=EstadoParada.PENDING,
    ),
    Parada(
        id="P-6",
        numero=6,
        cliente="Tienda Don Pacho",
        direccion="Cali · Calle 70 #5-12",
        items=4,
        monto=86200,
        eta="13:15",
        estado=EstadoParada.PENDING,
    ),
]

# ---- Seed data matching frontend DRIVERS ----
_CONDUCTORES = [
    Conductor(id="D-1", nombre="Carlos Muñoz",   iniciales="CM", zona="Palmira norte", paradas_hechas=8, total_paradas=14),
    Conductor(id="D-2", nombre="Andrés Patiño",  iniciales="AP", zona="Cali centro",   paradas_hechas=5, total_paradas=12),
    Conductor(id="D-3", nombre="Luisa Quintero", iniciales="LQ", zona="Yumbo",         paradas_hechas=3, total_paradas=10),
    Conductor(id="D-4", nombre="Diego Salcedo",  iniciales="DS", zona="Cali sur",      paradas_hechas=1, total_paradas=9),
]

# ---- Seed data matching frontend ALERTS ----
_ALERTAS = [
    Alerta(
        id="A-1",
        tipo=TipoAlerta.DANGER,
        titulo="Stock agotado · Queso campesino 500g",
        subtitulo="Bodega Palmira · 0 unidades disponibles",
        timestamp="hace 3 min",
    ),
    Alerta(
        id="A-2",
        tipo=TipoAlerta.WARN,
        titulo="Vence pronto · Yogur natural (lote 4821)",
        subtitulo="124 unidades · vence en 3 días",
        timestamp="hace 14 min",
    ),
    Alerta(
        id="A-3",
        tipo=TipoAlerta.WARN,
        titulo="Conductor sin reportar · Diego Salcedo",
        subtitulo="52 min desde última actualización",
        timestamp="hace 52 min",
    ),
    Alerta(
        id="A-4",
        tipo=TipoAlerta.DANGER,
        titulo="Cartera vencida · Tienda La Sirena",
        subtitulo="$ 1.240.000 · vencido hace 18 días",
        timestamp="hace 1 h",
    ),
]

# ---- Seed data matching frontend BAR_DATA ----
_GRAFICO = [
    DatosGrafico(label="jue", entregados=92,  devueltos=4, pendientes=2),
    DatosGrafico(label="vie", entregados=108, devueltos=3, pendientes=1),
    DatosGrafico(label="sáb", entregados=134, devueltos=5, pendientes=3),
    DatosGrafico(label="lun", entregados=96,  devueltos=2, pendientes=0),
    DatosGrafico(label="mar", entregados=119, devueltos=6, pendientes=2),
    DatosGrafico(label="mié", entregados=128, devueltos=4, pendientes=6),
    DatosGrafico(label="jue", entregados=75,  devueltos=1, pendientes=42),
]

# ---- Seed data matching frontend KNOWN_CLIENTS ----
_CLIENTES = [
    Cliente(id="C-128", nombre="Tienda La Esquina",         ciudad="Palmira", direccion="Cra 28 #14-12",  telefono="+57 312 000 0001"),
    Cliente(id="C-201", nombre="Restaurante El Buen Sabor", ciudad="Cali",    direccion="Av 6N #28-04",   telefono="+57 315 000 0002"),
    Cliente(id="C-342", nombre="Minimarket Yumbo Centro",   ciudad="Yumbo",   direccion="Calle 5 #3-22",  telefono="+57 320 000 0003"),
    Cliente(id="C-415", nombre="Panadería Doña Rosa",       ciudad="Palmira", direccion="Cra 31 #20-15",  telefono="+57 321 000 0004"),
    Cliente(id="C-502", nombre="Tienda Don Pacho",          ciudad="Cali",    direccion="Calle 70 #5-12", telefono="+57 300 000 0005"),
]

# ---- Seed data matching frontend KNOWN_PRODUCTS ----
_PRODUCTOS = [
    Producto(sku="L-ENT-1L",  nombre="Leche entera 1 L (caja x12)", precio=28800),
    Producto(sku="L-DES-1L",  nombre="Leche deslactosada 1 L",      precio=32400),
    Producto(sku="YOG-NAT",   nombre="Yogur natural 1 kg",          precio=14500),
    Producto(sku="QUE-CAMP",  nombre="Queso campesino 500 g",       precio=18200),
    Producto(sku="MANT-250",  nombre="Mantequilla 250 g",           precio=9800),
]


# ---- Seed data matching frontend PRODUCTS array ----
_EXISTENCIAS = [
    Existencia(sku="L-ENT-1L",  nombre="Leche entera 1 L",          categoria="Leches",    stock=248, max_stock=400, unidad="cajas",  precio=28800, dias_vencimiento=18, lote="LOT-5234"),
    Existencia(sku="L-DES-1L",  nombre="Leche deslactosada 1 L",     categoria="Leches",    stock=45,  max_stock=200, unidad="cajas",  precio=32400, dias_vencimiento=12, lote="LOT-5235"),
    Existencia(sku="YOG-NAT",   nombre="Yogur natural 1 kg",         categoria="Yogures",   stock=124, max_stock=300, unidad="uds",    precio=14500, dias_vencimiento=3,  lote="LOT-4821"),
    Existencia(sku="QUE-CAMP",  nombre="Queso campesino 500 g",      categoria="Quesos",    stock=0,   max_stock=150, unidad="uds",    precio=18200, dias_vencimiento=8,  lote="LOT-5100"),
    Existencia(sku="MANT-250",  nombre="Mantequilla 250 g",          categoria="Derivados", stock=312, max_stock=400, unidad="uds",    precio=9800,  dias_vencimiento=22, lote="LOT-5180"),
    Existencia(sku="ARQ-500",   nombre="Arequipe 500 g",             categoria="Derivados", stock=67,  max_stock=200, unidad="uds",    precio=12400, dias_vencimiento=15, lote="LOT-5201"),
    Existencia(sku="YOG-FRU",   nombre="Yogur de frutas 150 g (x6)", categoria="Yogures",   stock=88,  max_stock=250, unidad="packs",  precio=11200, dias_vencimiento=5,  lote="LOT-4900"),
    Existencia(sku="CRE-LEC",   nombre="Crema de leche 500 ml",      categoria="Derivados", stock=18,  max_stock=100, unidad="uds",    precio=8600,  dias_vencimiento=7,  lote="LOT-5190"),
]

# ---- Seed data matching frontend MOVEMENTS array ----
_MOVIMIENTOS = [
    MovimientoInventario(id="MOV-1", tipo="out", titulo="Pedido #4823 · Panaderia Dona Rosa",       cantidad=-12, unidad="cajas", hora="09:42"),
    MovimientoInventario(id="MOV-2", tipo="out", titulo="Pedido #4821 · Tienda La Esquina",         cantidad=-8,  unidad="cajas", hora="09:14"),
    MovimientoInventario(id="MOV-3", tipo="in",  titulo="Recepcion lote LOT-5234 · Proveedor Alqueria", cantidad=200, unidad="cajas", hora="06:30"),
    MovimientoInventario(id="MOV-4", tipo="out", titulo="Pedido #4818 · Cafe Los Almendros",        cantidad=-4,  unidad="cajas", hora="ayer 07:55"),
]


async def seed_if_empty(
    pedido_repo: PedidoRepository,
    parada_repo: ParadaRepository,
    conductor_repo: ConductorRepository,
    alerta_repo: AlertaRepository,
    cliente_repo: ClienteRepository,
    producto_repo: ProductoRepository,
    grafico_repo: DatosGraficoRepository,
    existencia_repo: ExistenciaRepository,
    movimiento_repo: MovimientoRepository,
) -> None:
    count = await pedido_repo.count()
    if count > 0:
        return

    for pedido in _PEDIDOS:
        await pedido_repo.save(pedido)

    for parada in _PARADAS:
        await parada_repo.save(parada)

    for conductor in _CONDUCTORES:
        await conductor_repo.save(conductor)

    for alerta in _ALERTAS:
        await alerta_repo.save(alerta)

    for cliente in _CLIENTES:
        await cliente_repo.save(cliente)

    for producto in _PRODUCTOS:
        await producto_repo.save(producto)

    for dato in _GRAFICO:
        await grafico_repo.save(dato)

    # Seed existencias only if collection is empty (independent check)
    if await existencia_repo.count() == 0:
        for existencia in _EXISTENCIAS:
            await existencia_repo.save(existencia)

        for movimiento in _MOVIMIENTOS:
            await movimiento_repo.save(movimiento)

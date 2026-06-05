from __future__ import annotations

from domain.entities import Alerta, Cliente, Conductor, DatosGrafico, Parada, Pedido, Producto
from domain.ports.outbound import (
    AlertaRepository,
    ClienteRepository,
    ConductorRepository,
    DatosGraficoRepository,
    ParadaRepository,
    PedidoRepository,
    ProductoRepository,
)
from domain.value_objects import EstadoPedido
from infrastructure.adapters.outbound.mongo.documents import (
    AlertaDocument,
    ClienteDocument,
    ConductorDocument,
    DatosGraficoDocument,
    ParadaDocument,
    PedidoDocument,
    ProductoDocument,
)
from infrastructure.adapters.outbound.mongo.mappers import (
    AlertaMapper,
    ClienteMapper,
    ConductorMapper,
    DatosGraficoMapper,
    ParadaMapper,
    PedidoMapper,
    ProductoMapper,
)


class MongoPedidoRepository(PedidoRepository):
    async def find_all(self) -> list[Pedido]:
        docs = await PedidoDocument.find_all().to_list()
        return [PedidoMapper.to_entity(d) for d in docs]

    async def find_by_id(self, id: str) -> Pedido | None:
        doc = await PedidoDocument.find_one(PedidoDocument.pedido_id == id)
        return PedidoMapper.to_entity(doc) if doc else None

    async def save(self, pedido: Pedido) -> Pedido:
        doc = PedidoMapper.to_document(pedido)
        await doc.insert()
        return PedidoMapper.to_entity(doc)

    async def update(self, pedido: Pedido) -> Pedido:
        doc = await PedidoDocument.find_one(PedidoDocument.pedido_id == pedido.id)
        if doc is None:
            raise ValueError(f"Pedido {pedido.id} not found")
        doc.estado = pedido.estado
        doc.hora = pedido.hora
        doc.monto = pedido.monto
        doc.lineas = [
            {
                "producto_sku": l.producto_sku,
                "nombre": l.nombre,
                "cantidad": l.cantidad,
                "precio_unitario": l.precio_unitario,
            }
            for l in pedido.lineas
        ]
        await doc.save()
        return PedidoMapper.to_entity(doc)

    async def count(self) -> int:
        return await PedidoDocument.count()

    async def count_by_estado(self, estado: EstadoPedido) -> int:
        return await PedidoDocument.find(PedidoDocument.estado == estado).count()

    async def sum_monto_by_estado(self, estado: EstadoPedido) -> int:
        docs = await PedidoDocument.find(PedidoDocument.estado == estado).to_list()
        return sum(d.monto for d in docs)


class MongoParadaRepository(ParadaRepository):
    async def find_all(self) -> list[Parada]:
        docs = await ParadaDocument.find_all().to_list()
        docs_sorted = sorted(docs, key=lambda d: d.numero)
        return [ParadaMapper.to_entity(d) for d in docs_sorted]

    async def find_by_id(self, id: str) -> Parada | None:
        doc = await ParadaDocument.find_one(ParadaDocument.parada_id == id)
        return ParadaMapper.to_entity(doc) if doc else None

    async def save(self, parada: Parada) -> Parada:
        doc = ParadaMapper.to_document(parada)
        await doc.insert()
        return ParadaMapper.to_entity(doc)

    async def update(self, parada: Parada) -> Parada:
        doc = await ParadaDocument.find_one(ParadaDocument.parada_id == parada.id)
        if doc is None:
            raise ValueError(f"Parada {parada.id} not found")
        doc.estado = parada.estado
        doc.recibido_por = parada.recibido_por
        doc.problema = parada.problema
        await doc.save()
        return ParadaMapper.to_entity(doc)

    async def count(self) -> int:
        return await ParadaDocument.count()


class MongoConductorRepository(ConductorRepository):
    async def find_all(self) -> list[Conductor]:
        docs = await ConductorDocument.find_all().to_list()
        return [ConductorMapper.to_entity(d) for d in docs]

    async def find_by_id(self, id: str) -> Conductor | None:
        doc = await ConductorDocument.find_one(ConductorDocument.conductor_id == id)
        return ConductorMapper.to_entity(doc) if doc else None

    async def save(self, conductor: Conductor) -> Conductor:
        doc = ConductorMapper.to_document(conductor)
        await doc.insert()
        return ConductorMapper.to_entity(doc)

    async def update(self, conductor: Conductor) -> Conductor:
        doc = await ConductorDocument.find_one(ConductorDocument.conductor_id == conductor.id)
        if doc is None:
            raise ValueError(f"Conductor {conductor.id} not found")
        doc.paradas_hechas = conductor.paradas_hechas
        doc.total_paradas = conductor.total_paradas
        await doc.save()
        return ConductorMapper.to_entity(doc)

    async def count(self) -> int:
        return await ConductorDocument.count()


class MongoAlertaRepository(AlertaRepository):
    async def find_all(self) -> list[Alerta]:
        docs = await AlertaDocument.find_all().to_list()
        return [AlertaMapper.to_entity(d) for d in docs]

    async def save(self, alerta: Alerta) -> Alerta:
        doc = AlertaMapper.to_document(alerta)
        await doc.insert()
        return AlertaMapper.to_entity(doc)

    async def count(self) -> int:
        return await AlertaDocument.count()


class MongoClienteRepository(ClienteRepository):
    async def find_all(self) -> list[Cliente]:
        docs = await ClienteDocument.find_all().to_list()
        return [ClienteMapper.to_entity(d) for d in docs]

    async def save(self, cliente: Cliente) -> Cliente:
        doc = ClienteMapper.to_document(cliente)
        await doc.insert()
        return ClienteMapper.to_entity(doc)

    async def count(self) -> int:
        return await ClienteDocument.count()


class MongoProductoRepository(ProductoRepository):
    async def find_all(self) -> list[Producto]:
        docs = await ProductoDocument.find_all().to_list()
        return [ProductoMapper.to_entity(d) for d in docs]

    async def save(self, producto: Producto) -> Producto:
        doc = ProductoMapper.to_document(producto)
        await doc.insert()
        return ProductoMapper.to_entity(doc)

    async def count(self) -> int:
        return await ProductoDocument.count()


class MongoDatosGraficoRepository(DatosGraficoRepository):
    async def find_all(self) -> list[DatosGrafico]:
        docs = await DatosGraficoDocument.find_all().to_list()
        return [DatosGraficoMapper.to_entity(d) for d in docs]

    async def save(self, dato: DatosGrafico) -> DatosGrafico:
        doc = DatosGraficoMapper.to_document(dato)
        await doc.insert()
        return DatosGraficoMapper.to_entity(doc)

    async def count(self) -> int:
        return await DatosGraficoDocument.count()

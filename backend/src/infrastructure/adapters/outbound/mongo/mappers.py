from __future__ import annotations

from domain.entities import (
    Alerta,
    Cliente,
    Conductor,
    DatosGrafico,
    LineaPedido,
    Parada,
    Pedido,
    Producto,
)
from infrastructure.adapters.outbound.mongo.documents import (
    AlertaDocument,
    ClienteDocument,
    ConductorDocument,
    DatosGraficoDocument,
    ParadaDocument,
    PedidoDocument,
    ProductoDocument,
)


class PedidoMapper:
    @staticmethod
    def to_entity(doc: PedidoDocument) -> Pedido:
        lineas = [
            LineaPedido(
                producto_sku=l["producto_sku"],
                nombre=l["nombre"],
                cantidad=l["cantidad"],
                precio_unitario=l["precio_unitario"],
            )
            for l in doc.lineas
        ]
        return Pedido(
            id=doc.pedido_id,
            hora=doc.hora,
            cliente_nombre=doc.cliente_nombre,
            lineas=lineas,
            monto=doc.monto,
            direccion=doc.direccion,
            ciudad=doc.ciudad,
            estado=doc.estado,
            timestamp=doc.timestamp,
        )

    @staticmethod
    def to_document(entity: Pedido) -> PedidoDocument:
        lineas = [
            {
                "producto_sku": l.producto_sku,
                "nombre": l.nombre,
                "cantidad": l.cantidad,
                "precio_unitario": l.precio_unitario,
            }
            for l in entity.lineas
        ]
        return PedidoDocument(
            pedido_id=entity.id,
            hora=entity.hora,
            cliente_nombre=entity.cliente_nombre,
            lineas=lineas,
            monto=entity.monto,
            direccion=entity.direccion,
            ciudad=entity.ciudad,
            estado=entity.estado,
            timestamp=entity.timestamp,
        )


class ParadaMapper:
    @staticmethod
    def to_entity(doc: ParadaDocument) -> Parada:
        return Parada(
            id=doc.parada_id,
            numero=doc.numero,
            cliente=doc.cliente,
            direccion=doc.direccion,
            items=doc.items,
            monto=doc.monto,
            eta=doc.eta,
            estado=doc.estado,
            recibido_por=doc.recibido_por,
            problema=doc.problema,
        )

    @staticmethod
    def to_document(entity: Parada) -> ParadaDocument:
        return ParadaDocument(
            parada_id=entity.id,
            numero=entity.numero,
            cliente=entity.cliente,
            direccion=entity.direccion,
            items=entity.items,
            monto=entity.monto,
            eta=entity.eta,
            estado=entity.estado,
            recibido_por=entity.recibido_por,
            problema=entity.problema,
        )


class ConductorMapper:
    @staticmethod
    def to_entity(doc: ConductorDocument) -> Conductor:
        return Conductor(
            id=doc.conductor_id,
            nombre=doc.nombre,
            iniciales=doc.iniciales,
            zona=doc.zona,
            paradas_hechas=doc.paradas_hechas,
            total_paradas=doc.total_paradas,
        )

    @staticmethod
    def to_document(entity: Conductor) -> ConductorDocument:
        return ConductorDocument(
            conductor_id=entity.id,
            nombre=entity.nombre,
            iniciales=entity.iniciales,
            zona=entity.zona,
            paradas_hechas=entity.paradas_hechas,
            total_paradas=entity.total_paradas,
        )


class AlertaMapper:
    @staticmethod
    def to_entity(doc: AlertaDocument) -> Alerta:
        return Alerta(
            id=doc.alerta_id,
            tipo=doc.tipo,
            titulo=doc.titulo,
            subtitulo=doc.subtitulo,
            timestamp=doc.timestamp,
        )

    @staticmethod
    def to_document(entity: Alerta) -> AlertaDocument:
        return AlertaDocument(
            alerta_id=entity.id,
            tipo=entity.tipo,
            titulo=entity.titulo,
            subtitulo=entity.subtitulo,
            timestamp=entity.timestamp,
        )


class ClienteMapper:
    @staticmethod
    def to_entity(doc: ClienteDocument) -> Cliente:
        return Cliente(
            id=doc.cliente_id,
            nombre=doc.nombre,
            ciudad=doc.ciudad,
            direccion=doc.direccion,
        )

    @staticmethod
    def to_document(entity: Cliente) -> ClienteDocument:
        return ClienteDocument(
            cliente_id=entity.id,
            nombre=entity.nombre,
            ciudad=entity.ciudad,
            direccion=entity.direccion,
        )


class ProductoMapper:
    @staticmethod
    def to_entity(doc: ProductoDocument) -> Producto:
        return Producto(
            sku=doc.sku,
            nombre=doc.nombre,
            precio=doc.precio,
        )

    @staticmethod
    def to_document(entity: Producto) -> ProductoDocument:
        return ProductoDocument(
            sku=entity.sku,
            nombre=entity.nombre,
            precio=entity.precio,
        )


class DatosGraficoMapper:
    @staticmethod
    def to_entity(doc: DatosGraficoDocument) -> DatosGrafico:
        return DatosGrafico(
            label=doc.label,
            entregados=doc.entregados,
            devueltos=doc.devueltos,
            pendientes=doc.pendientes,
        )

    @staticmethod
    def to_document(entity: DatosGrafico) -> DatosGraficoDocument:
        return DatosGraficoDocument(
            label=entity.label,
            entregados=entity.entregados,
            devueltos=entity.devueltos,
            pendientes=entity.pendientes,
        )

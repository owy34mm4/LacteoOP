from __future__ import annotations

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
from infrastructure.adapters.outbound.mongo.documents import (
    AlertaDocument,
    ClienteDocument,
    ConfiguracionDocument,
    ConductorDocument,
    DatosGraficoDocument,
    ExistenciaDocument,
    MovimientoInventarioDocument,
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
            telefono=doc.telefono,
        )

    @staticmethod
    def to_document(entity: Cliente) -> ClienteDocument:
        return ClienteDocument(
            cliente_id=entity.id,
            nombre=entity.nombre,
            ciudad=entity.ciudad,
            direccion=entity.direccion,
            telefono=entity.telefono,
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


class ExistenciaMapper:
    @staticmethod
    def to_entity(doc: ExistenciaDocument) -> Existencia:
        return Existencia(
            sku=doc.sku,
            nombre=doc.nombre,
            categoria=doc.categoria,
            stock=doc.stock,
            max_stock=doc.max_stock,
            unidad=doc.unidad,
            precio=doc.precio,
            dias_vencimiento=doc.dias_vencimiento,
            lote=doc.lote,
        )

    @staticmethod
    def to_document(entity: Existencia) -> ExistenciaDocument:
        return ExistenciaDocument(
            sku=entity.sku,
            nombre=entity.nombre,
            categoria=entity.categoria,
            stock=entity.stock,
            max_stock=entity.max_stock,
            unidad=entity.unidad,
            precio=entity.precio,
            dias_vencimiento=entity.dias_vencimiento,
            lote=entity.lote,
        )


class MovimientoInventarioMapper:
    @staticmethod
    def to_entity(doc: MovimientoInventarioDocument) -> MovimientoInventario:
        return MovimientoInventario(
            id=doc.movimiento_id,
            tipo=doc.tipo,
            titulo=doc.titulo,
            cantidad=doc.cantidad,
            unidad=doc.unidad,
            hora=doc.hora,
        )

    @staticmethod
    def to_document(entity: MovimientoInventario) -> MovimientoInventarioDocument:
        return MovimientoInventarioDocument(
            movimiento_id=entity.id,
            tipo=entity.tipo,
            titulo=entity.titulo,
            cantidad=entity.cantidad,
            unidad=entity.unidad,
            hora=entity.hora,
        )


class ConfiguracionMapper:
    @staticmethod
    def to_entity(doc: ConfiguracionDocument) -> Configuracion:
        p = doc.perfil
        n = doc.notificaciones
        s = doc.sistema
        return Configuracion(
            id=doc.config_id,
            perfil=Perfil(
                iniciales=p.get("iniciales", ""),
                nombre=p.get("nombre", ""),
                email=p.get("email", ""),
                telefono=p.get("telefono", ""),
                rol=p.get("rol", ""),
            ),
            notificaciones=Notificaciones(
                nuevo_pedido=n.get("nuevo_pedido", True),
                stock_bajo=n.get("stock_bajo", True),
                vencimiento=n.get("vencimiento", True),
                conductor_sin_reporte=n.get("conductor_sin_reporte", False),
                resumen_diario=n.get("resumen_diario", True),
                sonido=n.get("sonido", False),
            ),
            sistema=Sistema(
                actualizacion_automatica=s.get("actualizacion_automatica", True),
                intervalo_actualizacion=s.get("intervalo_actualizacion", "5"),
            ),
        )

    @staticmethod
    def to_document(entity: Configuracion) -> ConfiguracionDocument:
        import dataclasses
        return ConfiguracionDocument(
            config_id=entity.id,
            perfil=dataclasses.asdict(entity.perfil),
            notificaciones=dataclasses.asdict(entity.notificaciones),
            sistema=dataclasses.asdict(entity.sistema),
        )

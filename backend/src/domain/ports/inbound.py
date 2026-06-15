from __future__ import annotations

from abc import ABC, abstractmethod

from domain.entities import Alerta, Cliente, Conductor, DatosGrafico, Existencia, LineaPedido, MovimientoInventario, Parada, Pedido, Producto
from domain.value_objects import EstadoPedido


class ClienteServicePort(ABC):
    @abstractmethod
    async def listar(self) -> list[Cliente]: ...

    @abstractmethod
    async def obtener(self, id: str) -> Cliente: ...

    @abstractmethod
    async def crear(self, nombre: str, ciudad: str, direccion: str, telefono: str) -> Cliente: ...

    @abstractmethod
    async def actualizar(self, id: str, **campos) -> Cliente: ...

    @abstractmethod
    async def eliminar(self, id: str) -> None: ...


class PedidoServicePort(ABC):
    @abstractmethod
    async def listar_pedidos(self) -> list[Pedido]: ...

    @abstractmethod
    async def crear_pedido(
        self,
        cliente_nombre: str,
        ciudad: str,
        direccion: str,
        telefono: str,
        lineas: list[LineaPedido],
    ) -> Pedido: ...

    @abstractmethod
    async def actualizar_estado(self, pedido_id: str, estado: EstadoPedido) -> Pedido: ...

    @abstractmethod
    async def listar_clientes(self) -> list[Cliente]: ...

    @abstractmethod
    async def listar_productos(self) -> list[Producto]: ...


class RutaServicePort(ABC):
    @abstractmethod
    async def listar_paradas(self) -> list[Parada]: ...

    @abstractmethod
    async def listar_conductores(self) -> list[Conductor]: ...

    @abstractmethod
    async def marcar_entrega(self, parada_id: str, recibido_por: str) -> Parada: ...

    @abstractmethod
    async def reportar_problema(self, parada_id: str, problema: str) -> Parada: ...

    @abstractmethod
    async def sincronizar_offline(self, acciones: list[dict]) -> list[Parada]: ...


class OperacionServicePort(ABC):
    @abstractmethod
    async def obtener_kpis(self) -> dict: ...

    @abstractmethod
    async def listar_alertas(self) -> list[Alerta]: ...

    @abstractmethod
    async def obtener_datos_grafico(self) -> list[DatosGrafico]: ...

    @abstractmethod
    async def listar_pedidos_operacion(self) -> list[Pedido]: ...

    @abstractmethod
    async def listar_conductores(self) -> list[Conductor]: ...


class InventarioServicePort(ABC):
    @abstractmethod
    async def listar_existencias(self) -> list[Existencia]: ...

    @abstractmethod
    async def ajustar_stock(self, sku: str, delta: int) -> Existencia: ...

    @abstractmethod
    async def listar_movimientos(self) -> list[MovimientoInventario]: ...

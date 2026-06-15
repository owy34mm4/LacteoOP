from __future__ import annotations

from abc import ABC, abstractmethod

from domain.entities import Alerta, Cliente, Conductor, DatosGrafico, Existencia, MovimientoInventario, Parada, Pedido, Producto
from domain.value_objects import EstadoPedido


class PedidoRepository(ABC):
    @abstractmethod
    async def find_all(self) -> list[Pedido]: ...

    @abstractmethod
    async def find_by_id(self, id: str) -> Pedido | None: ...

    @abstractmethod
    async def save(self, pedido: Pedido) -> Pedido: ...

    @abstractmethod
    async def update(self, pedido: Pedido) -> Pedido: ...

    @abstractmethod
    async def count(self) -> int: ...

    @abstractmethod
    async def count_by_estado(self, estado: EstadoPedido) -> int: ...

    @abstractmethod
    async def sum_monto_by_estado(self, estado: EstadoPedido) -> int: ...


class ParadaRepository(ABC):
    @abstractmethod
    async def find_all(self) -> list[Parada]: ...

    @abstractmethod
    async def find_by_id(self, id: str) -> Parada | None: ...

    @abstractmethod
    async def save(self, parada: Parada) -> Parada: ...

    @abstractmethod
    async def update(self, parada: Parada) -> Parada: ...

    @abstractmethod
    async def count(self) -> int: ...


class ConductorRepository(ABC):
    @abstractmethod
    async def find_all(self) -> list[Conductor]: ...

    @abstractmethod
    async def find_by_id(self, id: str) -> Conductor | None: ...

    @abstractmethod
    async def save(self, conductor: Conductor) -> Conductor: ...

    @abstractmethod
    async def update(self, conductor: Conductor) -> Conductor: ...

    @abstractmethod
    async def count(self) -> int: ...


class AlertaRepository(ABC):
    @abstractmethod
    async def find_all(self) -> list[Alerta]: ...

    @abstractmethod
    async def save(self, alerta: Alerta) -> Alerta: ...

    @abstractmethod
    async def count(self) -> int: ...


class ClienteRepository(ABC):
    @abstractmethod
    async def find_all(self) -> list[Cliente]: ...

    @abstractmethod
    async def find_by_id(self, id: str) -> Cliente | None: ...

    @abstractmethod
    async def save(self, cliente: Cliente) -> Cliente: ...

    @abstractmethod
    async def update(self, cliente: Cliente) -> Cliente: ...

    @abstractmethod
    async def delete(self, id: str) -> None: ...

    @abstractmethod
    async def count(self) -> int: ...


class ProductoRepository(ABC):
    @abstractmethod
    async def find_all(self) -> list[Producto]: ...

    @abstractmethod
    async def save(self, producto: Producto) -> Producto: ...

    @abstractmethod
    async def count(self) -> int: ...


class DatosGraficoRepository(ABC):
    @abstractmethod
    async def find_all(self) -> list[DatosGrafico]: ...

    @abstractmethod
    async def save(self, dato: DatosGrafico) -> DatosGrafico: ...

    @abstractmethod
    async def count(self) -> int: ...


class ExistenciaRepository(ABC):
    @abstractmethod
    async def find_all(self) -> list[Existencia]: ...

    @abstractmethod
    async def find_by_sku(self, sku: str) -> Existencia | None: ...

    @abstractmethod
    async def save(self, existencia: Existencia) -> Existencia: ...

    @abstractmethod
    async def update(self, existencia: Existencia) -> Existencia: ...

    @abstractmethod
    async def count(self) -> int: ...


class MovimientoRepository(ABC):
    @abstractmethod
    async def find_all(self) -> list[MovimientoInventario]: ...

    @abstractmethod
    async def save(self, movimiento: MovimientoInventario) -> MovimientoInventario: ...

    @abstractmethod
    async def count(self) -> int: ...

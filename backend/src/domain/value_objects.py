from __future__ import annotations

from enum import Enum


class EstadoPedido(str, Enum):
    RECIBIDO = "recibido"
    ALISTANDO = "alistando"
    ENRUTA = "enruta"
    ENTREGADO = "entregado"
    DEVUELTO = "devuelto"


class EstadoParada(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    DONE = "done"
    PROBLEM = "problem"


class TipoAlerta(str, Enum):
    DANGER = "danger"
    WARN = "warn"

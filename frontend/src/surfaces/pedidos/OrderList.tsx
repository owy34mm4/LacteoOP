import React from 'react';
import type { Pedido, EstadoPedidoValue } from '../../shared/domain';
import { IconSearch } from './PedidosIcons';

const STATE_BADGE: Record<EstadoPedidoValue, { cls: string; dot: string; label: string }> = {
  recibido:  { cls: 'b-recibido',  dot: 'var(--ink-500)',   label: 'Recibido' },
  alistando: { cls: 'b-alistando', dot: 'var(--amber-500)', label: 'Alistando' },
  enruta:    { cls: 'b-enruta',    dot: 'var(--sky-500)',   label: 'En ruta' },
  entregado: { cls: 'b-entregado', dot: 'var(--green-500)', label: 'Entregado' },
  devuelto:  { cls: 'b-devuelto',  dot: 'var(--red-500)',   label: 'Devuelto' },
};

const StatusBadge: React.FC<{ state: EstadoPedidoValue }> = ({ state }) => {
  const s = STATE_BADGE[state];
  return (
    <span className={`badge ${s.cls}`}>
      <span className="dot" style={{ background: s.dot }}></span>{s.label}
    </span>
  );
};

const OrderCard: React.FC<{ order: Pedido; selected: boolean; onSelect: (id: string) => void }> = ({
  order, selected, onSelect,
}) => (
  <div className={`order-card ${selected ? 'selected' : ''}`} onClick={() => onSelect(order.id)}>
    <div>
      <div className="order-num">#{order.id} · {order.time}</div>
      <div className="order-client">{order.client}</div>
      <div className="order-meta">{order.items} productos · {order.address}</div>
    </div>
    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
      <StatusBadge state={order.state} />
      <div className="order-amount">$ {order.amount.toLocaleString('es-CO')}</div>
    </div>
  </div>
);

interface OrderListPanelProps {
  orders: Pedido[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  query: string;
  setQuery: (q: string) => void;
  filter: string;
  setFilter: (f: string) => void;
}

export const OrderListPanel: React.FC<OrderListPanelProps> = ({
  orders, selectedId, onSelect, query, setQuery, filter, setFilter,
}) => {
  const filters = [
    { k: 'all',       label: 'Todos' },
    { k: 'recibido',  label: 'Recibidos' },
    { k: 'alistando', label: 'Alistando' },
    { k: 'enruta',    label: 'En ruta' },
    { k: 'entregado', label: 'Entregados' },
  ];
  const visible = orders
    .filter((o) => filter === 'all' || o.state === filter)
    .filter((o) => !query || o.client.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="list-pane">
      <div className="search-bar">
        <div className="search">
          <span style={{ color: 'var(--fg-3)' }}><IconSearch size={16} /></span>
          <input value={query} onChange={(e) => setQuery(e.target.value)}
                 placeholder="Buscar por cliente o número de pedido…" />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {filters.map((f) => (
          <button key={f.k}
                  className={`filter-chip ${filter === f.k ? 'active' : ''}`}
                  onClick={() => setFilter(f.k)}>
            {f.label}
          </button>
        ))}
      </div>
      <div className="order-list">
        {visible.map((o) => (
          <OrderCard key={o.id} order={o} selected={selectedId === o.id} onSelect={onSelect} />
        ))}
        {visible.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--fg-3)', fontSize: 14 }}>
            No hay pedidos que coincidan con su búsqueda.
          </div>
        )}
      </div>
    </div>
  );
};

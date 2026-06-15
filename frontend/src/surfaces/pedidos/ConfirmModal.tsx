import React from 'react';
import type { Cliente } from '../../shared/ports';

interface LineItem {
  qty: number;
  price: number;
}

interface OrderDraft {
  client: Cliente;
  phone: string;
  lines: LineItem[];
  total: number;
}

interface ConfirmModalProps {
  draft: OrderDraft | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export const PedidosConfirmModal: React.FC<ConfirmModalProps> = ({ draft, onCancel, onConfirm }) => {
  if (!draft) return null;
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Confirmar pedido</h3>
        <div style={{ fontSize: 14, color: 'var(--fg-2)' }}>
          Revise los datos antes de enviar al alistamiento.
        </div>
        <div className="summary">
          <div className="summary-row"><span>Cliente</span><strong>{draft.client.name}</strong></div>
          <div className="summary-row"><span>Dirección</span><span>{draft.client.city} · {draft.client.addr}</span></div>
          <div className="summary-row"><span>Productos</span><span>{draft.lines.length} líneas · {draft.lines.reduce((s, l) => s + l.qty, 0)} unidades</span></div>
          <div className="summary-row total"><span>Total a cobrar</span><span className="t-mono">$ {draft.total.toLocaleString('es-CO')}</span></div>
        </div>
        <div className="form-actions">
          <button className="btn btn-secondary" onClick={onCancel}>Volver a editar</button>
          <button className="btn btn-primary" onClick={onConfirm}>Confirmar pedido</button>
        </div>
      </div>
    </div>
  );
};

interface ToastProps {
  message: string;
  orderId?: string;
}

export const Toast: React.FC<ToastProps> = ({ message, orderId }) => (
  <div className="toast">
    <span className="check">✓</span>
    <span>{message}</span>
    {orderId && <span className="order-id">#{orderId}</span>}
  </div>
);

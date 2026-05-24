// ConfirmModal — destructive-style confirmation step (clear summary before submit).

function ConfirmModal({ draft, onCancel, onConfirm }) {
  if (!draft) return null;
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Confirmar pedido</h3>
        <div style={{ fontSize: 14, color: 'var(--fg-2)' }}>
          Revise los datos antes de enviar al alistamiento. Una vez confirmado, el inventario se ajustará inmediatamente.
        </div>
        <div className="summary">
          <div className="summary-row">
            <span>Cliente</span>
            <strong>{draft.client.name}</strong>
          </div>
          <div className="summary-row">
            <span>Dirección</span>
            <span>{draft.client.city} · {draft.client.addr}</span>
          </div>
          <div className="summary-row">
            <span>Productos</span>
            <span>{draft.lines.length} líneas · {draft.lines.reduce((s, l) => s + l.qty, 0)} unidades</span>
          </div>
          <div className="summary-row total">
            <span>Total a cobrar</span>
            <span className="t-mono">$ {draft.total.toLocaleString('es-CO')}</span>
          </div>
        </div>
        <div className="form-actions">
          <button className="btn btn-secondary" onClick={onCancel}>Volver a editar</button>
          <button className="btn btn-primary" onClick={onConfirm}>Confirmar pedido</button>
        </div>
      </div>
    </div>
  );
}

function Toast({ message, orderId }) {
  return (
    <div className="toast">
      <span className="check">✓</span>
      <span>{message}</span>
      {orderId && <span className="order-id">#{orderId}</span>}
    </div>
  );
}

window.ConfirmModal = ConfirmModal;
window.Toast = Toast;

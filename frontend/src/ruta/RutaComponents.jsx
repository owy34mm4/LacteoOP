// Ruta — driver mobile components.

const RIcon = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
       style={{ display: 'block' }}>
    {d}
  </svg>
);
const RIconCheck    = (p) => <RIcon {...p} d={<path d="M20 6 9 17l-5-5"/>} />;
const RIconAlert    = (p) => <RIcon {...p} d={<><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></>} />;
const RIconWifiOff  = (p) => <RIcon {...p} d={<><path d="M1 1l22 22"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.58 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="0.5"/></>} />;
const RIconArrow    = (p) => <RIcon {...p} d={<><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></>} />;
const RIconPhone    = (p) => <RIcon {...p} d={<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>} />;
Object.assign(window, { RIcon, RIconCheck, RIconAlert, RIconWifiOff, RIconArrow, RIconPhone });

// ---- RouteHeader ----
function RouteHeader({ driverName, routeStatus, stopsTotal, stopsDone }) {
  const pct = stopsTotal ? Math.round((stopsDone / stopsTotal) * 100) : 0;
  return (
    <div className="ruta-header">
      <div className="hello">Buenos días</div>
      <div className="name">{driverName}</div>

      <div className={`route-status ${routeStatus.kind === 'warn' ? 'warn' : ''}`}>
        <span className="pulse" />
        <div>
          <div className="label">{routeStatus.label}</div>
          <div className="value">{routeStatus.value}</div>
        </div>
      </div>

      <div className="route-progress">
        <div>
          <div className="small">Entregas de hoy</div>
          <div className="big">{stopsDone} <span style={{ color: 'rgba(251,248,240,0.4)' }}>/ {stopsTotal}</span></div>
        </div>
        <div className="small">{pct}%</div>
      </div>
      <div className="progress-bar"><div style={{ width: pct + '%' }} /></div>
    </div>
  );
}
window.RouteHeader = RouteHeader;

// ---- OfflineBanner ----
function OfflineBanner({ onClick }) {
  return (
    <div className="offline-banner" onClick={onClick} style={{ cursor: 'pointer' }}>
      <RIconWifiOff size={18} />
      <span>Sin conexión · sus entregas se guardarán</span>
      <span style={{ marginLeft: 'auto', textDecoration: 'underline' }}>Ver</span>
    </div>
  );
}
window.OfflineBanner = OfflineBanner;

// ---- StopCard ----
function StopCard({ stop, onDeliver, onReport }) {
  const cls = stop.status === 'done'    ? 'done'
            : stop.status === 'active'  ? 'active'
            : stop.status === 'problem' ? 'problem' : '';
  return (
    <div className={`stop-card ${cls}`}>
      <div className="stop-head">
        <div className="stop-num">{stop.status === 'done' ? '✓' : stop.status === 'problem' ? '!' : stop.num}</div>
        <div style={{ flex: 1 }}>
          <div className="stop-client">{stop.client}</div>
          <div className="stop-time">{stop.eta} · {stop.label}</div>
        </div>
      </div>
      <div className="stop-addr">{stop.addr}</div>
      <div className="stop-qty">
        <span className="left">{stop.items} productos</span>
        <span className="right">{stop.amount}</span>
      </div>
      {stop.status === 'active' && (
        <div className="stop-actions">
          <button className="btn btn-report" onClick={() => onReport(stop)}>Reportar</button>
          <button className="btn btn-deliver" onClick={() => onDeliver(stop)}>
            <RIconCheck size={18} /> Entregado
          </button>
        </div>
      )}
      {stop.status === 'done' && (
        <div className="done-line"><RIconCheck size={14}/> Entregado · recibido por {stop.receivedBy || '—'}</div>
      )}
      {stop.status === 'problem' && (
        <div className="problem-line"><RIconAlert size={14}/> {stop.problem}</div>
      )}
    </div>
  );
}
window.StopCard = StopCard;

// ---- BottomAction ----
function BottomAction({ nextStop, onNavigate }) {
  if (!nextStop) {
    return (
      <div className="bottom-action">
        <div>
          <div className="next-label">Ruta completada</div>
          <div className="next-name">Vuelva a la bodega</div>
        </div>
      </div>
    );
  }
  return (
    <div className="bottom-action">
      <div>
        <div className="next-label">Próxima parada · {nextStop.eta}</div>
        <div className="next-name">{nextStop.client}</div>
      </div>
      <button className="nav-btn" onClick={onNavigate} aria-label="Navegar">
        <RIconArrow size={22} />
      </button>
    </div>
  );
}
window.BottomAction = BottomAction;

// ---- OfflineSheet ----
function OfflineSheet({ onClose }) {
  return (
    <div className="offline-sheet-backdrop" onClick={onClose}>
      <div className="offline-sheet" onClick={e => e.stopPropagation()}>
        <div className="icon-circle"><RIconWifiOff /></div>
        <h3>Sin conexión</h3>
        <div className="body">Sus entregas se guardarán y se enviarán cuando vuelva la señal. Mientras tanto, puede continuar trabajando.</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Disponible sin conexión</div>
          <ul>
            <li>Ver lista de paradas de hoy</li>
            <li>Marcar entregas y reportar problemas</li>
            <li>Llamar al cliente directamente</li>
          </ul>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>No disponible</div>
          <ul>
            <li>Cambios de ruta</li>
            <li>Sincronización con la oficina</li>
          </ul>
        </div>
        <button className="close-btn" onClick={onClose}>Entendido</button>
      </div>
    </div>
  );
}
window.OfflineSheet = OfflineSheet;

// ---- ConfirmSheet ----
function ConfirmSheet({ stop, onCancel, onConfirm }) {
  if (!stop) return null;
  return (
    <div className="offline-sheet-backdrop" onClick={onCancel}>
      <div className="confirm-sheet" onClick={e => e.stopPropagation()}>
        <h3>¿Confirmar entrega?</h3>
        <div className="sub">Esta acción registra el pedido como entregado y descuenta el inventario.</div>
        <div className="summary">
          <div className="row"><span className="l">Cliente</span><span className="r">{stop.client}</span></div>
          <div className="row"><span className="l">Productos</span><span className="r">{stop.items} unidades</span></div>
          <div className="row"><span className="l">Total</span><span className="r" style={{ fontFamily: 'var(--font-mono)' }}>{stop.amount}</span></div>
        </div>
        <div className="actions">
          <button className="cancel" onClick={onCancel}>Cancelar</button>
          <button className="ok" onClick={onConfirm}>Confirmar entrega</button>
        </div>
      </div>
    </div>
  );
}
window.ConfirmSheet = ConfirmSheet;

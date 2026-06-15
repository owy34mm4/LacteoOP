import React, { useEffect, useState, useCallback } from 'react';
import '../../styles/ruta.css';
import { httpParadaPort, httpConductorPort } from '../../shared/adapters/http';
import { offlineParadaPort } from '../../shared/adapters/offline';
import type { Parada, Conductor } from '../../shared/domain';

// ---- Icon helpers ----
interface RIconProps { d: React.ReactNode; size?: number; }
const RIcon: React.FC<RIconProps> = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
       style={{ display: 'block' }}>
    {d}
  </svg>
);
const RIconCheck: React.FC<{ size?: number }> = (p) => <RIcon {...p} d={<path d="M20 6 9 17l-5-5"/>} />;
const RIconAlert: React.FC<{ size?: number }> = (p) => <RIcon {...p} d={<><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></>} />;
const RIconWifiOff: React.FC<{ size?: number }> = (p) => <RIcon {...p} d={<><path d="M1 1l22 22"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.58 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="0.5"/></>} />;
const RIconArrow: React.FC<{ size?: number }> = (p) => <RIcon {...p} d={<><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></>} />;

// ---- Port instances ----
const paradaPort = offlineParadaPort(httpParadaPort());
const conductorPort = httpConductorPort();

// ---- RouteHeader ----
interface RouteHeaderProps {
  driverName: string;
  routeStatus: { kind: 'ok' | 'warn'; label: string; value: string };
  stopsTotal: number;
  stopsDone: number;
}
const RouteHeader: React.FC<RouteHeaderProps> = ({ driverName, routeStatus, stopsTotal, stopsDone }) => {
  const pct = stopsTotal ? Math.round((stopsDone / stopsTotal) * 100) : 0;
  return (
    <div className="ruta-header">
      <div className="hello">Buenos días</div>
      <div className="name">{driverName}</div>
      <div className={`route-status${routeStatus.kind === 'warn' ? ' warn' : ''}`}>
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
};

// ---- OfflineBanner ----
const OfflineBanner: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <div className="offline-banner" onClick={onClick} style={{ cursor: 'pointer' }}>
    <RIconWifiOff size={18} />
    <span>Sin conexión · sus entregas se guardarán</span>
    <span style={{ marginLeft: 'auto', textDecoration: 'underline' }}>Ver</span>
  </div>
);

// ---- StopCard ----
interface StopCardProps {
  stop: Parada;
  onDeliver: (stop: Parada) => void;
  onReport: (stop: Parada) => void;
}
const StopCard: React.FC<StopCardProps> = ({ stop, onDeliver, onReport }) => {
  const cls = stop.status === 'done'    ? 'done'
            : stop.status === 'active'  ? 'active'
            : stop.status === 'problem' ? 'problem' : '';
  const amountStr = typeof stop.amount === 'number'
    ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(stop.amount)
    : String(stop.amount);

  return (
    <div className={`stop-card ${cls}`}>
      <div className="stop-head">
        <div className="stop-num">
          {stop.status === 'done' ? '✓' : stop.status === 'problem' ? '!' : stop.num}
        </div>
        <div style={{ flex: 1 }}>
          <div className="stop-client">{stop.client}</div>
          <div className="stop-time">{stop.eta} · {stop.label}</div>
        </div>
      </div>
      <div className="stop-addr">{stop.addr}</div>
      <div className="stop-qty">
        <span className="left">{stop.items} productos</span>
        <span className="right">{amountStr}</span>
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
        <div className="problem-line"><RIconAlert size={14}/> Problema reportado</div>
      )}
    </div>
  );
};

// ---- BottomAction ----
interface BottomActionProps { nextStop: Parada | null; onNavigate: () => void; }
const BottomAction: React.FC<BottomActionProps> = ({ nextStop, onNavigate }) => {
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
};

// ---- OfflineSheet ----
const OfflineSheet: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="offline-sheet-backdrop" onClick={onClose}>
    <div className="offline-sheet" onClick={(e) => e.stopPropagation()}>
      <div className="icon-circle"><RIconWifiOff /></div>
      <h3>Sin conexión</h3>
      <div className="body">Sus entregas se guardarán y se enviarán cuando vuelva la señal.</div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Disponible sin conexión</div>
        <ul>
          <li>Ver lista de paradas de hoy</li>
          <li>Marcar entregas y reportar problemas</li>
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

// ---- ConfirmSheet ----
interface ConfirmSheetProps {
  stop: Parada | null;
  onCancel: () => void;
  onConfirm: () => void;
}
const ConfirmSheet: React.FC<ConfirmSheetProps> = ({ stop, onCancel, onConfirm }) => {
  if (!stop) return null;
  const amountStr = typeof stop.amount === 'number'
    ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(stop.amount)
    : String(stop.amount);
  return (
    <div className="offline-sheet-backdrop" onClick={onCancel}>
      <div className="confirm-sheet" onClick={(e) => e.stopPropagation()}>
        <h3>¿Confirmar entrega?</h3>
        <div className="sub">Esta acción registra el pedido como entregado.</div>
        <div className="summary">
          <div className="row"><span className="l">Cliente</span><span className="r">{stop.client}</span></div>
          <div className="row"><span className="l">Productos</span><span className="r">{stop.items} unidades</span></div>
          <div className="row"><span className="l">Total</span><span className="r" style={{ fontFamily: 'var(--font-mono)' }}>{amountStr}</span></div>
        </div>
        <div className="actions">
          <button className="cancel" onClick={onCancel}>Cancelar</button>
          <button className="ok" onClick={onConfirm}>Confirmar entrega</button>
        </div>
      </div>
    </div>
  );
};

// ---- ReportSheet ----
interface ReportSheetProps {
  stop: Parada | null;
  onCancel: () => void;
  onConfirm: (problema: string) => void;
}
const ReportSheet: React.FC<ReportSheetProps> = ({ stop, onCancel, onConfirm }) => {
  const [text, setText] = useState('');
  if (!stop) return null;
  return (
    <div className="offline-sheet-backdrop" onClick={onCancel}>
      <div className="confirm-sheet" onClick={(e) => e.stopPropagation()}>
        <h3>Reportar problema</h3>
        <div className="sub">Indique qué ocurrió en la parada de {stop.client}.</div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Descripción del problema..."
          style={{ width: '100%', minHeight: 80, padding: 12, border: '1px solid var(--border-2)', borderRadius: 8, fontFamily: 'var(--font-sans)', fontSize: 14, resize: 'vertical' }}
        />
        <div className="actions">
          <button className="cancel" onClick={onCancel}>Cancelar</button>
          <button className="ok" onClick={() => { if (text.trim()) onConfirm(text.trim()); }}>Enviar</button>
        </div>
      </div>
    </div>
  );
};

// ---- Main Page ----
const RutaPage: React.FC = () => {
  const [paradas, setParadas] = useState<Parada[]>([]);
  const [conductor, setConductor] = useState<Conductor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [showOfflineSheet, setShowOfflineSheet] = useState(false);
  const [confirmStop, setConfirmStop] = useState<Parada | null>(null);
  const [reportStop, setReportStop] = useState<Parada | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ps, conductores] = await Promise.all([
        paradaPort.listar(),
        conductorPort.listar(),
      ]);
      setParadas(ps);
      setConductor(conductores[0] ?? null);
      setIsOffline(false);
    } catch (err) {
      setIsOffline(true);
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleDeliver = (stop: Parada) => setConfirmStop(stop);
  const handleReport  = (stop: Parada) => setReportStop(stop);

  const confirmDelivery = async () => {
    if (!confirmStop) return;
    const recibidoPor = conductor?.name ?? 'Conductor';
    const updated = await paradaPort.marcarEntrega(confirmStop.id, recibidoPor);
    setParadas((prev) => prev.map((p) => p.id === updated.id ? updated : p));
    setConfirmStop(null);
  };

  const confirmReport = async (problema: string) => {
    if (!reportStop) return;
    const updated = await paradaPort.reportarProblema(reportStop.id, problema);
    setParadas((prev) => prev.map((p) => p.id === updated.id ? updated : p));
    setReportStop(null);
  };

  const stopsDone  = paradas.filter((p) => p.status === 'done').length;
  const stopsTotal = paradas.length;
  const nextStop   = paradas.find((p) => p.status === 'active') ?? null;

  const routeStatus = stopsDone === stopsTotal && stopsTotal > 0
    ? { kind: 'ok' as const, label: 'Estado', value: 'Ruta completada' }
    : isOffline
    ? { kind: 'warn' as const, label: 'Estado', value: 'Sin conexión' }
    : { kind: 'ok' as const, label: 'Estado', value: 'En ruta' };

  if (loading) {
    return (
      <div className="ruta-app" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--fg-3)', fontSize: 14 }}>Cargando ruta…</div>
      </div>
    );
  }

  return (
    <div className="ruta-app">
      <RouteHeader
        driverName={conductor?.name ?? 'Conductor'}
        routeStatus={routeStatus}
        stopsDone={stopsDone}
        stopsTotal={stopsTotal}
      />

      {isOffline && <OfflineBanner onClick={() => setShowOfflineSheet(true)} />}

      {error && !isOffline && (
        <div style={{ padding: '12px 16px', background: 'var(--danger-tint)', color: 'var(--red-700)', fontSize: 13 }}>
          {error}
        </div>
      )}

      <div className="stops">
        {paradas.map((stop) => (
          <StopCard key={stop.id} stop={stop} onDeliver={handleDeliver} onReport={handleReport} />
        ))}
        {paradas.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--fg-3)', fontSize: 14 }}>
            No hay paradas para hoy.
          </div>
        )}
      </div>

      <BottomAction nextStop={nextStop} onNavigate={() => { /* navigate to maps */ }} />

      {showOfflineSheet && <OfflineSheet onClose={() => setShowOfflineSheet(false)} />}
      {confirmStop && (
        <ConfirmSheet
          stop={confirmStop}
          onCancel={() => setConfirmStop(null)}
          onConfirm={() => void confirmDelivery()}
        />
      )}
      {reportStop && (
        <ReportSheet
          stop={reportStop}
          onCancel={() => setReportStop(null)}
          onConfirm={(problema) => void confirmReport(problema)}
        />
      )}
    </div>
  );
};

export default RutaPage;

// Operación — manager dashboard components.

const OIcon = ({ children, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
       style={{ display: 'block' }}>{children}</svg>
);
const OIconGauge   = (p) => <OIcon {...p}><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></OIcon>;
const OIconInbox   = (p) => <OIcon {...p}><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z"/></OIcon>;
const OIconBox     = (p) => <OIcon {...p}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></OIcon>;
const OIconMap     = (p) => <OIcon {...p}><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15"/><path d="M15 6v15"/></OIcon>;
const OIconUsers   = (p) => <OIcon {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></OIcon>;
const OIconRefresh = (p) => <OIcon {...p}><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M3 21v-5h5"/></OIcon>;
const OIconShield  = (p) => <OIcon {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></OIcon>;
const OIconSettings= (p) => <OIcon {...p}><circle cx="12" cy="12" r="3"/></OIcon>;
const OIconAlert   = (p) => <OIcon {...p}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></OIcon>;
const OIconClock   = (p) => <OIcon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></OIcon>;
Object.assign(window, { OIcon, OIconGauge, OIconInbox, OIconBox, OIconMap, OIconUsers, OIconRefresh, OIconShield, OIconSettings, OIconAlert, OIconClock });

// ---- OpSidebar ----
function OpSidebar() {
  const items = [
    { k: 'dash',    icon: <OIconGauge />, label: 'Resumen', active: true },
    { k: 'orders',  icon: <OIconInbox />, label: 'Pedidos' },
    { k: 'inv',     icon: <OIconBox />,   label: 'Inventario' },
    { k: 'route',   icon: <OIconMap />,   label: 'Rutas' },
    { k: 'clients', icon: <OIconUsers />, label: 'Clientes' },
  ];
  return (
    <aside className="op-sidebar">
      <div className="op-brand">
        <div className="m">L</div>
        <div className="n">LácteoOp</div>
      </div>
      <div>
        <div className="op-sec" style={{ marginBottom: 6 }}>Operación</div>
        <nav className="op-nav">
          {items.map(it => (
            <div key={it.k} className={`it ${it.active ? 'active' : ''}`}>
              {it.icon}{it.label}
            </div>
          ))}
        </nav>
      </div>
      <div>
        <div className="op-sec" style={{ marginBottom: 6 }}>Administración</div>
        <nav className="op-nav">
          <div className="it"><OIconShield />Privacidad</div>
          <div className="it"><OIconSettings />Configuración</div>
        </nav>
      </div>
      <div className="op-foot">
        <div className="av">DM</div>
        <div>
          <div className="un">Daniela Mora</div>
          <div className="ur">Gerente de operaciones</div>
        </div>
      </div>
    </aside>
  );
}
window.OpSidebar = OpSidebar;

// ---- OpTopBar ----
function OpTopBar({ lastRefresh, range, onRange, onRefresh, autoRefreshOn }) {
  const ranges = [
    { k: 'today', label: 'Hoy' },
    { k: 'week',  label: 'Semana' },
    { k: 'month', label: 'Mes' },
  ];
  return (
    <header className="op-topbar">
      <h1>Resumen de operación</h1>
      <span className="date">miércoles 22 may 2026</span>
      <div className="right">
        <div className="daterange">
          {ranges.map(r => (
            <button key={r.k} className={range === r.k ? 'active' : ''} onClick={() => onRange(r.k)}>{r.label}</button>
          ))}
        </div>
        <span className="refresh-info">
          {autoRefreshOn && <span className="dot" />}
          Actualizado · {lastRefresh}
        </span>
        <button className="refresh-btn-op" onClick={onRefresh}>
          <OIconRefresh size={14} />Actualizar
        </button>
      </div>
    </header>
  );
}
window.OpTopBar = OpTopBar;

// ---- KpiCard ----
function KpiCard({ label, value, deltaLabel, deltaDir, lastRefresh, alarm }) {
  return (
    <div className={`kpi ${alarm ? 'alarm' : ''}`}>
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      <div className="meta">
        {deltaLabel && <span className={`delta ${deltaDir || ''}`}>{deltaLabel}</span>}
        <span>act. {lastRefresh}</span>
      </div>
    </div>
  );
}
window.KpiCard = KpiCard;

// ---- BarChart (stacked: delivered / pending / returned per day) ----
function BarChart({ data, max }) {
  return (
    <div className="bars">
      {[0, 25, 50, 75, 100].map(p => (
        <div key={p} className="gridline" style={{ bottom: 24 + (p/100) * 156 }}>
          <span>{Math.round(max * p / 100)}</span>
        </div>
      ))}
      {data.map((d, i) => {
        const total = d.d + d.r + d.p;
        const scale = 156 / max;
        return (
          <div key={i} className="col">
            <div className="stack" style={{ height: 156 - (max - total) * scale, justifyContent: 'flex-end' }}>
              {d.r > 0 && <div className="seg-r" style={{ height: d.r * scale }} />}
              {d.p > 0 && <div className="seg-p" style={{ height: d.p * scale }} />}
              {d.d > 0 && <div className="seg-d" style={{ height: d.d * scale }} />}
            </div>
            <div className="lab">{d.label}</div>
          </div>
        );
      })}
    </div>
  );
}
window.BarChart = BarChart;

// ---- DriversPanel ----
function DriversPanel({ drivers }) {
  return (
    <div className="driver-list">
      {drivers.map(d => {
        const pct = Math.round((d.done / d.total) * 100);
        return (
          <div key={d.name} className={`driver-row ${pct < 30 ? 'warn' : ''}`}>
            <div className="av">{d.initials}</div>
            <div>
              <div className="name">{d.name}</div>
              <div className="progress">{d.done} de {d.total} entregas · {d.zone}</div>
              <div className="bar"><div style={{ width: pct + '%' }} /></div>
            </div>
            <div className="pct">{pct}%</div>
          </div>
        );
      })}
    </div>
  );
}
window.DriversPanel = DriversPanel;

// ---- OrdersTable ----
const STATE = {
  recibido:  { cls: 'b-recibido',  dot: 'var(--ink-500)',   label: 'Recibido' },
  alistando: { cls: 'b-alistando', dot: 'var(--amber-500)', label: 'Alistando' },
  enruta:    { cls: 'b-enruta',    dot: 'var(--sky-500)',   label: 'En ruta' },
  entregado: { cls: 'b-entregado', dot: 'var(--green-500)', label: 'Entregado' },
  devuelto:  { cls: 'b-devuelto',  dot: 'var(--red-500)',   label: 'Devuelto' },
};

function OrdersTable({ orders, sort, onSort }) {
  const sortInd = (k) => sort === k ? '▾' : '';
  const sorted = [...orders].sort((a, b) => {
    if (sort === 'amount') return b.amountValue - a.amountValue;
    if (sort === 'time')   return a.id < b.id ? 1 : -1;
    return 0;
  });
  return (
    <div className="table-wrap">
      <table className="op-table">
        <thead>
          <tr>
            <th className="sortable" onClick={() => onSort('time')}>Pedido <span className="sort-ind">{sortInd('time')}</span></th>
            <th>Cliente</th>
            <th>Ciudad</th>
            <th>Estado</th>
            <th className="sortable" onClick={() => onSort('amount')} style={{ textAlign: 'right' }}>Total <span className="sort-ind">{sortInd('amount')}</span></th>
            <th style={{ textAlign: 'right' }}>Conductor</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(o => {
            const s = STATE[o.state];
            return (
              <tr key={o.id}>
                <td><div className="id">#{o.id}</div><div style={{ fontSize: 11, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }}>{o.time}</div></td>
                <td className="strong">{o.client}</td>
                <td>{o.city}</td>
                <td><span className={`badge ${s.cls}`}><span className="dot" style={{ background: s.dot }} />{s.label}</span></td>
                <td className="num" style={{ textAlign: 'right' }}>{o.amount}</td>
                <td style={{ textAlign: 'right' }}>{o.driver || <span style={{ color: 'var(--fg-3)' }}>—</span>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
window.OrdersTable = OrdersTable;

// ---- AlertsPanel ----
function AlertsPanel({ alerts }) {
  return (
    <div className="alerts-list">
      {alerts.map((a, i) => (
        <div key={i} className={`alert ${a.kind}`}>
          <div className="ic">{a.kind === 'danger' ? <OIconAlert size={16}/> : <OIconClock size={16}/>}</div>
          <div>
            <div className="title">{a.title}</div>
            <div className="sub">{a.sub}</div>
          </div>
          <div className="when">{a.when}</div>
        </div>
      ))}
    </div>
  );
}
window.AlertsPanel = AlertsPanel;

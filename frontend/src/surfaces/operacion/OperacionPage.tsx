import React, { useEffect, useState, useCallback } from 'react';
import '../../styles/operacion.css';
import { httpOperacionPort } from '../../shared/adapters/http';
import {
  LIconRefresh, LIconAlert, LIconClock,
} from '../../components/Icons';
import type { KPIs, BarData } from '../../shared/ports';
import type { Pedido, Alerta, Conductor } from '../../shared/domain';

const port = httpOperacionPort();

// ---- TopBar ----
interface OpTopBarProps {
  lastRefresh: string;
  range: string;
  onRange: (r: string) => void;
  onRefresh: () => void;
  autoRefreshOn: boolean;
}
const OpTopBar: React.FC<OpTopBarProps> = ({ lastRefresh, range, onRange, onRefresh, autoRefreshOn }) => {
  const ranges = [
    { k: 'today', label: 'Hoy' },
    { k: 'week',  label: 'Semana' },
    { k: 'month', label: 'Mes' },
  ];
  const today = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
  return (
    <header className="op-topbar">
      <h1>Resumen de operación</h1>
      <span className="date">{today}</span>
      <div className="right">
        <div className="daterange">
          {ranges.map((r) => (
            <button key={r.k} className={range === r.k ? 'active' : ''} onClick={() => onRange(r.k)}>{r.label}</button>
          ))}
        </div>
        <span className="refresh-info">
          {autoRefreshOn && <span className="dot" />}
          Actualizado · {lastRefresh}
        </span>
        <button className="refresh-btn-op" onClick={onRefresh}>
          <LIconRefresh size={14} />Actualizar
        </button>
      </div>
    </header>
  );
};

// ---- KpiCard ----
interface KpiCardProps {
  label: string;
  value: string | number;
  lastRefresh: string;
  alarm?: boolean;
}
const KpiCard: React.FC<KpiCardProps> = ({ label, value, lastRefresh, alarm }) => (
  <div className={`kpi${alarm ? ' alarm' : ''}`}>
    <div className="label">{label}</div>
    <div className="value">{value}</div>
    <div className="meta">
      <span>act. {lastRefresh}</span>
    </div>
  </div>
);

// ---- BarChart ----
interface BarChartProps { data: BarData[]; }
const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const max = Math.max(...data.map((d) => d.entregados + d.devueltos + d.pendientes), 1);
  const scale = 156 / max;
  return (
    <div className="bars">
      {[0, 25, 50, 75, 100].map((p) => (
        <div key={p} className="gridline" style={{ bottom: 24 + (p / 100) * 156 }}>
          <span>{Math.round(max * p / 100)}</span>
        </div>
      ))}
      {data.map((d, i) => {
        const total = d.entregados + d.devueltos + d.pendientes;
        return (
          <div key={i} className="col">
            <div className="stack" style={{ height: 156 - (max - total) * scale, justifyContent: 'flex-end' }}>
              {d.devueltos  > 0 && <div className="seg-r" style={{ height: d.devueltos  * scale }} />}
              {d.pendientes > 0 && <div className="seg-p" style={{ height: d.pendientes * scale }} />}
              {d.entregados > 0 && <div className="seg-d" style={{ height: d.entregados * scale }} />}
            </div>
            <div className="lab">{d.label}</div>
          </div>
        );
      })}
    </div>
  );
};

// ---- DriversPanel ----
interface DriversPanelProps { drivers: Conductor[]; }
const DriversPanel: React.FC<DriversPanelProps> = ({ drivers }) => (
  <div className="driver-list">
    {drivers.map((d) => {
      const pct = d.total > 0 ? Math.round((d.done / d.total) * 100) : 0;
      return (
        <div key={d.id} className={`driver-row${pct < 30 ? ' warn' : ''}`}>
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

// ---- State badge map (mirrors design kit STATE object) ----
const STATE: Record<string, { cls: string; dot: string; label: string }> = {
  recibido:  { cls: 'b-recibido',  dot: 'var(--ink-500)',   label: 'Recibido' },
  alistando: { cls: 'b-alistando', dot: 'var(--amber-500)', label: 'Alistando' },
  enruta:    { cls: 'b-enruta',    dot: 'var(--sky-500)',   label: 'En ruta' },
  entregado: { cls: 'b-entregado', dot: 'var(--green-500)', label: 'Entregado' },
  devuelto:  { cls: 'b-devuelto',  dot: 'var(--red-500)',   label: 'Devuelto' },
};

// ---- OrdersTable ----
interface OrdersTableProps { orders: Pedido[]; sort: string; onSort: (k: string) => void; }
const OrdersTable: React.FC<OrdersTableProps> = ({ orders, sort, onSort }) => {
  const sortInd = (k: string) => sort === k ? '▾' : '';
  const sorted = [...orders].sort((a, b) => {
    if (sort === 'amount') return b.amount - a.amount;
    if (sort === 'time')   return a.time < b.time ? 1 : -1;
    return 0;
  });
  const fmtCurrency = (n: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="table-wrap">
      <table className="op-table">
        <thead>
          <tr>
            <th className="sortable" onClick={() => onSort('time')}>Pedido <span className="sort-ind">{sortInd('time')}</span></th>
            <th>Cliente</th>
            <th>Estado</th>
            <th className="sortable" onClick={() => onSort('amount')} style={{ textAlign: 'right' }}>Total <span className="sort-ind">{sortInd('amount')}</span></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((o) => {
            const s = STATE[o.state] ?? { cls: 'b-recibido', dot: 'var(--ink-500)', label: o.state };
            return (
              <tr key={o.id}>
                <td>
                  <div className="id">#{o.id}</div>
                  <div style={{ fontSize: 11, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }}>{o.time}</div>
                </td>
                <td className="strong">{o.client}</td>
                <td>
                  <span className={`badge ${s.cls}`}>
                    <span className="dot" style={{ background: s.dot }} />{s.label}
                  </span>
                </td>
                <td className="num" style={{ textAlign: 'right' }}>{fmtCurrency(o.amount)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ---- AlertsPanel ----
interface AlertsPanelProps { alerts: Alerta[]; }
const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts }) => (
  <div className="alerts-list">
    {alerts.map((a, i) => (
      <div key={a.id ?? i} className={`alert ${a.kind}`}>
        <div className="ic">
          {a.kind === 'danger' ? <LIconAlert size={16} /> : <LIconClock size={16} />}
        </div>
        <div>
          <div className="title">{a.title}</div>
          <div className="sub">{a.sub}</div>
        </div>
        <div className="when">{a.when}</div>
      </div>
    ))}
  </div>
);

// ---- Main Page ----
const OperacionPage: React.FC = () => {
  const [kpis, setKpis]             = useState<KPIs | null>(null);
  const [grafico, setGrafico]       = useState<BarData[]>([]);
  const [conductores, setConductores] = useState<Conductor[]>([]);
  const [alertas, setAlertas]       = useState<Alerta[]>([]);
  const [pedidos, setPedidos]       = useState<Pedido[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState('—');
  const [range, setRange]           = useState('today');
  const [sort, setSort]             = useState('time');

  const formatRefresh = () =>
    new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [k, g, c, a, p] = await Promise.all([
        port.obtenerKpis(),
        port.obtenerGrafico(),
        port.obtenerConductores(),
        port.obtenerAlertas(),
        port.obtenerPedidos(),
      ]);
      setKpis(k);
      setGrafico(g);
      setConductores(c);
      setAlertas(a);
      setPedidos(p);
      setLastRefresh(formatRefresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const fmtCurrency = (n: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="op-main">
      <OpTopBar
        lastRefresh={lastRefresh}
        range={range}
        onRange={setRange}
        onRefresh={() => void load()}
        autoRefreshOn={false}
      />
      <div className="op-content">
          {error && (
            <div style={{ padding: '12px 16px', background: 'var(--danger-tint)', color: 'var(--red-700)', borderRadius: 8, fontSize: 13 }}>
              {error}
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--fg-3)', fontSize: 14 }}>
              Cargando datos…
            </div>
          )}

          {!loading && kpis && (
            <div className="kpi-grid">
              <KpiCard label="Pedidos hoy"   value={kpis.pedidos_hoy}            lastRefresh={lastRefresh} />
              <KpiCard label="En ruta"       value={kpis.en_ruta}                lastRefresh={lastRefresh} />
              <KpiCard label="Devoluciones"  value={kpis.devoluciones}           lastRefresh={lastRefresh} alarm={kpis.devoluciones > 0} />
              <KpiCard label="Cartera"       value={fmtCurrency(kpis.cartera)}   lastRefresh={lastRefresh} />
            </div>
          )}

          {!loading && (grafico.length > 0 || conductores.length > 0) && (
            <div className="dashboard-row">
              {grafico.length > 0 && (
                <div className="panel">
                  <div className="panel-head">
                    <h3>Entregas últimos 7 días</h3>
                    <div className="legend">
                      <span><span className="legend-swatch" style={{ background: 'var(--brand)' }} />Entregados</span>
                      <span><span className="legend-swatch" style={{ background: 'var(--paper-300)' }} />Pendientes</span>
                      <span><span className="legend-swatch" style={{ background: 'var(--red-300)' }} />Devueltos</span>
                    </div>
                  </div>
                  <BarChart data={grafico} />
                </div>
              )}
              {conductores.length > 0 && (
                <div className="panel">
                  <div className="panel-head"><h3>Conductores</h3><span className="sub">{conductores.length} activos</span></div>
                  <DriversPanel drivers={conductores} />
                </div>
              )}
            </div>
          )}

          {!loading && alertas.length > 0 && (
            <div className="panel">
              <div className="panel-head"><h3>Alertas</h3><span className="sub">{alertas.length} activas</span></div>
              <AlertsPanel alerts={alertas} />
            </div>
          )}

          {!loading && pedidos.length > 0 && (
            <div className="panel">
              <div className="panel-head"><h3>Pedidos</h3><span className="sub">{pedidos.length} pedidos</span></div>
              <OrdersTable orders={pedidos} sort={sort} onSort={setSort} />
            </div>
          )}
        </div>
    </div>
  );
};

export default OperacionPage;

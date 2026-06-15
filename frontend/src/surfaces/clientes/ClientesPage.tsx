import React, { useEffect, useState } from 'react';
import { httpPedidoPort } from '../../shared/adapters/http';
import type { Cliente } from '../../shared/ports';
import { LIconUsers, LIconSearch, LIconPlus, LIconEye } from '../../components/Icons';
import { DataConsentModal } from '../../components/DataConsentModal';
import { ProtectedDataLabel } from '../../components/ProtectedDataLabel';
import '../../styles/clientes.css';

// mock — no backend yet for orders history; static sample used per design kit
const SAMPLE_ORDERS = [
  { id: '4821', date: '22 may · 09:14', amount: '$ 248.500', state: 'alistando' },
  { id: '4788', date: '20 may · 10:22', amount: '$ 186.200', state: 'entregado' },
  { id: '4745', date: '17 may · 08:50', amount: '$ 312.000', state: 'entregado' },
];

// mock — no backend yet for client consent status; comes from backend in a future phase
type ConsentStatus = 'ok' | 'pending' | 'revoked';
const CONSENT_MAP: Record<string, ConsentStatus> = {
  'C-128': 'ok', 'C-201': 'ok', 'C-342': 'pending', 'C-415': 'ok',
  'C-502': 'ok', 'C-610': 'revoked', 'C-718': 'ok',
};

const STATE_LABEL: Record<string, { bg: string; color: string; label: string }> = {
  recibido:  { bg: 'var(--paper-200)',  color: 'var(--ink-700)',   label: 'Recibido' },
  alistando: { bg: 'var(--amber-50)',   color: 'var(--amber-700)', label: 'Alistando' },
  enruta:    { bg: 'var(--sky-50)',     color: 'var(--sky-700)',   label: 'En ruta' },
  entregado: { bg: 'var(--green-50)',   color: 'var(--green-700)', label: 'Entregado' },
  devuelto:  { bg: 'var(--red-50)',     color: 'var(--red-700)',   label: 'Devuelto' },
};

const CONSENT_LABEL: Record<ConsentStatus, string> = {
  ok: 'Consentimiento activo',
  pending: 'Pendiente de firmar',
  revoked: 'Revocado',
};

function ConsentBadge({ status }: { status: ConsentStatus }) {
  return <span className={`consent-badge ${status}`}>{CONSENT_LABEL[status]}</span>;
}

function ClientDetail({ client, onOpenConsent }: { client: Cliente | null; onOpenConsent: () => void }) {
  if (!client) return (
    <div className="cli-detail" style={{ alignItems: 'center', justifyContent: 'center', color: 'var(--fg-3)', minHeight: 300 }}>
      <LIconUsers size={32} />
      <div style={{ fontSize: 13, marginTop: 8 }}>Seleccione un cliente</div>
    </div>
  );
  const initials = client.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
  const consent: ConsentStatus = CONSENT_MAP[client.id] ?? 'pending';
  return (
    <div className="cli-detail">
      <div className="cli-detail-header">
        <div className="cli-avatar-lg">{initials}</div>
        <div>
          <div className="name">{client.name}</div>
          <div className="sub">{client.city} · {client.id}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <ConsentBadge status={consent} />
        <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>Ley 1581 de 2012</span>
        {/* no backend yet for consent update — opens local consent modal */}
        <button className="lo-btn lo-btn-ghost lo-btn-sm" onClick={onOpenConsent} style={{ marginLeft: 'auto' }}>
          <LIconEye size={13} />Ver consentimiento
        </button>
      </div>

      <div>
        <div className="cli-info-row">
          <span className="l">Direccion <ProtectedDataLabel /></span>
          <span className="r">{client.addr}</span>
        </div>
        <div className="cli-info-row">
          <span className="l">Ciudad</span>
          <span className="r">{client.city}</span>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-1)', paddingTop: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
          Pedidos recientes {/* mock — no backend yet for per-client order history */}
        </div>
        {SAMPLE_ORDERS.map(o => {
          const s = STATE_LABEL[o.state] ?? STATE_LABEL.recibido;
          return (
            <div key={o.id} className="cli-order-row">
              <span className="id">#{o.id}</span>
              <span className="date">{o.date}</span>
              <span className="lo-badge" style={{ background: s.bg, color: s.color, fontSize: 9, padding: '2px 6px', borderRadius: 'var(--r-pill)' }}>{s.label}</span>
              <span className="amount">{o.amount}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const ClientesPage: React.FC = () => {
  const [clients, setClients] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [consentOpen, setConsentOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    httpPedidoPort().listarClientes()
      .then(setClients)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const visible = clients.filter(c =>
    !query ||
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.id.toLowerCase().includes(query.toLowerCase()),
  );
  const selected = clients.find(c => c.id === selectedId) ?? null;

  return (
    <div className="lo-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Clientes</h2>
        {/* no backend yet for create client — local state only */}
        <button className="lo-btn lo-btn-primary lo-btn-sm" disabled title="Crear cliente — sin backend por ahora">
          <LIconPlus size={14} />Nuevo cliente
        </button>
      </div>

      <div className="cli-toolbar" style={{ marginBottom: 16 }}>
        <div className="lo-search">
          <LIconSearch size={16} />
          <input
            placeholder="Buscar cliente..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {loading && <div style={{ padding: 40, textAlign: 'center', color: 'var(--fg-3)' }}>Cargando clientes...</div>}
      {error && <div style={{ padding: 20, color: 'var(--danger)' }}>Error: {error}</div>}

      {!loading && !error && (
        <div className="cli-workspace">
          <div className="lo-table-wrap">
            <table className="lo-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Codigo</th>
                  <th>Ciudad</th>
                  <th>Consentimiento</th>
                </tr>
              </thead>
              <tbody>
                {visible.map(c => {
                  const consent: ConsentStatus = CONSENT_MAP[c.id] ?? 'pending';
                  return (
                    <tr key={c.id}
                        style={{ cursor: 'pointer', background: selectedId === c.id ? 'var(--green-50)' : undefined }}
                        onClick={() => setSelectedId(c.id)}>
                      <td className="strong">{c.name}</td>
                      <td className="num" style={{ fontSize: 11, color: 'var(--fg-3)' }}>{c.id}</td>
                      <td>{c.city}</td>
                      <td><ConsentBadge status={consent} /></td>
                    </tr>
                  );
                })}
                {visible.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32, color: 'var(--fg-3)' }}>
                    Sin clientes para esta busqueda.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>

          <ClientDetail client={selected} onOpenConsent={() => setConsentOpen(true)} />
        </div>
      )}

      <DataConsentModal
        open={consentOpen}
        onClose={() => setConsentOpen(false)}
        onConsent={() => setConsentOpen(false)}
        clientName={selected?.name}
      />
    </div>
  );
};

export default ClientesPage;

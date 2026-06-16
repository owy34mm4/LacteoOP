import React, { useEffect, useState } from 'react';
import { httpClientePort } from '../../shared/adapters/http';
import type { Cliente } from '../../shared/ports';
import { LIconUsers, LIconSearch, LIconPlus, LIconEye, LIconTrash } from '../../components/Icons';
import { DataConsentModal } from '../../components/DataConsentModal';
import { ProtectedDataLabel } from '../../components/ProtectedDataLabel';
import '../../styles/clientes.css';

// mock — no backend yet for orders history; static sample used per design kit
const SAMPLE_ORDERS = [
  { id: '4821', date: '22 may · 09:14', amount: '$ 248.500', state: 'alistando' },
  { id: '4788', date: '20 may · 10:22', amount: '$ 186.200', state: 'entregado' },
  { id: '4745', date: '17 may · 08:50', amount: '$ 312.000', state: 'entregado' },
];

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

interface ClienteFormState {
  nombre: string;
  ciudad: string;
  direccion: string;
  telefono: string;
}

function ClienteForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial?: ClienteFormState;
  onSave: (data: ClienteFormState) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<ClienteFormState>(
    initial ?? { nombre: '', ciudad: '', direccion: '', telefono: '' },
  );

  const set = (k: keyof ClienteFormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 16, border: '1px solid var(--border-1)', borderRadius: 8, background: 'var(--surface-1)' }}>
      <div style={{ fontWeight: 700, fontSize: 13 }}>{initial ? 'Editar cliente' : 'Nuevo cliente'}</div>
      <label style={{ fontSize: 12 }}>
        Nombre <ProtectedDataLabel />
        <input className="lo-input" value={form.nombre} onChange={set('nombre')} placeholder="Nombre del cliente" style={{ marginTop: 4 }} />
      </label>
      <label style={{ fontSize: 12 }}>
        Ciudad
        <input className="lo-input" value={form.ciudad} onChange={set('ciudad')} placeholder="Ciudad" style={{ marginTop: 4 }} />
      </label>
      <label style={{ fontSize: 12 }}>
        Direccion <ProtectedDataLabel />
        <input className="lo-input" value={form.direccion} onChange={set('direccion')} placeholder="Direccion" style={{ marginTop: 4 }} />
      </label>
      <label style={{ fontSize: 12 }}>
        Telefono <ProtectedDataLabel />
        <input className="lo-input" value={form.telefono} onChange={set('telefono')} placeholder="+57 300 000 0000" style={{ marginTop: 4 }} />
      </label>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="lo-btn lo-btn-primary lo-btn-sm" onClick={() => onSave(form)} disabled={saving || !form.nombre.trim()}>
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
        <button className="lo-btn lo-btn-ghost lo-btn-sm" onClick={onCancel} disabled={saving}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

function ClientDetail({
  client,
  onOpenConsent,
  onEdit,
  onDelete,
}: {
  client: Cliente | null;
  onOpenConsent: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
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

      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        <ConsentBadge status={consent} />
        <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>Ley 1581 de 2012</span>
        <button className="lo-btn lo-btn-ghost lo-btn-sm" onClick={onOpenConsent} style={{ marginLeft: 'auto' }}>
          <LIconEye size={13} />Ver consentimiento
        </button>
        <button className="lo-btn lo-btn-ghost lo-btn-sm" onClick={onEdit}>
          Editar
        </button>
        <button className="lo-btn lo-btn-ghost lo-btn-sm" onClick={onDelete} style={{ color: 'var(--danger)' }}>
          <LIconTrash size={13} />Eliminar
        </button>
      </div>

      <div>
        <div className="cli-info-row">
          <span className="l">Nombre <ProtectedDataLabel /></span>
          <span className="r">{client.name}</span>
        </div>
        <div className="cli-info-row">
          <span className="l">Telefono <ProtectedDataLabel /></span>
          <span className="r">{client.phone || '—'}</span>
        </div>
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

const port = httpClientePort();

const ClientesPage: React.FC = () => {
  const [clients, setClients] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [consentOpen, setConsentOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Cliente | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    port.listar()
      .then(setClients)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const visible = clients.filter(c =>
    !query ||
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.id.toLowerCase().includes(query.toLowerCase()),
  );
  const selected = clients.find(c => c.id === selectedId) ?? null;

  const handleCreate = async (data: { nombre: string; ciudad: string; direccion: string; telefono: string }) => {
    setSaving(true);
    try {
      const created = await port.crear({ name: data.nombre, city: data.ciudad, addr: data.direccion, phone: data.telefono });
      setClients(prev => [...prev, created]);
      setShowForm(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (data: { nombre: string; ciudad: string; direccion: string; telefono: string }) => {
    if (!editingClient) return;
    setSaving(true);
    try {
      const updated = await port.actualizar(editingClient.id, { name: data.nombre, city: data.ciudad, addr: data.direccion, phone: data.telefono });
      setClients(prev => prev.map(c => c.id === updated.id ? updated : c));
      setEditingClient(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Esta accion eliminara todos los datos personales de este cliente (Ley 1581). ¿Continuar?')) return;
    try {
      await port.eliminar(id);
      setClients(prev => prev.filter(c => c.id !== id));
      if (selectedId === id) setSelectedId(null);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="lo-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Clientes</h2>
        <button className="lo-btn lo-btn-primary lo-btn-sm" onClick={() => { setShowForm(true); setEditingClient(null); }}>
          <LIconPlus size={14} />Nuevo cliente
        </button>
      </div>

      {(showForm && !editingClient) && (
        <div style={{ marginBottom: 16 }}>
          <ClienteForm
            onSave={handleCreate}
            onCancel={() => setShowForm(false)}
            saving={saving}
          />
        </div>
      )}

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
                        onClick={() => { setSelectedId(c.id); setEditingClient(null); }}>
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

          {editingClient ? (
            <div className="cli-detail">
              <ClienteForm
                initial={{ nombre: editingClient.name, ciudad: editingClient.city, direccion: editingClient.addr, telefono: editingClient.phone }}
                onSave={handleUpdate}
                onCancel={() => setEditingClient(null)}
                saving={saving}
              />
            </div>
          ) : (
            <ClientDetail
              client={selected}
              onOpenConsent={() => setConsentOpen(true)}
              onEdit={() => setEditingClient(selected)}
              onDelete={() => selected && handleDelete(selected.id)}
            />
          )}
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

import React, { useState } from 'react';
import '../../styles/privacidad.css';
import { PrivacyNoticeBanner } from '../../components/PrivacyNoticeBanner';
import { DataDeletionForm } from '../../components/DataDeletionForm';
import {
  LIconShield,
  LIconEye,
  LIconEdit,
  LIconTrash,
  LIconDownload,
} from '../../components/Icons';

// mock — no backend endpoint yet
const CONSENT_CLIENTS = [
  { id: 'C-128', name: 'Tienda La Esquina',          contact: 'Maria Lopez',    status: 'ok',      date: '15 ene 2026' },
  { id: 'C-201', name: 'Restaurante El Buen Sabor',  contact: 'Jorge Ramirez',  status: 'ok',      date: '15 ene 2026' },
  { id: 'C-342', name: 'Minimarket Yumbo Centro',    contact: 'Paola Giraldo',  status: 'pending', date: '—' },
  { id: 'C-415', name: 'Panaderia Dona Rosa',        contact: 'Rosa Martinez',  status: 'ok',      date: '16 ene 2026' },
  { id: 'C-502', name: 'Tienda Don Pacho',           contact: 'Francisco Mena', status: 'ok',      date: '15 ene 2026' },
  { id: 'C-610', name: 'Cafe Los Almendros',         contact: 'Andres Caicedo', status: 'revoked', date: '10 may 2026' },
  { id: 'C-718', name: 'Tienda La Sirena',           contact: 'Lucia Arango',   status: 'ok',      date: '15 ene 2026' },
] as const;

// mock — no backend endpoint yet
const AUDIT_LOG = [
  { type: 'view',   actor: 'Sara Restrepo',  action: 'Consulto datos de cliente',    target: 'Tienda La Esquina (C-128)',   time: '09:42 hoy' },
  { type: 'edit',   actor: 'Sara Restrepo',  action: 'Actualizo telefono de cliente', target: 'Panaderia Dona Rosa (C-415)', time: '09:18 hoy' },
  { type: 'view',   actor: 'Daniela Mora',   action: 'Exporto reporte de clientes',  target: '7 registros',                 time: '08:30 hoy' },
  { type: 'delete', actor: 'Andres Caicedo', action: 'Solicitud de eliminacion',     target: 'Cafe Los Almendros (C-610)',  time: '10 may' },
  { type: 'edit',   actor: 'Sara Restrepo',  action: 'Registro nuevo cliente',       target: 'Tienda Don Pacho (C-502)',    time: '8 may' },
  { type: 'export', actor: 'Daniela Mora',   action: 'Exporto datos para auditoria', target: '180 registros',               time: '1 may' },
] as const;

// mock — no backend endpoint yet
const DEL_REQUESTS_INITIAL = [
  { id: 'DEL-003', client: 'Cafe Los Almendros', contact: 'Andres Caicedo', date: '10 may 2026', status: 'pending', reason: 'El titular solicita eliminacion total de sus datos personales.' },
];

type ConsentClient = { id: string; name: string; contact: string; status: string; date: string };
type AuditEntry   = { type: string; actor: string; action: string; target: string; time: string };
type DelRequest   = { id: string; client: string; contact: string; date: string; status: string; reason: string };

type TabKey = 'consentimientos' | 'eliminaciones' | 'auditoria' | 'politica';

const TABS: { k: TabKey; label: string }[] = [
  { k: 'consentimientos', label: 'Consentimientos' },
  { k: 'eliminaciones',   label: 'Solicitudes de eliminacion' },
  { k: 'auditoria',       label: 'Bitacora de accesos' },
  { k: 'politica',        label: 'Politica de privacidad' },
];

// ---- Sub-components ----

const CONSENT_LABEL: Record<string, string> = { ok: 'Activo', pending: 'Pendiente', revoked: 'Revocado' };

function ConsentStatusBadge({ status }: { status: string }) {
  return <span className={`priv-consent-badge ${status}`}>{CONSENT_LABEL[status] ?? status}</span>;
}

function ConsentList({ clients }: { clients: readonly ConsentClient[] }) {
  return (
    <div className="lo-panel">
      <div className="lo-panel-head" style={{ marginBottom: 16 }}>
        <h3>Consentimientos de clientes</h3>
        <span className="sub">Ley 1581 de 2012</span>
      </div>
      {clients.map((c) => (
        <div key={c.id} className="consent-row">
          <div>
            <div className="name">{c.name}</div>
            <div className="sub">{c.contact} · {c.id}</div>
          </div>
          <ConsentStatusBadge status={c.status} />
          <div className="date">{c.date}</div>
          <button className="lo-btn lo-btn-ghost lo-btn-sm">
            <LIconEye size={14} />Ver
          </button>
        </div>
      ))}
    </div>
  );
}

function AuditLog({ entries }: { entries: readonly AuditEntry[] }) {
  const iconFor = (type: string) => {
    if (type === 'view')   return <LIconEye size={14} />;
    if (type === 'edit')   return <LIconEdit size={14} />;
    if (type === 'delete') return <LIconTrash size={14} />;
    return <LIconDownload size={14} />;
  };
  return (
    <div className="lo-panel">
      <div className="lo-panel-head" style={{ marginBottom: 16 }}>
        <h3>Bitacora de accesos</h3>
        <span className="sub">{entries.length} eventos</span>
      </div>
      {entries.map((e, i) => (
        <div key={i} className="audit-row">
          <div className={`audit-dot ${e.type}`}>{iconFor(e.type)}</div>
          <div>
            <div className="title">{e.action}</div>
            <div className="sub">{e.actor} · {e.target}</div>
          </div>
          <div className="time">{e.time}</div>
        </div>
      ))}
    </div>
  );
}

function PolicyViewer() {
  return (
    <div className="lo-panel">
      <div className="lo-panel-head" style={{ marginBottom: 16 }}>
        <h3>Politica de privacidad</h3>
      </div>
      <div className="policy-viewer">
        <h4>1. Responsable del tratamiento</h4>
        <p>Distribuidora Lacteos del Valle S.A.S., NIT 900.XXX.XXX-X, con domicilio en Palmira, Valle del Cauca, Colombia.</p>
        <h4>2. Finalidad del tratamiento</h4>
        <p>Los datos personales de clientes (nombre, telefono, direccion, correo electronico) se recopilan para:</p>
        <ul>
          <li>Gestion de pedidos y entregas de productos lacteos.</li>
          <li>Generacion de rutas de distribucion.</li>
          <li>Facturacion y gestion de cartera.</li>
          <li>Comunicacion directa sobre pedidos en curso.</li>
        </ul>
        <h4>3. Derechos de los titulares</h4>
        <p>De conformidad con el articulo 8 de la Ley 1581 de 2012, los titulares tienen derecho a:</p>
        <ul>
          <li>Conocer, actualizar y rectificar sus datos personales.</li>
          <li>Solicitar prueba de la autorizacion otorgada.</li>
          <li>Presentar quejas ante la Superintendencia de Industria y Comercio.</li>
          <li>Revocar la autorizacion y/o solicitar la supresion de sus datos.</li>
        </ul>
        <h4>4. Canales de atencion</h4>
        <p>Los titulares pueden ejercer sus derechos a traves de la funcion "Solicitar eliminacion" en esta plataforma, o contactando directamente a la empresa.</p>
      </div>
    </div>
  );
}

// ---- Main page ----

const PrivacidadPage: React.FC = () => {
  const [tab, setTab]                     = useState<TabKey>('consentimientos');
  const [bannerAccepted, setBannerAccepted] = useState(false);
  const [policyOpen, setPolicyOpen]       = useState(false);
  const [delOpen, setDelOpen]             = useState(false);
  const [delRequests, setDelRequests]     = useState<DelRequest[]>(DEL_REQUESTS_INITIAL);

  const handleDeleteSubmit = (reason: string) => {
    const next: DelRequest = {
      id:      `DEL-00${delRequests.length + 4}`,
      client:  'Nuevo titular',
      contact: '—',
      date:    new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }),
      status:  'pending',
      reason,
    };
    setDelRequests((prev) => [...prev, next]);
    setDelOpen(false);
  };

  return (
    <div className="lo-content">
      {/* Topbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <span style={{ color: 'var(--brand)', display: 'flex' }}><LIconShield size={20} /></span>
        <h2 style={{ margin: 0 }}>Privacidad y proteccion de datos</h2>
      </div>

      {/* Privacy notice banner — reusing shared compliance component */}
      {!bannerAccepted && (
        <div style={{ marginBottom: 20 }}>
          <PrivacyNoticeBanner
            onAccept={() => setBannerAccepted(true)}
            onViewPolicy={() => { setPolicyOpen(true); setTab('politica'); }}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="priv-tabs" style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border-1)', paddingBottom: 0 }}>
        {TABS.map((t) => (
          <button
            key={t.k}
            className={`lo-chip ${tab === t.k ? 'active' : ''}`}
            style={{ borderRadius: 'var(--r-md) var(--r-md) 0 0', borderBottom: 'none' }}
            onClick={() => { setTab(t.k); if (t.k === 'politica') setPolicyOpen(true); }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'consentimientos' && (
        <ConsentList clients={CONSENT_CLIENTS} />
      )}

      {tab === 'eliminaciones' && (
        <div className="del-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3>Solicitudes de eliminacion</h3>
            {/* DataDeletionForm reused from shared compliance components */}
            <button className="lo-btn lo-btn-secondary lo-btn-sm" onClick={() => setDelOpen(true)}>
              Nueva solicitud
            </button>
          </div>
          <div className="sub">
            Los titulares de los datos pueden solicitar la eliminacion de su informacion personal segun el articulo 8 de la Ley 1581 de 2012.
          </div>
          {delRequests.length === 0 ? (
            <div className="lo-empty">
              <div className="title">Sin solicitudes pendientes</div>
              <div className="body">Las solicitudes de eliminacion apareceran aqui cuando un cliente las envie.</div>
            </div>
          ) : (
            delRequests.map((r) => (
              <div key={r.id} style={{ background: 'var(--paper-50)', border: '1px solid var(--border-1)', borderRadius: 'var(--r-md)', padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)' }}>{r.id} · {r.date}</span>
                  <span className="priv-consent-badge pending">Pendiente</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{r.client}</div>
                <div style={{ fontSize: 13, color: 'var(--fg-3)', marginTop: 2 }}>{r.contact}</div>
                <div style={{ fontSize: 13, color: 'var(--fg-2)', marginTop: 8, lineHeight: 1.5 }}>{r.reason}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button className="lo-btn lo-btn-danger lo-btn-sm">
                    <LIconTrash size={14} />Ejecutar eliminacion
                  </button>
                  <button className="lo-btn lo-btn-ghost lo-btn-sm">Rechazar</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'auditoria' && (
        <AuditLog entries={AUDIT_LOG} />
      )}

      {(tab === 'politica' || policyOpen) && tab === 'politica' && (
        <PolicyViewer />
      )}

      {/* DataDeletionForm — reusing shared compliance component */}
      <DataDeletionForm
        open={delOpen}
        onClose={() => setDelOpen(false)}
        onSubmit={handleDeleteSubmit}
      />
    </div>
  );
};

export default PrivacidadPage;

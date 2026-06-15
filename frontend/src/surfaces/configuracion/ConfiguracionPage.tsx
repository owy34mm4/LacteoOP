import React, { useState } from 'react';
import '../../styles/configuracion.css';
import {
  LIconUser,
  LIconBell,
  LIconSettings,
  LIconShield,
  LIconEdit,
  LIconTrash,
  LIconDownload,
  LIconLogout,
} from '../../components/Icons';

// mock — no backend endpoint yet
// Current user profile loaded from mock data (no auth endpoint connected)
const MOCK_PROFILE = {
  initials:   'SR',
  name:       'Sara Restrepo Guzman',
  email:      'sara.restrepo@lacteosv.co',
  phone:      '+57 316 882 4400',
  role:       'Asistente de pedidos',
};

type NavKey = 'perfil' | 'notificaciones' | 'sistema' | 'datos';

const NAV_ITEMS: { k: NavKey; icon: React.ReactNode; label: string }[] = [
  { k: 'perfil',         icon: <LIconUser size={16} />,     label: 'Mi perfil' },
  { k: 'notificaciones', icon: <LIconBell size={16} />,     label: 'Notificaciones' },
  { k: 'sistema',        icon: <LIconSettings size={16} />, label: 'Sistema' },
  { k: 'datos',          icon: <LIconShield size={16} />,   label: 'Mis datos' },
];

// ---- Toggle component ----

interface ToggleProps { on: boolean; onChange: (next: boolean) => void; }
const Toggle: React.FC<ToggleProps> = ({ on, onChange }) => (
  <div className={`lo-toggle ${on ? 'on' : ''}`} onClick={() => onChange(!on)} role="switch" aria-checked={on} />
);

// ---- Sections ----

const ProfileSection: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    <div className="cfg-section">
      <div className="cfg-profile-head">
        <div className="cfg-avatar-xl">{MOCK_PROFILE.initials}</div>
        <div>
          <div className="name">{MOCK_PROFILE.name}</div>
          <div className="sub">{MOCK_PROFILE.role} · {MOCK_PROFILE.email}</div>
        </div>
        {/* mock — no backend endpoint yet; edit profile not wired */}
        <button className="lo-btn lo-btn-secondary lo-btn-sm" style={{ marginLeft: 'auto' }} disabled title="Sin backend por ahora">
          <LIconEdit size={14} />Editar
        </button>
      </div>
    </div>

    <div className="cfg-section">
      <h3>Informacion personal</h3>
      <div className="lo-field">
        <div className="lo-field-label">Nombre completo</div>
        <input value={MOCK_PROFILE.name} readOnly />
      </div>
      <div className="lo-field">
        <div className="lo-field-label">Correo electronico</div>
        <input value={MOCK_PROFILE.email} readOnly />
      </div>
      <div className="lo-field">
        <div className="lo-field-label">Telefono</div>
        <input value={MOCK_PROFILE.phone} readOnly />
      </div>
      <div className="lo-field">
        <div className="lo-field-label">Rol</div>
        <input value={MOCK_PROFILE.role} readOnly style={{ color: 'var(--fg-3)' }} />
      </div>
    </div>
  </div>
);

interface NotifState {
  newOrder: boolean;
  lowStock: boolean;
  expiry: boolean;
  driverDelay: boolean;
  dailySummary: boolean;
  sound: boolean;
}

const NotificationsSection: React.FC = () => {
  // mock — no backend endpoint yet; preferences stored in local state only
  const [notifs, setNotifs] = useState<NotifState>({
    newOrder: true, lowStock: true, expiry: true,
    driverDelay: false, dailySummary: true, sound: false,
  });

  const toggle = (k: keyof NotifState) => setNotifs((prev) => ({ ...prev, [k]: !prev[k] }));

  const rows: { k: keyof NotifState; title: string; sub: string }[] = [
    { k: 'newOrder',     title: 'Nuevo pedido recibido',      sub: 'Notificacion cuando llega un pedido por WhatsApp o telefono.' },
    { k: 'lowStock',     title: 'Alerta de stock bajo',        sub: 'Cuando un producto cae por debajo del 25% de capacidad.' },
    { k: 'expiry',       title: 'Producto proximo a vencer',   sub: 'Cuando un lote vence en 5 dias o menos.' },
    { k: 'driverDelay',  title: 'Conductor sin reportar',      sub: 'Cuando un conductor lleva mas de 30 minutos sin actualizar.' },
    { k: 'dailySummary', title: 'Resumen diario',              sub: 'Correo a las 7 p.m. con el resumen de operacion del dia.' },
    { k: 'sound',        title: 'Sonido de notificaciones',    sub: 'Reproducir sonido cuando llega una notificacion en la plataforma.' },
  ];

  return (
    <div className="cfg-section">
      <h3>Notificaciones</h3>
      <div className="desc">Configure que alertas desea recibir. Las notificaciones criticas de inventario no se pueden desactivar.</div>
      {rows.map((r) => (
        <div key={r.k} className="cfg-row">
          <div className="left">
            <div className="title">{r.title}</div>
            <div className="sub">{r.sub}</div>
          </div>
          <Toggle on={notifs[r.k]} onChange={() => toggle(r.k)} />
        </div>
      ))}
    </div>
  );
};

const SystemSection: React.FC = () => {
  // mock — no backend endpoint yet; system settings in local state only
  const [autoRefresh, setAutoRefresh]       = useState(true);
  const [refreshInterval, setRefreshInterval] = useState('5');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="cfg-section">
        <h3>Sistema</h3>

        <div className="cfg-row">
          <div className="left">
            <div className="title">Actualizacion automatica del tablero</div>
            <div className="sub">Los indicadores del panel de operacion se refrescan periodicamente.</div>
          </div>
          <Toggle on={autoRefresh} onChange={setAutoRefresh} />
        </div>

        {autoRefresh && (
          <div className="lo-field" style={{ maxWidth: 200 }}>
            <div className="lo-field-label">Intervalo de actualizacion</div>
            <select value={refreshInterval} onChange={(e) => setRefreshInterval(e.target.value)}>
              <option value="1">Cada 1 minuto</option>
              <option value="3">Cada 3 minutos</option>
              <option value="5">Cada 5 minutos</option>
              <option value="10">Cada 10 minutos</option>
            </select>
          </div>
        )}

        <div className="cfg-row">
          <div className="left">
            <div className="title">Zona horaria</div>
            <div className="sub">America/Bogota (UTC -5)</div>
          </div>
        </div>

        <div className="cfg-row">
          <div className="left">
            <div className="title">Idioma de la interfaz</div>
            <div className="sub">Espanol (Colombia)</div>
          </div>
        </div>

        <div className="cfg-row">
          <div className="left">
            <div className="title">Formato de moneda</div>
            <div className="sub" style={{ fontFamily: 'var(--font-mono)' }}>$ 142.500 (COP, sin decimales, punto como separador de miles)</div>
          </div>
        </div>
      </div>

      <div className="cfg-section">
        <h3>Datos y exportacion</h3>
        <div className="cfg-row">
          <div className="left">
            <div className="title">Exportar mis datos</div>
            <div className="sub">Descargue una copia de su informacion personal segun el articulo 8 de la Ley 1581 de 2012.</div>
          </div>
          {/* mock — no backend endpoint yet */}
          <button className="lo-btn lo-btn-secondary lo-btn-sm" disabled title="Sin backend por ahora">
            <LIconDownload size={14} />Exportar
          </button>
        </div>
      </div>

      <div className="cfg-danger">
        <h4>Zona de riesgo</h4>
        <div className="body">Cerrar sesion en todos los dispositivos eliminara las sesiones activas y requerira volver a iniciar sesion.</div>
        {/* mock — no backend endpoint yet */}
        <button className="lo-btn lo-btn-danger lo-btn-sm" style={{ marginTop: 12 }} disabled title="Sin backend por ahora">
          <LIconLogout size={14} />Cerrar todas las sesiones
        </button>
      </div>
    </div>
  );
};

const MyDataSection: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    <div className="cfg-section">
      <h3>Mis datos personales</h3>
      <div className="desc">
        Segun la Ley 1581 de 2012, usted tiene derecho a conocer, actualizar, rectificar y solicitar la eliminacion de sus datos.
      </div>

      <div className="cfg-row">
        <div className="left">
          <div className="title">Solicitar eliminacion de mis datos</div>
          <div className="sub">Enviar una solicitud formal de supresion de sus datos personales del sistema.</div>
        </div>
        {/* mock — no backend endpoint yet; redirects user to Privacidad surface */}
        <button className="lo-btn lo-btn-danger lo-btn-sm" disabled title="Use la seccion Privacidad para gestionar solicitudes">
          <LIconTrash size={14} />Solicitar eliminacion
        </button>
      </div>

      <div className="cfg-row">
        <div className="left">
          <div className="title">Descargar mis datos</div>
          <div className="sub">Reciba un archivo con todos los datos que el sistema almacena sobre usted.</div>
        </div>
        {/* mock — no backend endpoint yet */}
        <button className="lo-btn lo-btn-secondary lo-btn-sm" disabled title="Sin backend por ahora">
          <LIconDownload size={14} />Descargar
        </button>
      </div>

      <div className="cfg-row">
        <div className="left">
          <div className="title">Revocar consentimiento</div>
          <div className="sub">Revocar la autorizacion de tratamiento de datos personales. Esta accion puede limitar el uso de la plataforma.</div>
        </div>
        {/* mock — no backend endpoint yet */}
        <button className="lo-btn lo-btn-ghost lo-btn-sm" style={{ color: 'var(--danger)' }} disabled title="Sin backend por ahora">
          Revocar
        </button>
      </div>
    </div>
  </div>
);

// ---- Settings nav ----

interface CfgNavProps { active: NavKey; onNav: (k: NavKey) => void; }
const CfgNav: React.FC<CfgNavProps> = ({ active, onNav }) => (
  <nav className="cfg-nav">
    {NAV_ITEMS.map((it) => (
      <div
        key={it.k}
        className={`cfg-nav-item ${active === it.k ? 'active' : ''}`}
        onClick={() => onNav(it.k)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onNav(it.k)}
      >
        {it.icon}{it.label}
      </div>
    ))}
  </nav>
);

// ---- Main page ----

const SECTION_MAP: Record<NavKey, React.ReactNode> = {
  perfil:         <ProfileSection />,
  notificaciones: <NotificationsSection />,
  sistema:        <SystemSection />,
  datos:          <MyDataSection />,
};

const ConfiguracionPage: React.FC = () => {
  const [activeNav, setActiveNav] = useState<NavKey>('perfil');

  return (
    <div className="lo-content">
      {/* Topbar */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Configuracion</h2>
      </div>

      {/* Two-column layout: nav + content */}
      <div className="cfg-layout">
        <CfgNav active={activeNav} onNav={setActiveNav} />
        <div>{SECTION_MAP[activeNav]}</div>
      </div>
    </div>
  );
};

export default ConfiguracionPage;

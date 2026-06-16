import React, { useEffect, useState } from 'react';
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
import type { Configuracion, Notificaciones, Sistema } from '../../shared/domain';
import { httpConfiguracionPort } from '../../shared/adapters/http';

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

// ---- Profile section ----

interface ProfileSectionProps { config: Configuracion; }
const ProfileSection: React.FC<ProfileSectionProps> = ({ config }) => {
  const { perfil } = config;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="cfg-section">
        <div className="cfg-profile-head">
          <div className="cfg-avatar-xl">{perfil.iniciales}</div>
          <div>
            <div className="name">{perfil.nombre}</div>
            <div className="sub">{perfil.rol} · {perfil.email}</div>
          </div>
          <button className="lo-btn lo-btn-secondary lo-btn-sm" style={{ marginLeft: 'auto' }} disabled title="Edicion de perfil no disponible aun">
            <LIconEdit size={14} />Editar
          </button>
        </div>
      </div>

      <div className="cfg-section">
        <h3>Informacion personal</h3>
        <div className="lo-field">
          <div className="lo-field-label">Nombre completo</div>
          <input value={perfil.nombre} readOnly />
        </div>
        <div className="lo-field">
          <div className="lo-field-label">Correo electronico</div>
          <input value={perfil.email} readOnly />
        </div>
        <div className="lo-field">
          <div className="lo-field-label">Telefono</div>
          <input value={perfil.telefono} readOnly />
        </div>
        <div className="lo-field">
          <div className="lo-field-label">Rol</div>
          <input value={perfil.rol} readOnly style={{ color: 'var(--fg-3)' }} />
        </div>
      </div>
    </div>
  );
};

// ---- Notifications section ----

interface NotificationsSectionProps {
  notifs: Notificaciones;
  onToggle: (key: keyof Notificaciones) => void;
}

const NotificationsSection: React.FC<NotificationsSectionProps> = ({ notifs, onToggle }) => {
  const rows: { k: keyof Notificaciones; title: string; sub: string }[] = [
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
          <Toggle on={notifs[r.k]} onChange={() => onToggle(r.k)} />
        </div>
      ))}
    </div>
  );
};

// ---- System section ----

interface SystemSectionProps {
  sistema: Sistema;
  onToggleAutoRefresh: (next: boolean) => void;
  onChangeInterval: (val: string) => void;
}

const SystemSection: React.FC<SystemSectionProps> = ({ sistema, onToggleAutoRefresh, onChangeInterval }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    <div className="cfg-section">
      <h3>Sistema</h3>

      <div className="cfg-row">
        <div className="left">
          <div className="title">Actualizacion automatica del tablero</div>
          <div className="sub">Los indicadores del panel de operacion se refrescan periodicamente.</div>
        </div>
        <Toggle on={sistema.autoRefresh} onChange={onToggleAutoRefresh} />
      </div>

      {sistema.autoRefresh && (
        <div className="lo-field" style={{ maxWidth: 200 }}>
          <div className="lo-field-label">Intervalo de actualizacion</div>
          <select value={sistema.refreshInterval} onChange={(e) => onChangeInterval(e.target.value)}>
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
        <button className="lo-btn lo-btn-secondary lo-btn-sm" disabled title="Sin backend por ahora">
          <LIconDownload size={14} />Exportar
        </button>
      </div>
    </div>

    <div className="cfg-danger">
      <h4>Zona de riesgo</h4>
      <div className="body">Cerrar sesion en todos los dispositivos eliminara las sesiones activas y requerira volver a iniciar sesion.</div>
      <button className="lo-btn lo-btn-danger lo-btn-sm" style={{ marginTop: 12 }} disabled title="Sin backend por ahora">
        <LIconLogout size={14} />Cerrar todas las sesiones
      </button>
    </div>
  </div>
);

// ---- My data section (no backend yet) ----

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
        <button className="lo-btn lo-btn-danger lo-btn-sm" disabled title="Use la seccion Privacidad para gestionar solicitudes">
          <LIconTrash size={14} />Solicitar eliminacion
        </button>
      </div>

      <div className="cfg-row">
        <div className="left">
          <div className="title">Descargar mis datos</div>
          <div className="sub">Reciba un archivo con todos los datos que el sistema almacena sobre usted.</div>
        </div>
        <button className="lo-btn lo-btn-secondary lo-btn-sm" disabled title="Sin backend por ahora">
          <LIconDownload size={14} />Descargar
        </button>
      </div>

      <div className="cfg-row">
        <div className="left">
          <div className="title">Revocar consentimiento</div>
          <div className="sub">Revocar la autorizacion de tratamiento de datos personales. Esta accion puede limitar el uso de la plataforma.</div>
        </div>
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

const port = httpConfiguracionPort();

const ConfiguracionPage: React.FC = () => {
  const [activeNav, setActiveNav] = useState<NavKey>('perfil');
  const [config, setConfig] = useState<Configuracion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    port.obtener()
      .then(setConfig)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleNotifToggle = (key: keyof Notificaciones) => {
    if (!config) return;
    const next = !config.notificaciones[key];
    // Optimistic update
    setConfig({ ...config, notificaciones: { ...config.notificaciones, [key]: next } });
    port.actualizar({ notificaciones: { [key]: next } })
      .then(setConfig)
      .catch(console.error);
  };

  const handleAutoRefreshToggle = (next: boolean) => {
    if (!config) return;
    setConfig({ ...config, sistema: { ...config.sistema, autoRefresh: next } });
    port.actualizar({ sistema: { autoRefresh: next } })
      .then(setConfig)
      .catch(console.error);
  };

  const handleIntervalChange = (val: string) => {
    if (!config) return;
    setConfig({ ...config, sistema: { ...config.sistema, refreshInterval: val } });
    port.actualizar({ sistema: { refreshInterval: val } })
      .then(setConfig)
      .catch(console.error);
  };

  if (loading || !config) {
    return (
      <div className="lo-content">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0 }}>Configuracion</h2>
        </div>
        <div style={{ color: 'var(--fg-3)' }}>Cargando...</div>
      </div>
    );
  }

  const sectionMap: Record<NavKey, React.ReactNode> = {
    perfil: <ProfileSection config={config} />,
    notificaciones: (
      <NotificationsSection
        notifs={config.notificaciones}
        onToggle={handleNotifToggle}
      />
    ),
    sistema: (
      <SystemSection
        sistema={config.sistema}
        onToggleAutoRefresh={handleAutoRefreshToggle}
        onChangeInterval={handleIntervalChange}
      />
    ),
    datos: <MyDataSection />,
  };

  return (
    <div className="lo-content">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Configuracion</h2>
      </div>

      <div className="cfg-layout">
        <CfgNav active={activeNav} onNav={setActiveNav} />
        <div>{sectionMap[activeNav]}</div>
      </div>
    </div>
  );
};

export default ConfiguracionPage;

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LIconGauge, LIconInbox, LIconBox, LIconMap, LIconUsers,
  LIconShield, LIconSettings, LIconRefresh,
} from './Icons';

interface AppSidebarProps {
  user?: { initials: string; name: string; role: string };
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  user = { initials: 'SR', name: 'Sara Restrepo', role: 'Asistente de pedidos' },
}) => {
  const opItems = [
    { key: 'operacion', path: '/operacion', icon: <LIconGauge />, label: 'Resumen' },
    { key: 'pedidos',   path: '/pedidos',   icon: <LIconInbox />, label: 'Pedidos' },
    { key: 'inventario',path: '/inventario',icon: <LIconBox />,   label: 'Inventario' },
    { key: 'ruta',      path: '/ruta',      icon: <LIconMap />,   label: 'Rutas' },
    { key: 'clientes',  path: '/clientes',  icon: <LIconUsers />, label: 'Clientes' },
  ];
  const adminItems = [
    { key: 'privacidad',    path: '/privacidad',    icon: <LIconShield />,   label: 'Privacidad' },
    { key: 'configuracion', path: '/configuracion', icon: <LIconSettings />, label: 'Configuración' },
  ];

  return (
    <aside className="lo-sidebar">
      <div className="lo-brand">
        <div className="mark">L</div>
        <div className="name">LácteoOp</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="lo-nav-section">Operación</div>
        <nav className="lo-nav">
          {opItems.map((it) => (
            <NavLink
              key={it.key}
              to={it.path}
              className={({ isActive }) => `lo-nav-item${isActive ? ' active' : ''}`}
            >
              <span className="ic">{it.icon}</span>{it.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="lo-nav-section">Administración</div>
        <nav className="lo-nav">
          {adminItems.map((it) => (
            <NavLink
              key={it.key}
              to={it.path}
              className={({ isActive }) => `lo-nav-item${isActive ? ' active' : ''}`}
            >
              <span className="ic">{it.icon}</span>{it.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="lo-sidebar-footer">
        <div className="lo-avatar">{user.initials}</div>
        <div>
          <div className="lo-user-name">{user.name}</div>
          <div className="lo-user-role">{user.role}</div>
        </div>
      </div>
    </aside>
  );
};

interface AppTopBarProps {
  title: string;
  children?: React.ReactNode;
  lastSync?: string;
  onRefresh?: () => void;
}

export const AppTopBar: React.FC<AppTopBarProps> = ({ title, children, lastSync, onRefresh }) => (
  <header className="lo-topbar">
    <h1>{title}</h1>
    <div className="right">
      {children}
      {lastSync && (
        <span className="lo-sync"><span className="dot" />Sincronizado · {lastSync}</span>
      )}
      {onRefresh && (
        <button className="lo-refresh-btn" onClick={onRefresh}>
          <LIconRefresh size={14} />Actualizar
        </button>
      )}
    </div>
  </header>
);

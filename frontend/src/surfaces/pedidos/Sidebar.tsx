import React from 'react';
import { NavLink } from 'react-router-dom';
import { IconGauge, IconInbox, IconBox, IconMap, IconUsers, IconShield, IconSettings } from './PedidosIcons';

export const Sidebar: React.FC = () => {
  const items = [
    { key: 'operacion', path: '/operacion', icon: <IconGauge />, label: 'Resumen' },
    { key: 'pedidos',   path: '/pedidos',   icon: <IconInbox />, label: 'Pedidos' },
    { key: 'inventario',path: '/inventario',icon: <IconBox />,   label: 'Inventario' },
    { key: 'ruta',      path: '/ruta',      icon: <IconMap />,   label: 'Rutas' },
    { key: 'clientes',  path: '/clientes',  icon: <IconUsers />, label: 'Clientes' },
  ];
  return (
    <aside className="sidebar">
      <div className="brand-row">
        <div className="mark">L</div>
        <div className="name">LácteoOp</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="nav-section-label">Operación</div>
        <nav className="nav">
          {items.map((it) => (
            <NavLink
              key={it.key}
              to={it.path}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <span className="ic">{it.icon}</span>{it.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="nav-section-label">Administración</div>
        <nav className="nav">
          <NavLink to="/privacidad" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <span className="ic"><IconShield /></span>Privacidad
          </NavLink>
          <NavLink to="/configuracion" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <span className="ic"><IconSettings /></span>Configuración
          </NavLink>
        </nav>
      </div>
      <div className="sidebar-footer">
        <div className="avatar">SR</div>
        <div>
          <div className="user-name">Sara Restrepo</div>
          <div className="user-role">Asistente de pedidos</div>
        </div>
      </div>
    </aside>
  );
};

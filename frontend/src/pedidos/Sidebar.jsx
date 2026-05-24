// Sidebar — left navigation. Static visual structure with one active item.
function Sidebar({ active = 'pedidos', onNav = () => {} }) {
  const items = [
    { key: 'dash',     icon: <IconGauge />,  label: 'Resumen' },
    { key: 'pedidos',  icon: <IconInbox />,  label: 'Pedidos' },
    { key: 'inv',      icon: <IconBox />,    label: 'Inventario' },
    { key: 'ruta',     icon: <IconMap />,    label: 'Rutas' },
    { key: 'clientes', icon: <IconUsers />,  label: 'Clientes' },
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
          {items.map(it => (
            <div key={it.key}
                 className={`nav-item ${active === it.key ? 'active' : ''}`}
                 onClick={() => onNav(it.key)}>
              <span className="ic">{it.icon}</span>
              {it.label}
            </div>
          ))}
        </nav>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="nav-section-label">Administración</div>
        <nav className="nav">
          <div className="nav-item"><span className="ic"><IconShield /></span>Privacidad</div>
          <div className="nav-item"><span className="ic"><IconSettings /></span>Configuración</div>
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
}
window.Sidebar = Sidebar;

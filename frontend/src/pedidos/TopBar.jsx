// TopBar — page title + sync state + manual refresh
function TopBar({ title, lastSync = 'hace 12 segundos', onRefresh }) {
  return (
    <header className="topbar">
      <h1>{title}</h1>
      <div className="meta">
        <span><span className="sync-dot"></span>Sincronizado · {lastSync}</span>
        <button className="refresh-btn" onClick={onRefresh}>
          <IconRefresh size={14} />
          Actualizar
        </button>
      </div>
    </header>
  );
}
window.TopBar = TopBar;

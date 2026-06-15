import React from 'react';
import { IconRefresh } from './PedidosIcons';

interface TopBarProps {
  title: string;
  lastSync?: string;
  onRefresh?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ title, lastSync = 'hace 12 segundos', onRefresh }) => (
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

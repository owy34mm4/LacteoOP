import React from 'react';
import { LIconShield, LIconFileText } from './Icons';

interface PrivacyNoticeBannerProps {
  onAccept: () => void;
  onViewPolicy: () => void;
}

export const PrivacyNoticeBanner: React.FC<PrivacyNoticeBannerProps> = ({ onAccept, onViewPolicy }) => (
  <div className="priv-banner">
    <div className="icon-circle"><LIconShield size={22} /></div>
    <div>
      <div className="title">Proteccion de datos personales</div>
      <div className="body">
        Esta plataforma recopila y almacena datos personales de clientes (nombre, telefono, direccion, correo
        electronico) de conformidad con la Ley 1581 de 2012. Los datos se usan exclusivamente para la gestion
        de pedidos y entregas.
      </div>
      <div className="legal">Ley 1581 de 2012 · Habeas Data · Responsable: Distribuidora Lacteos del Valle S.A.S.</div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <button className="lo-btn lo-btn-primary lo-btn-sm" onClick={onAccept}>Aceptar</button>
      <button className="lo-btn lo-btn-secondary lo-btn-sm" onClick={onViewPolicy}>
        <LIconFileText size={14} />Ver politica completa
      </button>
    </div>
  </div>
);

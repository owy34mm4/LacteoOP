import React from 'react';
import { Modal } from './Modal';
import { LIconShield } from './Icons';

interface DataConsentModalProps {
  open: boolean;
  onClose: () => void;
  onConsent: () => void;
  clientName?: string;
}

export const DataConsentModal: React.FC<DataConsentModalProps> = ({
  open, onClose, onConsent, clientName,
}) => (
  <Modal
    open={open}
    onClose={onClose}
    size="md"
    icon={<LIconShield size={20} />}
    iconVariant="info"
    title="Autorizacion de tratamiento de datos"
    subtitle={clientName ? `Cliente: ${clientName}` : undefined}
    footer={
      <>
        <button className="lo-btn lo-btn-secondary" onClick={onClose}>Cancelar</button>
        <button className="lo-btn lo-btn-primary" onClick={onConsent}>Autorizo el tratamiento</button>
      </>
    }
  >
    <p style={{ fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.6, margin: 0 }}>
      De conformidad con la <strong>Ley 1581 de 2012</strong> sobre proteccion de datos personales,
      se solicita su autorizacion para recopilar y tratar los siguientes datos personales:
      nombre, telefono, direccion y correo electronico.
    </p>
    <ul style={{ fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.7, marginTop: 10, paddingLeft: 18 }}>
      <li>Los datos se usan exclusivamente para gestion de pedidos y entregas.</li>
      <li>Puede revocar esta autorizacion en cualquier momento desde Configuracion.</li>
      <li>Responsable: Distribuidora Lacteos del Valle S.A.S.</li>
    </ul>
  </Modal>
);

import React, { useState } from 'react';
import { Modal } from './Modal';
import { LIconTrash } from './Icons';

interface DataDeletionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  clientName?: string;
}

export const DataDeletionForm: React.FC<DataDeletionFormProps> = ({
  open, onClose, onSubmit, clientName,
}) => {
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (reason.trim()) {
      onSubmit(reason.trim());
      setReason('');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      variant="danger"
      icon={<LIconTrash size={20} />}
      iconVariant="danger"
      title="Solicitar eliminacion de datos"
      subtitle={clientName ? `Cliente: ${clientName}` : 'Mis datos personales'}
      footer={
        <>
          <button className="lo-btn lo-btn-secondary" onClick={onClose}>Cancelar</button>
          <button
            className="lo-btn lo-btn-danger"
            onClick={handleSubmit}
            disabled={!reason.trim()}
          >
            Enviar solicitud
          </button>
        </>
      }
    >
      <p style={{ fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.6, margin: '0 0 12px' }}>
        Segun el articulo 8 de la <strong>Ley 1581 de 2012</strong>, usted tiene derecho a solicitar
        la eliminacion de sus datos personales del sistema.
      </p>
      <div className="lo-field">
        <div className="lo-field-label">Motivo de la solicitud</div>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Describa el motivo de su solicitud de eliminacion..."
          style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit', fontSize: 13 }}
        />
      </div>
    </Modal>
  );
};

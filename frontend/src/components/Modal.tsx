import React from 'react';
import { LIconClose } from './Icons';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'danger';
  icon?: React.ReactNode;
  iconVariant?: 'default' | 'danger' | 'warning' | 'info';
  title: string;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  footerAlign?: 'end' | 'spread' | 'stack';
  closable?: boolean;
  divider?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  size = 'md',
  variant = 'default',
  icon,
  iconVariant = 'default',
  title,
  subtitle,
  children,
  footer,
  footerAlign = 'end',
  closable = true,
  divider = false,
}) => {
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const alignCls = footerAlign === 'spread' ? 'spread' : footerAlign === 'stack' ? 'stack' : '';

  return (
    <div className="lo-modal-backdrop" onClick={onClose}>
      <div
        className={`lo-modal sz-${size} ${variant === 'danger' ? 'variant-danger' : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lo-modal-title"
      >
        <div className="lo-modal-header">
          {icon && <div className={`lo-modal-icon ${iconVariant}`}>{icon}</div>}
          <div className="lo-modal-titles">
            <h3 id="lo-modal-title">{title}</h3>
            {subtitle && <div className="subtitle">{subtitle}</div>}
          </div>
          {closable && (
            <button className="lo-modal-close" onClick={onClose} aria-label="Cerrar">
              <LIconClose size={18} />
            </button>
          )}
        </div>
        {children && <div className="lo-modal-body">{children}</div>}
        {divider && <div className="lo-modal-divider" />}
        {footer && <div className={`lo-modal-footer ${alignCls}`}>{footer}</div>}
      </div>
    </div>
  );
};

interface SummaryRow {
  label: string;
  value: React.ReactNode;
  total?: boolean;
}

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  iconVariant?: 'default' | 'danger' | 'warning' | 'info';
  variant?: 'default' | 'danger';
  summaryRows?: SummaryRow[];
  confirmLabel?: string;
  cancelLabel?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open, onClose, onConfirm, title, subtitle, icon, iconVariant = 'default',
  variant = 'default', summaryRows, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', size = 'md',
}) => (
  <Modal open={open} onClose={onClose} size={size} variant={variant}
         icon={icon} iconVariant={iconVariant} title={title} subtitle={subtitle}
         footer={
           <>
             <button className="lo-btn lo-btn-secondary" onClick={onClose}>{cancelLabel}</button>
             <button className={`lo-btn ${variant === 'danger' ? 'lo-btn-danger' : 'lo-btn-primary'}`} onClick={onConfirm}>{confirmLabel}</button>
           </>
         }>
    {summaryRows && (
      <div className="lo-modal-summary">
        {summaryRows.map((r, i) => (
          <div key={i} className={`row ${r.total ? 'total' : ''}`}>
            <span className="l">{r.label}</span>
            <span className="r">{r.value}</span>
          </div>
        ))}
      </div>
    )}
  </Modal>
);

import React from 'react';

interface ProtectedDataLabelProps {
  className?: string;
}

export const ProtectedDataLabel: React.FC<ProtectedDataLabelProps> = ({ className }) => (
  <span className={`lo-protected${className ? ` ${className}` : ''}`}>
    Dato protegido
  </span>
);

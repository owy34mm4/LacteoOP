import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '../../src/components/Modal';

describe('Modal', () => {
  it('renders nothing when open=false', () => {
    const { container } = render(
      <Modal open={false} onClose={() => {}} title="Test" />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders title when open=true', () => {
    render(<Modal open={true} onClose={() => {}} title="Confirmar pedido" />);
    expect(screen.getByText('Confirmar pedido')).toBeInTheDocument();
  });

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    render(<Modal open={true} onClose={onClose} title="Test" />);
    const backdrop = document.querySelector('.lo-modal-backdrop')!;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not call onClose when modal content is clicked', () => {
    const onClose = vi.fn();
    render(<Modal open={true} onClose={onClose} title="Test" />);
    const modal = document.querySelector('.lo-modal')!;
    fireEvent.click(modal);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders footer when provided', () => {
    render(
      <Modal open={true} onClose={() => {}} title="T"
             footer={<button>OK</button>} />
    );
    expect(screen.getByText('OK')).toBeInTheDocument();
  });
});

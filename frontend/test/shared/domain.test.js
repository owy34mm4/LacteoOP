/**
 * Unit tests for frontend/src/shared/domain.js
 *
 * Imports the file for side-effects (it attaches to window.LacteoOp)
 * then asserts on the exported globals.
 */
import { describe, it, expect } from 'vitest';
import '../../src/shared/domain.js';

const L = window.LacteoOp;

// ---------------------------------------------------------------------------
// Enum value objects
// ---------------------------------------------------------------------------

describe('EstadoPedido', () => {
  it('is frozen', () => {
    expect(Object.isFrozen(L.EstadoPedido)).toBe(true);
  });

  it('has correct values', () => {
    expect(L.EstadoPedido.RECIBIDO).toBe('recibido');
    expect(L.EstadoPedido.ALISTANDO).toBe('alistando');
    expect(L.EstadoPedido.ENRUTA).toBe('enruta');
    expect(L.EstadoPedido.ENTREGADO).toBe('entregado');
    expect(L.EstadoPedido.DEVUELTO).toBe('devuelto');
  });
});

describe('EstadoParada', () => {
  it('is frozen', () => {
    expect(Object.isFrozen(L.EstadoParada)).toBe(true);
  });

  it('has correct values', () => {
    expect(L.EstadoParada.PENDING).toBe('pending');
    expect(L.EstadoParada.ACTIVE).toBe('active');
    expect(L.EstadoParada.DONE).toBe('done');
    expect(L.EstadoParada.PROBLEM).toBe('problem');
  });
});

describe('TipoAlerta', () => {
  it('is frozen', () => {
    expect(Object.isFrozen(L.TipoAlerta)).toBe(true);
  });

  it('has correct values', () => {
    expect(L.TipoAlerta.DANGER).toBe('danger');
    expect(L.TipoAlerta.WARN).toBe('warn');
  });
});

// ---------------------------------------------------------------------------
// Entity factories
// ---------------------------------------------------------------------------

describe('crearPedido', () => {
  it('returns a frozen object', () => {
    const p = L.crearPedido({ id: '1', time: '10:00', client: 'A', items: 2, address: 'Calle', amount: 1000, state: 'recibido' });
    expect(Object.isFrozen(p)).toBe(true);
  });

  it('maps all fields', () => {
    const p = L.crearPedido({ id: '42', time: '09:00', client: 'Ana', items: 3, address: 'Av 1', amount: 2500, state: 'enruta' });
    expect(p.id).toBe('42');
    expect(p.amount).toBe(2500);
    expect(p.state).toBe('enruta');
  });
});

describe('crearParada', () => {
  it('returns a frozen object', () => {
    const p = L.crearParada({ id: 'p1', num: 1, client: 'A', addr: 'B', items: 2, amount: 500, eta: '10:00', label: 'L', status: 'pending' });
    expect(Object.isFrozen(p)).toBe(true);
  });

  it('defaults receivedBy to null when omitted', () => {
    const p = L.crearParada({ id: 'p1', num: 1, client: 'A', addr: 'B', items: 2, amount: 500, eta: '10:00', label: 'L', status: 'pending' });
    expect(p.receivedBy).toBeNull();
  });

  it('keeps receivedBy when provided', () => {
    const p = L.crearParada({ id: 'p1', num: 1, client: 'A', addr: 'B', items: 2, amount: 500, eta: '10:00', label: 'L', status: 'done', receivedBy: 'Maria' });
    expect(p.receivedBy).toBe('Maria');
  });
});

describe('crearConductor', () => {
  it('returns a frozen object', () => {
    const c = L.crearConductor({ id: 'c1', name: 'Juan', initials: 'JR', zone: 'Norte', done: 3, total: 10 });
    expect(Object.isFrozen(c)).toBe(true);
  });
});

describe('crearAlerta', () => {
  it('returns a frozen object', () => {
    const a = L.crearAlerta({ id: 'a1', kind: 'warn', title: 'T', sub: 'S', when: '10:00' });
    expect(Object.isFrozen(a)).toBe(true);
  });
});

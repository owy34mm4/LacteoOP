import { describe, it, expect } from 'vitest';
import {
  EstadoPedido, EstadoParada, TipoAlerta,
  crearPedido, crearParada, crearConductor, crearAlerta,
} from '../../src/shared/domain';

describe('EstadoPedido', () => {
  it('is frozen', () => {
    expect(Object.isFrozen(EstadoPedido)).toBe(true);
  });
  it('has correct values', () => {
    expect(EstadoPedido.RECIBIDO).toBe('recibido');
    expect(EstadoPedido.ALISTANDO).toBe('alistando');
    expect(EstadoPedido.ENRUTA).toBe('enruta');
    expect(EstadoPedido.ENTREGADO).toBe('entregado');
    expect(EstadoPedido.DEVUELTO).toBe('devuelto');
  });
});

describe('EstadoParada', () => {
  it('is frozen', () => { expect(Object.isFrozen(EstadoParada)).toBe(true); });
  it('has correct values', () => {
    expect(EstadoParada.PENDING).toBe('pending');
    expect(EstadoParada.ACTIVE).toBe('active');
    expect(EstadoParada.DONE).toBe('done');
    expect(EstadoParada.PROBLEM).toBe('problem');
  });
});

describe('TipoAlerta', () => {
  it('is frozen', () => { expect(Object.isFrozen(TipoAlerta)).toBe(true); });
  it('has correct values', () => {
    expect(TipoAlerta.DANGER).toBe('danger');
    expect(TipoAlerta.WARN).toBe('warn');
  });
});

describe('crearPedido', () => {
  it('returns a frozen object', () => {
    const p = crearPedido({ id: '1', time: '10:00', client: 'A', items: 2, address: 'Calle', amount: 1000, state: 'recibido' });
    expect(Object.isFrozen(p)).toBe(true);
  });
  it('maps all fields', () => {
    const p = crearPedido({ id: '42', time: '09:00', client: 'Ana', items: 3, address: 'Av 1', amount: 2500, state: 'enruta' });
    expect(p.id).toBe('42');
    expect(p.amount).toBe(2500);
    expect(p.state).toBe('enruta');
  });
});

describe('crearParada', () => {
  it('returns a frozen object', () => {
    const p = crearParada({ id: 'p1', num: 1, client: 'A', addr: 'B', items: 2, amount: 500, eta: '10:00', label: 'L', status: 'pending' });
    expect(Object.isFrozen(p)).toBe(true);
  });
  it('defaults receivedBy to null when omitted', () => {
    const p = crearParada({ id: 'p1', num: 1, client: 'A', addr: 'B', items: 2, amount: 500, eta: '10:00', label: 'L', status: 'pending' });
    expect(p.receivedBy).toBeNull();
  });
  it('keeps receivedBy when provided', () => {
    const p = crearParada({ id: 'p1', num: 1, client: 'A', addr: 'B', items: 2, amount: 500, eta: '10:00', label: 'L', status: 'done', receivedBy: 'Maria' });
    expect(p.receivedBy).toBe('Maria');
  });
});

describe('crearConductor', () => {
  it('returns a frozen object', () => {
    const c = crearConductor({ id: 'c1', name: 'Juan', initials: 'JR', zone: 'Norte', done: 3, total: 10 });
    expect(Object.isFrozen(c)).toBe(true);
  });
});

describe('crearAlerta', () => {
  it('returns a frozen object', () => {
    const a = crearAlerta({ id: 'a1', kind: 'warn', title: 'T', sub: 'S', when: '10:00' });
    expect(Object.isFrozen(a)).toBe(true);
  });
});

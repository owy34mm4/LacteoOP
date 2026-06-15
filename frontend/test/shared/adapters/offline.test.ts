import { vi, describe, it, expect, beforeEach } from 'vitest';
import { offlineParadaPort } from '../../../src/shared/adapters/offline';
import type { ParadaPort } from '../../../src/shared/ports';
import type { Parada } from '../../../src/shared/domain';

const CACHE_KEY = 'lacteoop_paradas';
const QUEUE_KEY = 'lacteoop_sync_queue';

function makeParada(id: string, status: Parada['status'] = 'pending', num = 1): Parada {
  return { id, num, client: 'C', addr: 'A', items: 1, amount: 100, eta: '10:00', label: 'L', status, receivedBy: null };
}

function makeFakeHttpPort(overrides: Partial<ParadaPort> = {}): ParadaPort {
  return {
    listar: vi.fn().mockResolvedValue([]),
    marcarEntrega: vi.fn().mockResolvedValue({}),
    reportarProblema: vi.fn().mockResolvedValue({}),
    sincronizar: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

beforeEach(() => {
  localStorage.clear();
});

describe('offline ParadaPort.listar', () => {
  it('caches result to localStorage on success', async () => {
    const paradas = [makeParada('p1', 'active', 1)];
    const port = offlineParadaPort(makeFakeHttpPort({ listar: vi.fn().mockResolvedValue(paradas) }));
    await port.listar();
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY)!);
    expect(cached).toEqual(paradas);
  });

  it('returns http data on success', async () => {
    const paradas = [makeParada('p1', 'active', 1)];
    const port = offlineParadaPort(makeFakeHttpPort({ listar: vi.fn().mockResolvedValue(paradas) }));
    const result = await port.listar();
    expect(result).toEqual(paradas);
  });

  it('returns cached data when http fails', async () => {
    const cached = [makeParada('p1', 'done', 1)];
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
    const port = offlineParadaPort(makeFakeHttpPort({ listar: vi.fn().mockRejectedValue(new Error('Network error')) }));
    const result = await port.listar();
    expect(result).toEqual(cached);
  });

  it('throws when http fails and no cache exists', async () => {
    const port = offlineParadaPort(makeFakeHttpPort({ listar: vi.fn().mockRejectedValue(new Error('Offline')) }));
    await expect(port.listar()).rejects.toThrow('No cached data available offline');
  });
});

describe('offline ParadaPort.marcarEntrega — success path', () => {
  it('updates cache: marks parada as done', async () => {
    const paradas = [makeParada('p1', 'active', 1), makeParada('p2', 'pending', 2)];
    localStorage.setItem(CACHE_KEY, JSON.stringify(paradas));
    const port = offlineParadaPort(makeFakeHttpPort({ marcarEntrega: vi.fn().mockResolvedValue({ id: 'p1', status: 'done' }) }));
    await port.marcarEntrega('p1', 'Juan');
    const updated: Parada[] = JSON.parse(localStorage.getItem(CACHE_KEY)!);
    const p1 = updated.find((p) => p.id === 'p1')!;
    expect(p1.status).toBe('done');
    expect(p1.receivedBy).toBe('Juan');
  });

  it('advances next pending to active in cache', async () => {
    const paradas = [makeParada('p1', 'active', 1), makeParada('p2', 'pending', 2), makeParada('p3', 'pending', 3)];
    localStorage.setItem(CACHE_KEY, JSON.stringify(paradas));
    const port = offlineParadaPort(makeFakeHttpPort({ marcarEntrega: vi.fn().mockResolvedValue({ id: 'p1', status: 'done' }) }));
    await port.marcarEntrega('p1', 'Ana');
    const updated: Parada[] = JSON.parse(localStorage.getItem(CACHE_KEY)!);
    const p2 = updated.find((p) => p.id === 'p2')!;
    expect(p2.status).toBe('active');
  });
});

describe('offline ParadaPort.marcarEntrega — failure path', () => {
  it('enqueues action to sync queue', async () => {
    const paradas = [makeParada('p1', 'active', 1)];
    localStorage.setItem(CACHE_KEY, JSON.stringify(paradas));
    const port = offlineParadaPort(makeFakeHttpPort({ marcarEntrega: vi.fn().mockRejectedValue(new Error('Offline')) }));
    await port.marcarEntrega('p1', 'Carlos');
    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY)!);
    expect(queue).toHaveLength(1);
    expect(queue[0].action).toBe('entrega');
    expect(queue[0].id).toBe('p1');
    expect(queue[0].recibido_por).toBe('Carlos');
  });

  it('applies optimistic update to cache', async () => {
    const paradas = [makeParada('p1', 'active', 1), makeParada('p2', 'pending', 2)];
    localStorage.setItem(CACHE_KEY, JSON.stringify(paradas));
    const port = offlineParadaPort(makeFakeHttpPort({ marcarEntrega: vi.fn().mockRejectedValue(new Error('Offline')) }));
    const result = await port.marcarEntrega('p1', 'Carlos');
    expect(result.status).toBe('done');
    expect(result.receivedBy).toBe('Carlos');
    const cached: Parada[] = JSON.parse(localStorage.getItem(CACHE_KEY)!);
    expect(cached.find((p) => p.id === 'p1')!.status).toBe('done');
  });
});

describe('offline ParadaPort.hayPendientes', () => {
  it('returns false when queue is empty', () => {
    const port = offlineParadaPort(makeFakeHttpPort());
    expect(port.hayPendientes()).toBe(false);
  });

  it('returns true after a failed action enqueues', async () => {
    const paradas = [makeParada('p1', 'active', 1)];
    localStorage.setItem(CACHE_KEY, JSON.stringify(paradas));
    const port = offlineParadaPort(makeFakeHttpPort({ marcarEntrega: vi.fn().mockRejectedValue(new Error('Offline')) }));
    await port.marcarEntrega('p1', 'X');
    expect(port.hayPendientes()).toBe(true);
  });
});

describe('offline ParadaPort.sincronizar', () => {
  it('returns empty array when queue is empty', async () => {
    const port = offlineParadaPort(makeFakeHttpPort());
    expect(await port.sincronizar()).toEqual([]);
  });

  it('posts queue to http and clears it on success', async () => {
    const queue = [{ action: 'entrega', id: 'p1', recibido_por: 'X', timestamp: 1 }];
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    const syncResult = [makeParada('p1', 'done', 1)];
    const httpPort = makeFakeHttpPort({ sincronizar: vi.fn().mockResolvedValue(syncResult) });
    const port = offlineParadaPort(httpPort);
    const result = await port.sincronizar();
    expect(httpPort.sincronizar).toHaveBeenCalledWith(queue);
    expect(result).toEqual(syncResult);
    expect(localStorage.getItem(QUEUE_KEY)).toBeNull();
  });

  it('returns empty array and keeps queue when sync fails', async () => {
    const queue = [{ action: 'entrega', id: 'p1', recibido_por: 'X', timestamp: 1 }];
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    const port = offlineParadaPort(makeFakeHttpPort({ sincronizar: vi.fn().mockRejectedValue(new Error('Network')) }));
    const result = await port.sincronizar();
    expect(result).toEqual([]);
    const remaining = JSON.parse(localStorage.getItem(QUEUE_KEY)!);
    expect(remaining).toHaveLength(1);
  });
});

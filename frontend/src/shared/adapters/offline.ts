import type { ParadaPort, ConductorPort } from '../ports';
import type { Parada } from '../domain';

const CACHE_PARADAS = 'lacteoop_paradas';
const CACHE_CONDUCTORES = 'lacteoop_conductores';
const QUEUE_KEY = 'lacteoop_sync_queue';

type QueueAction =
  | { action: 'entrega'; id: string; recibido_por: string; timestamp: number }
  | { action: 'problema'; id: string; problema: string; timestamp: number };

const getQueue = (): QueueAction[] =>
  JSON.parse(localStorage.getItem(QUEUE_KEY) ?? '[]') as QueueAction[];

const saveQueue = (q: QueueAction[]): void =>
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));

const getCachedParadas = (): Parada[] | null => {
  const raw = localStorage.getItem(CACHE_PARADAS);
  return raw ? (JSON.parse(raw) as Parada[]) : null;
};

export const offlineParadaPort = (httpPort: ParadaPort): ParadaPort & { hayPendientes(): boolean } => ({
  listar: async () => {
    try {
      const data = await httpPort.listar();
      localStorage.setItem(CACHE_PARADAS, JSON.stringify(data));
      return data;
    } catch {
      const cached = getCachedParadas();
      if (cached) return cached;
      throw new Error('No cached data available offline');
    }
  },

  marcarEntrega: async (id, recibidoPor) => {
    try {
      const result = await httpPort.marcarEntrega(id, recibidoPor);
      const cached = getCachedParadas() ?? [];
      const updated = cached.map((p) =>
        p.id === id ? { ...p, status: 'done' as const, label: 'entregado', receivedBy: recibidoPor } : p
      );
      let foundDone = false;
      const advanced = updated.map((p) => {
        if (p.id === id) { foundDone = true; return p; }
        if (foundDone && p.status === 'pending') { foundDone = false; return { ...p, status: 'active' as const, label: 'próxima parada' }; }
        return p;
      });
      localStorage.setItem(CACHE_PARADAS, JSON.stringify(advanced));
      return result;
    } catch {
      const queue = getQueue();
      queue.push({ action: 'entrega', id, recibido_por: recibidoPor, timestamp: Date.now() });
      saveQueue(queue);
      const cached = getCachedParadas() ?? [];
      const updated = cached.map((p) =>
        p.id === id ? { ...p, status: 'done' as const, label: 'entregado', receivedBy: recibidoPor } : p
      );
      let foundDone = false;
      const advanced = updated.map((p) => {
        if (p.id === id) { foundDone = true; return p; }
        if (foundDone && p.status === 'pending') { foundDone = false; return { ...p, status: 'active' as const, label: 'próxima parada' }; }
        return p;
      });
      localStorage.setItem(CACHE_PARADAS, JSON.stringify(advanced));
      return advanced.find((p) => p.id === id)!;
    }
  },

  reportarProblema: async (id, problema) => {
    try {
      return await httpPort.reportarProblema(id, problema);
    } catch {
      const queue = getQueue();
      queue.push({ action: 'problema', id, problema, timestamp: Date.now() });
      saveQueue(queue);
      const cached = getCachedParadas() ?? [];
      const updated = cached.map((p) =>
        p.id === id ? { ...p, status: 'problem' as const, label: 'problema' } : p
      );
      localStorage.setItem(CACHE_PARADAS, JSON.stringify(updated));
      return updated.find((p) => p.id === id)!;
    }
  },

  sincronizar: async () => {
    const queue = getQueue();
    if (queue.length === 0) return [];
    try {
      const results = await httpPort.sincronizar(queue);
      localStorage.removeItem(QUEUE_KEY);
      if (results && results.length > 0) {
        localStorage.setItem(CACHE_PARADAS, JSON.stringify(results));
      }
      return results;
    } catch {
      return [];
    }
  },

  hayPendientes: () => getQueue().length > 0,
});

export const offlineConductorPort = (httpPort: ConductorPort): ConductorPort => ({
  listar: async () => {
    try {
      const data = await httpPort.listar();
      localStorage.setItem(CACHE_CONDUCTORES, JSON.stringify(data));
      return data;
    } catch {
      const cached = localStorage.getItem(CACHE_CONDUCTORES);
      return cached ? (JSON.parse(cached) as import('../domain').Conductor[]) : [];
    }
  },
});

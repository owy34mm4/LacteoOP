window.LacteoOp = window.LacteoOp || {};
window.LacteoOp.adapters = window.LacteoOp.adapters || {};

const CACHE_PARADAS = 'lacteoop_paradas';
const CACHE_CONDUCTORES = 'lacteoop_conductores';
const QUEUE_KEY = 'lacteoop_sync_queue';

window.LacteoOp.adapters.offline = {
  ParadaPort: (httpParadaPort) => {
    const getQueue = () => JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    const saveQueue = (q) => localStorage.setItem(QUEUE_KEY, JSON.stringify(q));

    const getCachedParadas = () => {
      const raw = localStorage.getItem(CACHE_PARADAS);
      return raw ? JSON.parse(raw) : null;
    };

    return {
      listar: async () => {
        try {
          const data = await httpParadaPort.listar();
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
          const result = await httpParadaPort.marcarEntrega(id, recibidoPor);
          // Update cache
          const cached = getCachedParadas() || [];
          const updated = cached.map(p => p.id === id ? { ...p, status: 'done', label: 'entregado', receivedBy: recibidoPor } : p);
          // Advance next pending to active
          let foundDone = false;
          const advanced = updated.map(p => {
            if (p.id === id) { foundDone = true; return p; }
            if (foundDone && p.status === 'pending') { foundDone = false; return { ...p, status: 'active', label: 'próxima parada' }; }
            return p;
          });
          localStorage.setItem(CACHE_PARADAS, JSON.stringify(advanced));
          return result;
        } catch {
          // Queue for later sync
          const queue = getQueue();
          queue.push({ action: 'entrega', id, recibido_por: recibidoPor, timestamp: Date.now() });
          saveQueue(queue);
          // Optimistic local update
          const cached = getCachedParadas() || [];
          const updated = cached.map(p => p.id === id ? { ...p, status: 'done', label: 'entregado', receivedBy: recibidoPor } : p);
          let foundDone = false;
          const advanced = updated.map(p => {
            if (p.id === id) { foundDone = true; return p; }
            if (foundDone && p.status === 'pending') { foundDone = false; return { ...p, status: 'active', label: 'próxima parada' }; }
            return p;
          });
          localStorage.setItem(CACHE_PARADAS, JSON.stringify(advanced));
          return advanced.find(p => p.id === id);
        }
      },

      reportarProblema: async (id, problema) => {
        try {
          return await httpParadaPort.reportarProblema(id, problema);
        } catch {
          const queue = getQueue();
          queue.push({ action: 'problema', id, problema, timestamp: Date.now() });
          saveQueue(queue);
          const cached = getCachedParadas() || [];
          const updated = cached.map(p => p.id === id ? { ...p, status: 'problem', label: 'problema', problem: problema } : p);
          localStorage.setItem(CACHE_PARADAS, JSON.stringify(updated));
          return updated.find(p => p.id === id);
        }
      },

      sincronizar: async () => {
        const queue = getQueue();
        if (queue.length === 0) return [];
        try {
          const results = await httpParadaPort.sincronizar(queue);
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
    };
  },

  ConductorPort: (httpConductorPort) => ({
    listar: async () => {
      try {
        const data = await httpConductorPort.listar();
        localStorage.setItem(CACHE_CONDUCTORES, JSON.stringify(data));
        return data;
      } catch {
        const cached = localStorage.getItem(CACHE_CONDUCTORES);
        return cached ? JSON.parse(cached) : [];
      }
    },
  }),
};

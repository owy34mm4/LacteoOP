import React from 'react';
import { TopBar } from './TopBar';
import { OrderListPanel } from './OrderList';
import { NewOrderForm } from './NewOrderForm';
import type { OrderDraft } from './NewOrderForm';
import { PedidosConfirmModal, Toast } from './ConfirmModal';
import { httpPedidoPort } from '../../shared/adapters/http';
import type { Pedido } from '../../shared/domain';
import type { Cliente, Producto } from '../../shared/ports';
import '../../styles/pedidos.css';

const port = httpPedidoPort();

const PedidosPage: React.FC = () => {
  const [orders, setOrders] = React.useState<Pedido[]>([]);
  const [clients, setClients] = React.useState<Cliente[]>([]);
  const [products, setProducts] = React.useState<Producto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState('');
  const [filter, setFilter] = React.useState('all');
  const [draft, setDraft] = React.useState<OrderDraft | null>(null);
  const [toast, setToast] = React.useState<string | null>(null);
  const [lastSync, setLastSync] = React.useState('ahora');

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [ordersData, clientsData, productsData] = await Promise.all([
        port.listar(),
        port.listarClientes(),
        port.listarProductos(),
      ]);
      setOrders(ordersData);
      setClients(clientsData);
      setProducts(productsData);
      setLastSync(new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Error loading pedidos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { void load(); }, [load]);

  const handleConfirm = async () => {
    if (!draft) return;
    try {
      // The outbound adapter maps this domain draft to the backend's request shape.
      const newOrder = await port.crear(draft);
      setOrders((prev) => [newOrder, ...prev]);
      setDraft(null);
      setToast(`Pedido #${newOrder.id} creado`);
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error('Error creating order:', err);
    }
  };

  return (
    <>
      <TopBar title="Pedidos" lastSync={lastSync} onRefresh={load} />
      <div className="workspace">
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--fg-3)' }}>Cargando pedidos…</div>
        ) : (
          <OrderListPanel
            orders={orders}
            selectedId={selectedId}
            onSelect={setSelectedId}
            query={query}
            setQuery={setQuery}
            filter={filter}
            setFilter={setFilter}
          />
        )}
        <NewOrderForm
          clients={clients}
          products={products}
          onConfirm={setDraft}
        />
      </div>
      <PedidosConfirmModal draft={draft} onCancel={() => setDraft(null)} onConfirm={() => { void handleConfirm(); }} />
      {toast && <Toast message={toast} />}
    </>
  );
};

export default PedidosPage;

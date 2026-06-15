import React, { useState } from 'react';
import '../../styles/inventario.css';
import {
  LIconBox,
  LIconPlus,
  LIconRefresh,
  LIconSearch,
} from '../../components/Icons';

// mock — no backend endpoint yet
const PRODUCTS = [
  { sku: 'L-ENT-1L',  name: 'Leche entera 1 L',           cat: 'Leches',    stock: 248, max: 400, unit: 'cajas',  price: 28800, expiry: 18, lot: 'LOT-5234' },
  { sku: 'L-DES-1L',  name: 'Leche deslactosada 1 L',      cat: 'Leches',    stock: 45,  max: 200, unit: 'cajas',  price: 32400, expiry: 12, lot: 'LOT-5235' },
  { sku: 'YOG-NAT',   name: 'Yogur natural 1 kg',          cat: 'Yogures',   stock: 124, max: 300, unit: 'uds',    price: 14500, expiry: 3,  lot: 'LOT-4821' },
  { sku: 'QUE-CAMP',  name: 'Queso campesino 500 g',       cat: 'Quesos',    stock: 0,   max: 150, unit: 'uds',    price: 18200, expiry: 8,  lot: 'LOT-5100' },
  { sku: 'MANT-250',  name: 'Mantequilla 250 g',           cat: 'Derivados', stock: 312, max: 400, unit: 'uds',    price: 9800,  expiry: 22, lot: 'LOT-5180' },
  { sku: 'ARQ-500',   name: 'Arequipe 500 g',              cat: 'Derivados', stock: 67,  max: 200, unit: 'uds',    price: 12400, expiry: 15, lot: 'LOT-5201' },
  { sku: 'YOG-FRU',   name: 'Yogur de frutas 150 g (x6)',  cat: 'Yogures',   stock: 88,  max: 250, unit: 'packs',  price: 11200, expiry: 5,  lot: 'LOT-4900' },
  { sku: 'CRE-LEC',   name: 'Crema de leche 500 ml',       cat: 'Derivados', stock: 18,  max: 100, unit: 'uds',    price: 8600,  expiry: 7,  lot: 'LOT-5190' },
] as const;

// mock — no backend endpoint yet
const MOVEMENTS = [
  { type: 'out', title: 'Pedido #4823 · Panaderia Dona Rosa',      qty: -12, unit: 'cajas',  time: '09:42' },
  { type: 'out', title: 'Pedido #4821 · Tienda La Esquina',        qty: -8,  unit: 'cajas',  time: '09:14' },
  { type: 'in',  title: 'Recepcion lote LOT-5234 · Proveedor Alqueria', qty: 200, unit: 'cajas', time: '06:30' },
  { type: 'out', title: 'Pedido #4818 · Cafe Los Almendros',       qty: -4,  unit: 'cajas',  time: 'ayer 07:55' },
] as const;

type Product = typeof PRODUCTS[number];
type FilterKey = 'all' | 'agotado' | 'bajo' | 'expiry';

// ---- Sub-components ----

interface StockBarProps { stock: number; max: number; }
const StockBar: React.FC<StockBarProps> = ({ stock, max }) => {
  const pct = max > 0 ? Math.round((stock / max) * 100) : 0;
  const color =
    pct === 0 ? 'var(--danger)' :
    pct < 25  ? 'var(--amber-500)' :
    'var(--brand)';
  return (
    <div className="stock-bar">
      <div className="track">
        <div className="fill" style={{ width: pct + '%', background: color }} />
      </div>
      <div className="pct">{pct}%</div>
    </div>
  );
};

interface ExpiryChipProps { days: number; }
const ExpiryChip: React.FC<ExpiryChipProps> = ({ days }) => {
  const cls   = days <= 3 ? 'crit' : days <= 7 ? 'warn' : 'ok';
  const label = days <= 0 ? 'Vencido' : `${days}d`;
  return <span className={`expiry-chip ${cls}`}>{label}</span>;
};

interface InvStatsBarProps { products: readonly Product[]; }
const InvStatsBar: React.FC<InvStatsBarProps> = ({ products }) => {
  const total   = products.length;
  const agotado = products.filter((p) => p.stock === 0).length;
  const bajo    = products.filter((p) => p.stock > 0 && p.stock / p.max < 0.25).length;
  const expSoon = products.filter((p) => p.expiry <= 5).length;
  return (
    <div className="inv-stats">
      <div className="inv-stat">
        <div className="label">Productos</div>
        <div className="value">{total}</div>
      </div>
      <div className={`inv-stat ${agotado > 0 ? 'alarm' : ''}`}>
        <div className="label">Agotados</div>
        <div className="value">{agotado}</div>
      </div>
      <div className={`inv-stat ${bajo > 0 ? 'warn' : ''}`}>
        <div className="label">Stock bajo</div>
        <div className="value">{bajo}</div>
      </div>
      <div className={`inv-stat ${expSoon > 0 ? 'warn' : ''}`}>
        <div className="label">Vence pronto</div>
        <div className="value">{expSoon}</div>
      </div>
    </div>
  );
};

interface InvTableProps {
  products: readonly Product[];
  query: string;
  filter: FilterKey;
  selectedSku: string | null;
  onSelect: (sku: string) => void;
}
const InvTable: React.FC<InvTableProps> = ({ products, query, filter, selectedSku, onSelect }) => {
  const visible = products.filter((p) => {
    const matchQ = !query || p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase());
    if (!matchQ) return false;
    if (filter === 'agotado') return p.stock === 0;
    if (filter === 'bajo')    return p.stock > 0 && p.stock / p.max < 0.25;
    if (filter === 'expiry')  return p.expiry <= 5;
    return true;
  });

  return (
    <div className="lo-table-wrap">
      <table className="lo-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Categoria</th>
            <th>Codigo</th>
            <th>Existencias</th>
            <th>Nivel</th>
            <th>Vencimiento</th>
            <th style={{ textAlign: 'right' }}>Precio unit.</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((p) => (
            <tr
              key={p.sku}
              style={{ cursor: 'pointer', background: selectedSku === p.sku ? 'var(--green-50)' : undefined }}
              onClick={() => onSelect(p.sku)}
            >
              <td className="strong">{p.name}</td>
              <td>{p.cat}</td>
              <td className="num" style={{ fontSize: 11, color: 'var(--fg-3)' }}>{p.sku}</td>
              <td className="num">{p.stock} <span style={{ color: 'var(--fg-3)', fontSize: 11 }}>{p.unit}</span></td>
              <td><StockBar stock={p.stock} max={p.max} /></td>
              <td><ExpiryChip days={p.expiry} /></td>
              <td className="num" style={{ textAlign: 'right' }}>$ {p.price.toLocaleString('es-CO')}</td>
            </tr>
          ))}
          {visible.length === 0 && (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--fg-3)' }}>
                Sin productos para este filtro.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

interface InvDetailProps { product: Product | undefined; }
const InvDetail: React.FC<InvDetailProps> = ({ product }) => {
  if (!product) {
    return (
      <div className="inv-detail" style={{ alignItems: 'center', justifyContent: 'center', color: 'var(--fg-3)', minHeight: 300 }}>
        <LIconBox size={32} />
        <div style={{ fontSize: 13, marginTop: 8 }}>Seleccione un producto para ver detalle</div>
      </div>
    );
  }
  const pct = product.max > 0 ? Math.round((product.stock / product.max) * 100) : 0;
  return (
    <div className="inv-detail">
      <div>
        <h3>{product.name}</h3>
        <div className="sku">{product.sku} · {product.lot}</div>
      </div>
      <div className="row"><span className="l">Categoria</span><span className="r">{product.cat}</span></div>
      <div className="row"><span className="l">Existencias</span><span className="r">{product.stock} {product.unit}</span></div>
      <div className="row"><span className="l">Capacidad</span><span className="r">{product.max} {product.unit}</span></div>
      <div className="row"><span className="l">Nivel</span><span className="r">{pct}%</span></div>
      <div className="row"><span className="l">Vencimiento</span><span className="r"><ExpiryChip days={product.expiry} /></span></div>
      <div className="row"><span className="l">Precio unitario</span><span className="r">$ {product.price.toLocaleString('es-CO')}</span></div>

      <div style={{ borderTop: '1px solid var(--border-1)', paddingTop: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
          Movimientos recientes
        </div>
        {MOVEMENTS.map((m, i) => (
          <div key={i} className="movement">
            <div className={`icon-wrap ${m.type}`}>
              {m.type === 'in' ? <LIconPlus size={14} /> : <LIconBox size={14} />}
            </div>
            <div>
              <div className="title">{m.title}</div>
              <div className="sub">{m.qty > 0 ? '+' : ''}{m.qty} {m.unit}</div>
            </div>
            <div className="time">{m.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ---- Main page ----

const FILTERS: { k: FilterKey; label: string }[] = [
  { k: 'all',     label: 'Todos' },
  { k: 'agotado', label: 'Agotados' },
  { k: 'bajo',    label: 'Stock bajo' },
  { k: 'expiry',  label: 'Vence pronto' },
];

const InventarioPage: React.FC = () => {
  const [filter, setFilter]       = useState<FilterKey>('all');
  const [query, setQuery]         = useState('');
  const [selectedSku, setSelected] = useState<string | null>('L-ENT-1L');
  const [lastSync, setLastSync]   = useState('hace 8 segundos');

  const selected = PRODUCTS.find((p) => p.sku === selectedSku);

  const handleRefresh = () => {
    setLastSync('justo ahora');
  };

  return (
    <div className="lo-content">
      {/* Topbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Inventario</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }}>
            <span
              style={{
                display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
                background: 'var(--brand)', marginRight: 6, verticalAlign: 'middle',
              }}
            />
            Sincronizado · {lastSync}
          </span>
          <button className="lo-btn lo-btn-secondary lo-btn-sm" onClick={handleRefresh}>
            <LIconRefresh size={14} />Actualizar
          </button>
        </div>
      </div>

      {/* Stats summary */}
      <div style={{ marginBottom: 20 }}>
        <InvStatsBar products={PRODUCTS} />
      </div>

      {/* Toolbar: search + filter chips */}
      <div className="inv-toolbar" style={{ marginBottom: 16 }}>
        <div className="lo-search">
          <LIconSearch size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o codigo..."
          />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {FILTERS.map((f) => (
            <button
              key={f.k}
              className={`lo-chip ${filter === f.k ? 'active' : ''}`}
              onClick={() => setFilter(f.k)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main workspace: table + detail panel */}
      <div className="inv-workspace">
        <div className="lo-panel" style={{ padding: 0, overflow: 'hidden' }}>
          <InvTable
            products={PRODUCTS}
            query={query}
            filter={filter}
            selectedSku={selectedSku}
            onSelect={setSelected}
          />
        </div>
        <InvDetail product={selected} />
      </div>
    </div>
  );
};

export default InventarioPage;

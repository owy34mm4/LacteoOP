// NewOrderForm — transcription-optimized order entry with auto-suggest.
// Designed for dictation: minimal visible fields, big targets, instant client-match feedback.

const KNOWN_CLIENTS = [
  { id: 'C-128', name: 'Tienda La Esquina',          city: 'Palmira', addr: 'Cra 28 #14-12' },
  { id: 'C-201', name: 'Restaurante El Buen Sabor',  city: 'Cali',    addr: 'Av 6N #28-04' },
  { id: 'C-342', name: 'Minimarket Yumbo Centro',    city: 'Yumbo',   addr: 'Calle 5 #3-22' },
  { id: 'C-415', name: 'Panadería Doña Rosa',        city: 'Palmira', addr: 'Cra 31 #20-15' },
  { id: 'C-502', name: 'Tienda Don Pacho',           city: 'Cali',    addr: 'Calle 70 #5-12' },
];

const KNOWN_PRODUCTS = [
  { sku: 'L-ENT-1L',  name: 'Leche entera 1 L (caja x12)', price: 28800 },
  { sku: 'L-DES-1L',  name: 'Leche deslactosada 1 L',      price: 32400 },
  { sku: 'YOG-NAT',   name: 'Yogur natural 1 kg',          price: 14500 },
  { sku: 'QUE-CAMP',  name: 'Queso campesino 500 g',       price: 18200 },
  { sku: 'MANT-250',  name: 'Mantequilla 250 g',           price:  9800 },
];

function ClientField({ value, onChange, onMatch }) {
  const [focused, setFocused] = React.useState(false);
  const matches = value && !value.match
    ? KNOWN_CLIENTS.filter(c => c.name.toLowerCase().includes(value.toLowerCase()))
    : [];
  const isMatch = value && value.match;
  return (
    <div className={`field ${isMatch ? 'match' : ''}`} style={{ position: 'relative' }}>
      <div className="field-label">
        <span>Cliente</span>
        {isMatch && <span style={{ fontSize: 11, color: 'var(--green-700)' }}>● Coincidencia · {value.match.id}</span>}
      </div>
      <input
        value={isMatch ? value.match.name : (value || '')}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 120)}
        placeholder="Empiece a escribir el nombre…" />
      {isMatch && (
        <div className="field-hint"><IconCheck size={14} />{value.match.city} · {value.match.addr}</div>
      )}
      {focused && !isMatch && matches.length > 0 && (
        <div className="suggest-list">
          {matches.slice(0, 4).map(c => (
            <div key={c.id} className="suggest-row" onMouseDown={() => onMatch(c)}>
              <div>
                <div className="name">{c.name}</div>
                <div className="sub">{c.city} · {c.addr}</div>
              </div>
              <div className="badge-mini">{c.id}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductRow({ row, onUpdate, onRemove }) {
  return (
    <div className="line-item">
      <div>
        <div className="name">{row.name}</div>
        <div className="sku">{row.sku}</div>
      </div>
      <input type="number" value={row.qty}
             onChange={e => onUpdate({ ...row, qty: parseInt(e.target.value) || 0 })} />
      <div className="price">$ {(row.qty * row.price).toLocaleString('es-CO')}</div>
      <button className="remove" onClick={onRemove} title="Quitar">×</button>
    </div>
  );
}

function ProductPicker({ onPick, onCancel }) {
  const [q, setQ] = React.useState('');
  const matches = KNOWN_PRODUCTS.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div style={{ position: 'relative' }}>
      <div className="search" style={{ height: 40 }}>
        <span style={{ color: 'var(--fg-3)' }}><IconSearch size={16} /></span>
        <input value={q} onChange={e => setQ(e.target.value)} autoFocus
               placeholder="Buscar producto…" />
        <button onClick={onCancel} style={{ border: 'none', background: 'transparent', color: 'var(--fg-3)', cursor: 'pointer', fontSize: 18 }}>×</button>
      </div>
      <div className="suggest-list" style={{ position: 'static', marginTop: 8 }}>
        {matches.map(p => (
          <div key={p.sku} className="suggest-row" onClick={() => onPick(p)}>
            <div>
              <div className="name">{p.name}</div>
              <div className="sub">{p.sku} · $ {p.price.toLocaleString('es-CO')}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NewOrderForm({ onConfirm }) {
  const [client, setClient]  = React.useState(null);    // { match: {…} } | string
  const [phone, setPhone]    = React.useState('+57 312 555 4821');
  const [lines, setLines]    = React.useState([
    { sku: 'L-ENT-1L', name: 'Leche entera 1 L (caja x12)', qty: 4, price: 28800 },
    { sku: 'YOG-NAT',  name: 'Yogur natural 1 kg',          qty: 6, price: 14500 },
  ]);
  const [picking, setPicking] = React.useState(false);
  const total = lines.reduce((s, l) => s + l.qty * l.price, 0);
  const canSubmit = client && client.match && lines.length > 0;

  return (
    <div className="form-pane">
      <h2>Nuevo pedido</h2>
      <div className="sub">Transcriba el pedido recibido por WhatsApp o teléfono.</div>

      <ClientField
        value={client}
        onChange={v => setClient(v ? { raw: v } : null)}
        onMatch={c => setClient({ match: c })}
      />

      <div className="field">
        <div className="field-label">
          <span>Teléfono</span>
          <span className="protected">⚲ Dato protegido</span>
        </div>
        <input value={phone} onChange={e => setPhone(e.target.value)} />
      </div>

      <div className="field">
        <div className="field-label"><span>Productos · {lines.length}</span></div>
        <div className="line-items">
          {lines.map((l, i) => (
            <ProductRow key={i} row={l}
                        onUpdate={r => setLines(lines.map((x, j) => j === i ? r : x))}
                        onRemove={() => setLines(lines.filter((_, j) => j !== i))} />
          ))}
          {picking
            ? <ProductPicker
                onPick={p => { setLines([...lines, { ...p, qty: 1 }]); setPicking(false); }}
                onCancel={() => setPicking(false)} />
            : <button className="add-line" onClick={() => setPicking(true)}>+ Agregar producto</button>}
        </div>
      </div>

      <div className="form-total">
        <div className="label">Total</div>
        <div className="value">$ {total.toLocaleString('es-CO')}</div>
      </div>

      <div className="form-actions">
        <button className="btn btn-secondary">Guardar borrador</button>
        <button className={`btn btn-primary`} disabled={!canSubmit}
                onClick={() => onConfirm({ client: client.match, phone, lines, total })}>
          Revisar y confirmar
        </button>
      </div>
    </div>
  );
}

window.NewOrderForm = NewOrderForm;

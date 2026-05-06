import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';

export default function Cotizar() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState('');
  const [qty, setQty] = useState(1);
  const [items, setItems] = useState([]); // {productId,cantidad}

  const [sending, setSending] = useState(false);
  const [successNumero, setSuccessNumero] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await api.get('/api/products');
      setProducts(data.items || []);
    })();
  }, []);

  const selectedProduct = useMemo(
    () => products.find((p) => p._id === selected),
    [products, selected]
  );

  function addItem() {
    setError('');
    if (!selected) return setError('Selecciona un producto');
    const cantidad = Number(qty || 1);
    if (!Number.isFinite(cantidad) || cantidad < 1) return setError('Cantidad inválida');

    setItems((prev) => {
      const exists = prev.find((x) => x.productId === selected);
      if (exists) {
        return prev.map((x) => (x.productId === selected ? { ...x, cantidad: x.cantidad + cantidad } : x));
      }
      return [...prev, { productId: selected, cantidad }];
    });
    setQty(1);
  }

  function removeItem(productId) {
    setItems((prev) => prev.filter((x) => x.productId !== productId));
  }

  async function submit() {
    setError('');
    setSuccessNumero('');
    if (!user) return setError('Debes iniciar sesión para cotizar');
    if (user.role !== 'CLIENTE') return setError('Sólo los clientes pueden generar cotizaciones');
    if (!items.length) return setError('Agrega al menos 1 producto');

    setSending(true);
    try {
      const { data } = await api.post('/api/quotes', { items });
      setSuccessNumero(data.quote.numero);
      setItems([]);
      setSelected('');
      setQty(1);
    } catch (e) {
      setError(e?.response?.data?.error || 'No se pudo enviar la cotización');
    } finally {
      setSending(false);
    }
  }

  return (
    <PageShell title="Cotización" width="wide">

      {!user && (
        <div className="prx-alert prx-alert--warn">
          Para cotizar necesitas iniciar sesión. <Link to="/login">Ir a Login</Link>
        </div>
      )}

      {user && (
        <div className="prx-card" style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Tus datos (se agregan automáticamente)</div>
          <div style={small}><b>Cliente:</b> {user.nombre} ({user.tipoCliente})</div>
          <div style={small}><b>RUT:</b> {user.rut}</div>
          <div style={small}><b>Correo:</b> {user.correo}</div>
          {user.telefono && <div style={small}><b>Teléfono:</b> {user.telefono}</div>}
          {user.tipoCliente === 'EMPRESA' && user.razonSocial && <div style={small}><b>Razón Social:</b> {user.razonSocial}</div>}
        </div>
      )}

      <div className="prx-grid" style={{ alignItems: 'start' }}>
        <div className="prx-card">
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Agregar productos</div>

          <label className="prx-label">Producto</label>
          <select value={selected} onChange={(e) => setSelected(e.target.value)} className="prx-input">
            <option value="">-- Selecciona --</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.nombre} {p.sku ? `(${p.sku})` : ''}
              </option>
            ))}
          </select>

          {selectedProduct && (
            <div style={{ marginTop: 8, color: '#555', fontSize: 13 }}>
              {selectedProduct.descripcion || 'Sin descripción'}
            </div>
          )}

          <label className="prx-label">Cantidad</label>
          <input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} className="prx-input" />

          <button onClick={addItem} className="prx-btn">Agregar</button>
        </div>

        <div className="prx-card">
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Tu solicitud</div>

          {items.length === 0 ? (
            <div style={{ color: '#555' }}>Aún no agregas productos.</div>
          ) : (
            <ul style={{ paddingLeft: 18, marginTop: 0 }}>
              {items.map((it) => {
                const p = products.find((x) => x._id === it.productId);
                return (
                  <li key={it.productId} style={{ marginBottom: 8 }}>
                    <b>{p?.nombre || 'Producto'}</b> — Cantidad: {it.cantidad}{' '}
                    <button onClick={() => removeItem(it.productId)} className="prx-miniBtn">Quitar</button>
                  </li>
                );
              })}
            </ul>
          )}

          {error && <div className="prx-alert prx-alert--error">{error}</div>}
          {successNumero && (
            <div className="prx-alert prx-alert--success">
              ¡Listo! Tu cotización fue creada con el número <b>{successNumero}</b>. Puedes verla en tu <Link to="/perfil">perfil</Link>.
            </div>
          )}

          <button disabled={sending} onClick={submit} className="prx-btn">
            {sending ? 'Enviando…' : 'Enviar cotización'}
          </button>
        </div>
      </div>
    </PageShell>
  );
}
const small = { fontSize: 13, color: '#444', marginBottom: 4 };

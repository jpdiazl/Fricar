import React, { useEffect, useState } from 'react';
import api from '../api/client';
import ProductImageCarousel from '../components/ProductImageCarousel';

export default function Catalogo() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/api/products');
        if (alive) setItems(data.items || []);
      } catch (e) {
        if (alive) setError(e?.response?.data?.error || 'No se pudo cargar el catálogo');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div style={{ padding: 24, maxWidth: 980, margin: '0 auto' }}>
      <h1>Catálogo (sin precios)</h1>
      <p style={{ color: 'var(--muted)' }}>Los valores se informan al responder la cotización.</p>

      {loading && <div>Cargando…</div>}
      {error && <div style={errorStyle}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
        {items.map((p) => (
          <div key={p._id} style={card}>
            <ProductImageCarousel images={p?.images || []} alt={p.nombre} height={150} />
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{p.categoria || 'Sin categoría'}</div>
            <div style={{ fontWeight: 700 }}>{p.nombre}</div>
            {p.sku && <div style={{ fontSize: 12, color: 'var(--muted)' }}>SKU: {p.sku}</div>}
            {p.descripcion && <div style={{ marginTop: 8, color: 'var(--text)' }}>{p.descripcion}</div>}
            {p.unidad && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--muted)' }}>Unidad: {p.unidad}</div>}
          </div>
        ))}
      </div>

      {!loading && !error && items.length === 0 && <div>No hay productos aún.</div>}
    </div>
  );
}

const card = { border: '1px solid var(--border)', borderRadius: 16, padding: 14, background: 'var(--surface)' };
const errorStyle = { marginTop: 12, padding: 10, borderRadius: 12, background: '#ffe5e5', color: '#7a0000' };

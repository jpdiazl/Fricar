import React, { useEffect, useState } from 'react';
import api from '../api/client';
import ProductImageCarousel from '../components/ProductImageCarousel';
import PageShell from '../components/PageShell';

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
    <PageShell title="Catálogo" subtitle="Productos disponibles para solicitar cotización. Los valores se informan al responder." width="wide">
      {loading && <div>Cargando…</div>}
      {error && <div className="prx-alert prx-alert--error">{error}</div>}

      <div className="prx-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
        {items.map((p) => (
          <div key={p._id} className="prx-card">
            <ProductImageCarousel images={p?.images || []} alt={p.nombre} height={150} />
            <div style={{ fontSize: 12, color: 'var(--secondary)', fontWeight: 900, marginTop: 10 }}>{p.categoria || 'Sin categoría'}</div>
            <div style={{ fontWeight: 950, fontSize: 18, color: 'var(--text)' }}>{p.nombre}</div>
            {p.sku && <div className="prx-kv">SKU: {p.sku}</div>}
            {p.descripcion && <div style={{ marginTop: 8, color: 'var(--muted)', lineHeight: 1.5 }}>{p.descripcion}</div>}
            {p.unidad && <div className="prx-kv" style={{ marginTop: 8 }}>Unidad: {p.unidad}</div>}
          </div>
        ))}
      </div>

      {!loading && !error && items.length === 0 && <div>No hay productos aún.</div>}
    </PageShell>
  );
}

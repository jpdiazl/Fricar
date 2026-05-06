import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import resolveAssetUrl from '../../utils/resolveAssetUrl';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [branding, setBranding] = useState({ companyName: 'FRICAR', logoUrl: '' });
  const [savingBranding, setSavingBranding] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/api/metrics');
        if (alive) setData(res.data);
      } catch (e) {
        if (alive) setError(e?.response?.data?.error || 'No se pudieron cargar las métricas');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    api.get('/api/branding/public')
      .then(({ data }) => setBranding({ companyName: data?.companyName || 'FRICAR', logoUrl: data?.logoUrl || '' }))
      .catch(() => {});
  }, []);

  async function saveBranding() {
    setSavingBranding(true);
    try {
      const { data } = await api.put('/api/branding', {
        companyName: branding.companyName,
        logoUrl: branding.logoUrl
      });
      // Keep local state in sync
      setBranding((prev) => ({
        ...prev,
        companyName: data?.item?.companyName ?? prev.companyName,
        logoUrl: data?.item?.logoUrl ?? prev.logoUrl
      }));
    } finally {
      setSavingBranding(false);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 980, margin: '0 auto' }}>
      <h1>Dashboard</h1>
      {loading && <div>Cargando…</div>}
      {error && <div style={errorStyle}>{error}</div>}

      {data && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          <Card title="Usuarios" value={data.users} />
          <Card title="Productos" value={data.products} />
          <Card title="Cotizaciones" value={data.quotes} />
          <Card title="Pendientes" value={data.pendingQuotes} />
          <Card title="Requerimientos" value={data.contacts} />
        </div>
      )}

      <div style={{ marginTop: 18 }}>
        <h2 style={{ marginBottom: 10 }}>Branding</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={card}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Nombre</div>
            <input
              value={branding.companyName}
              onChange={(e) => setBranding((p) => ({ ...p, companyName: e.target.value }))}
              style={input}
            />
            <button className="prx-btn prx-btn--primary" onClick={saveBranding} disabled={savingBranding} style={{ width: '100%', marginTop: 10 }}>
              {savingBranding ? 'Guardando…' : 'Guardar'}
            </button>
          </div>

          <div style={card}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Logo (URL)</div>
            <input
              value={branding.logoUrl}
              onChange={(e) => setBranding((p) => ({ ...p, logoUrl: e.target.value }))}
              placeholder="https://..."
              style={input}
            />
            <div style={{ marginTop: 10, border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--surface)' }}>
              {branding.logoUrl ? (
                <img src={resolveAssetUrl(branding.logoUrl)} alt="Logo" style={{ maxWidth: '100%', maxHeight: 64, objectFit: 'contain' }} />
              ) : (
                <div style={{ color: 'var(--muted)' }}>Pega una URL para ver el preview.</div>
              )}
            </div>

            <button className="prx-btn prx-btn--primary" onClick={saveBranding} disabled={savingBranding} style={{ width: '100%', marginTop: 10 }}>
              {savingBranding ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </div>

        <p style={{ marginTop: 12, color: 'var(--muted)' }}>
          Tip: puedes usar URLs de Cloudinary, Google Drive (link directo), o cualquier hosting con HTTPS.
        </p>
      </div>

      {/* Texto informativo removido */}
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div style={card}>
      <div style={{ color: 'var(--muted)', fontSize: 13 }}>{title}</div>
      <div style={{ fontSize: 30, fontWeight: 900 }}>{value}</div>
    </div>
  );
}

const card = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 14,
  padding: 14
};

const input = {
  width: '100%',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: '10px 12px',
  outline: 'none',
  background: 'var(--surface)',
  color: 'var(--text)'
};

const errorStyle = {
  background: 'rgba(255,0,0,0.08)',
  border: '1px solid rgba(255,0,0,0.25)',
  padding: 10,
  borderRadius: 12,
  marginTop: 10
};

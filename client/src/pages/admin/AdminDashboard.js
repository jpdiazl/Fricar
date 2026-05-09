import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import resolveAssetUrl from '../../utils/resolveAssetUrl';
import Loader from '../../components/Loader';
import PageShell from '../../components/PageShell';

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
    <PageShell
      title="Dashboard"
      subtitle="Resumen general del sistema, branding de la empresa y accesos de administración."
      width="wide"
    >
      {loading && <Loader label="Cargando dashboard..." compact />}
      {error && <div className="prx-alert prx-alert--error">{error}</div>}

      {data && (
        <section className="dashboard-metrics" aria-label="Métricas principales">
          <MetricCard title="Usuarios" value={data.users} icon="👥" />
          <MetricCard title="Productos" value={data.products} icon="📦" />
          <MetricCard title="Cotizaciones" value={data.quotes} icon="🧾" />
          <MetricCard title="Pendientes" value={data.pendingQuotes} icon="⏳" />
          <MetricCard title="Requerimientos" value={data.contacts} icon="✉️" />
        </section>
      )}

      <section className="prx-card dashboard-branding" aria-label="Configuración de branding">
        <div className="dashboard-branding__intro">
          <span className="home-kicker">Branding</span>
          <h2>Identidad visual</h2>
          <p>Configura el nombre y el logo que se mostrarán en la navegación pública del sitio.</p>
        </div>

        <div className="dashboard-branding__grid">
          <label className="dashboard-field">
            <span className="prx-label">Nombre</span>
            <input
              value={branding.companyName}
              onChange={(e) => setBranding((p) => ({ ...p, companyName: e.target.value }))}
              className="prx-input"
            />
          </label>

          <label className="dashboard-field">
            <span className="prx-label">Logo por URL</span>
            <input
              value={branding.logoUrl}
              onChange={(e) => setBranding((p) => ({ ...p, logoUrl: e.target.value }))}
              placeholder="https://..."
              className="prx-input"
            />
          </label>
        </div>

        <div className="dashboard-logo-preview">
          {branding.logoUrl ? (
            <img src={resolveAssetUrl(branding.logoUrl)} alt="Logo" />
          ) : (
            <div>Pega una URL para ver el preview del logo.</div>
          )}
        </div>

        <button className="prx-btn prx-btn--primary" onClick={saveBranding} disabled={savingBranding}>
          {savingBranding ? 'Guardando…' : 'Guardar branding'}
        </button>
      </section>
    </PageShell>
  );
}

function MetricCard({ title, value, icon }) {
  return (
    <article className="prx-card dashboard-metric-card">
      <div className="dashboard-metric-card__icon" aria-hidden="true">{icon}</div>
      <div>
        <div className="dashboard-metric-card__title">{title}</div>
        <div className="dashboard-metric-card__value">{value}</div>
      </div>
    </article>
  );
}

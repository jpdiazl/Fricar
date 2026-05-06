import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import PageShell from '../../components/PageShell';
import resolveAssetUrl from '../../utils/resolveAssetUrl';

export default function AdminProducts() {
  const UNIT_OPTIONS = [
    'Kilo',
    'Unidad',
    'Litro',
    'Caja',
    'Saco',
    'Bolsa',
    'Paquete',
    'Bandeja',
    'Docena',
    'Tonelada',
    'Gramo',
    'Mililitro'
  ];

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ sku: '', nombre: '', descripcion: '', categoria: '', unidad: '' });
  const [saving, setSaving] = useState(false);
  const [imgUrl, setImgUrl] = useState({}); // per-product url input

  async function load() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/products?activeOnly=false');
      setItems(data.items || []);
    } catch (e) {
      setError(e?.response?.data?.error || 'No se pudieron cargar productos');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function update(key) {
    return (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function create(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/api/products', form);
      setForm({ sku: '', nombre: '', descripcion: '', categoria: '', unidad: '' });
      await load();
    } catch (e) {
      setError(e?.response?.data?.error || 'No se pudo crear');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(p) {
    setError('');
    try {
      await api.put(`/api/products/${p._id}`, { activo: !p.activo });
      await load();
    } catch (e) {
      setError(e?.response?.data?.error || 'No se pudo actualizar');
    }
  }

  async function deletePermanent(p) {
    const ok = window.confirm(`Eliminar definitivamente "${p.nombre}"? Esta acción no se puede deshacer.`);
    if (!ok) return;
    setError('');
    try {
      await api.delete(`/api/products/${p._id}/permanent`);
      await load();
    } catch (e) {
      setError(e?.response?.data?.error || 'No se pudo eliminar');
    }
  }

  async function addImageUrl(p) {
    const url = (imgUrl[p._id] || '').trim();
    if (!url) return;
    setError('');
    try {
      await api.post(`/api/products/${p._id}/images`, { url });
      setImgUrl((prev) => ({ ...prev, [p._id]: '' }));
      await load();
    } catch (e) {
      setError(e?.response?.data?.error || 'No se pudo agregar la imagen');
    }
  }

  async function removeImage(p, imageId) {
    setError('');
    try {
      await api.delete(`/api/products/${p._id}/images/${imageId}`);
      await load();
    } catch (e) {
      setError(e?.response?.data?.error || 'No se pudo eliminar la imagen');
    }
  }

  return (
    <PageShell title="Productos" width="wide">
      {error && <div className="prx-alert prx-alert--error">{error}</div>}

      <form onSubmit={create} className="prx-card" style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 800, marginBottom: 10 }}>Crear producto</div>
        <div className="prx-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div>
            <label className="prx-label">SKU</label>
            <input value={form.sku} onChange={update('sku')} className="prx-input" />
          </div>
          <div>
            <label className="prx-label">Nombre</label>
            <input value={form.nombre} onChange={update('nombre')} className="prx-input" />
          </div>
          <div>
            <label className="prx-label">Categoría</label>
            <input value={form.categoria} onChange={update('categoria')} className="prx-input" />
          </div>
          <div>
            <label className="prx-label">Unidad</label>
            <select value={form.unidad} onChange={update('unidad')} className="prx-input">
              <option value="">Selecciona unidad…</option>
              {UNIT_OPTIONS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="prx-label">Descripción</label>
            <textarea value={form.descripcion} onChange={update('descripcion')} className="prx-input" rows={2} />
          </div>
        </div>
        <button className="prx-btn prx-btn--primary" disabled={saving} style={{ marginTop: 12 }}>
          {saving ? 'Guardando…' : 'Crear'}
        </button>
      </form>

      {loading ? (
        <div>Cargando…</div>
      ) : (
        <div className="prx-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 12 }}>
          {items.map((p) => (
            <div key={p._id} className="prx-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 900 }}>{p.nombre}</div>
                  <div style={{ color: 'var(--muted)', fontSize: 13 }}>SKU: {p.sku} {p.unidad ? `• Unidad: ${p.unidad}` : ''}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className={'prx-badge ' + (p.activo ? 'prx-badge--ok' : 'prx-badge--muted')}>{p.activo ? 'ACTIVO' : 'INACTIVO'}</span>
                </div>
              </div>

              {/* Images */}
              <div style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 800, marginBottom: 8 }}>Imágenes (URLs)</div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    className="prx-input"
                    placeholder="https://..."
                    value={imgUrl[p._id] || ''}
                    onChange={(e) => setImgUrl((prev) => ({ ...prev, [p._id]: e.target.value }))}
                  />
                  <button type="button" className="prx-btn prx-btn--secondary" onClick={() => addImageUrl(p)}>
                    Agregar
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8, marginTop: 10 }}>
                  {(p.images || []).map((img) => (
                    <div key={img._id} style={{ position: 'relative' }}>
                      <img
                        src={resolveAssetUrl(img.url)}
                        alt=""
                        style={{ width: '100%', height: 70, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)' }}
                      />
                      <button
                        type="button"
                        title="Eliminar"
                        onClick={() => removeImage(p, img._id)}
                        style={{
                          position: 'absolute',
                          top: 6,
                          right: 6,
                          width: 26,
                          height: 26,
                          borderRadius: 999,
                          border: '1px solid var(--border)',
                          background: 'var(--surface)',
                          cursor: 'pointer'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {!p.images?.length && <div style={{ marginTop: 8, color: 'var(--muted)', fontSize: 13 }}>Sin imágenes.</div>}
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                <button type="button" className="prx-btn prx-btn--secondary" onClick={() => toggleActive(p)}>
                  {p.activo ? 'Desactivar' : 'Activar'}
                </button>
                <button type="button" className="prx-btn prx-btn--danger" onClick={() => deletePermanent(p)}>
                  Eliminar definitivo
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}

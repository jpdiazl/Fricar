import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import PageShell from '../../components/PageShell';
import resolveAssetUrl from '../../utils/resolveAssetUrl';
import Loader from '../../components/Loader';

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

const emptyProductForm = {
  sku: '',
  nombre: '',
  descripcion: '',
  categoria: '',
  unidad: '',
  principalHome: false,
  destacadoHome: false
};

function productToEditable(p) {
  return {
    sku: p.sku || '',
    nombre: p.nombre || '',
    descripcion: p.descripcion || '',
    categoria: p.categoria || '',
    unidad: p.unidad || '',
    principalHome: Boolean(p.principalHome),
    destacadoHome: Boolean(p.destacadoHome),
    activo: Boolean(p.activo)
  };
}

export default function AdminProducts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyProductForm);
  const [saving, setSaving] = useState(false);
  const [imgUrl, setImgUrl] = useState({});
  const [editing, setEditing] = useState({});
  const [savingRow, setSavingRow] = useState({});

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

  function updateBool(key) {
    return (e) => setForm((prev) => ({ ...prev, [key]: e.target.checked }));
  }

  function updateEditing(id, key) {
    return (e) => {
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setEditing((prev) => ({ ...prev, [id]: { ...prev[id], [key]: value } }));
    };
  }

  async function create(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/api/products', form);
      setForm(emptyProductForm);
      await load();
    } catch (e) {
      setError(e?.response?.data?.error || 'No se pudo crear');
    } finally {
      setSaving(false);
    }
  }

  async function saveProduct(p) {
    const payload = editing[p._id];
    if (!payload) return;
    setError('');
    setSavingRow((prev) => ({ ...prev, [p._id]: true }));
    try {
      await api.put(`/api/products/${p._id}`, payload);
      setEditing((prev) => {
        const copy = { ...prev };
        delete copy[p._id];
        return copy;
      });
      await load();
    } catch (e) {
      setError(e?.response?.data?.error || 'No se pudo guardar el producto');
    } finally {
      setSavingRow((prev) => ({ ...prev, [p._id]: false }));
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

  async function toggleHomeFlag(p, field) {
    setError('');
    try {
      await api.put(`/api/products/${p._id}`, { [field]: !p[field] });
      await load();
    } catch (e) {
      setError(e?.response?.data?.error || 'No se pudo actualizar la portada');
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
          <label style={checkRow}>
            <input type="checkbox" checked={form.principalHome} onChange={updateBool('principalHome')} />
            Mostrar como producto principal en Inicio
          </label>
          <label style={checkRow}>
            <input type="checkbox" checked={form.destacadoHome} onChange={updateBool('destacadoHome')} />
            Mostrar como producto destacado en Inicio
          </label>
        </div>
        <button className="prx-btn prx-btn--primary" disabled={saving} style={{ marginTop: 12 }}>
          {saving ? 'Guardando…' : 'Crear'}
        </button>
      </form>

      <div className="prx-alert prx-alert--warn" style={{ marginBottom: 12 }}>
        Para que un producto salga en la portada debe estar <b>activo</b> y marcado como <b>principal</b> o <b>destacado</b>. Si lo desactivas, desaparece de Inicio automáticamente.
      </div>

      {loading ? (
        <Loader label="Cargando productos..." compact />
      ) : (
        <div className="prx-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 12 }}>
          {items.map((p) => {
            const edit = editing[p._id];
            const isEditing = Boolean(edit);
            return (
              <div key={p._id} className="prx-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 900 }}>{p.nombre}</div>
                    <div style={{ color: 'var(--muted)', fontSize: 13 }}>SKU: {p.sku} {p.unidad ? `• Unidad: ${p.unidad}` : ''}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <span className={'prx-badge ' + (p.activo ? 'prx-badge--ok' : 'prx-badge--muted')}>{p.activo ? 'ACTIVO' : 'INACTIVO'}</span>
                    {p.principalHome && <span className="prx-badge prx-badge--ok">PRINCIPAL</span>}
                    {p.destacadoHome && <span className="prx-badge prx-badge--muted">DESTACADO</span>}
                  </div>
                </div>

                {isEditing && (
                  <div className="product-edit-panel">
                    <div>
                      <label className="prx-label">SKU</label>
                      <input className="prx-input" value={edit.sku} onChange={updateEditing(p._id, 'sku')} />
                    </div>
                    <div>
                      <label className="prx-label">Nombre</label>
                      <input className="prx-input" value={edit.nombre} onChange={updateEditing(p._id, 'nombre')} />
                    </div>
                    <div>
                      <label className="prx-label">Categoría</label>
                      <input className="prx-input" value={edit.categoria} onChange={updateEditing(p._id, 'categoria')} />
                    </div>
                    <div>
                      <label className="prx-label">Unidad</label>
                      <select className="prx-input" value={edit.unidad} onChange={updateEditing(p._id, 'unidad')}>
                        <option value="">Selecciona unidad…</option>
                        {UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label className="prx-label">Descripción de portada / catálogo</label>
                      <textarea className="prx-input" rows={4} value={edit.descripcion} onChange={updateEditing(p._id, 'descripcion')} />
                    </div>
                    <label style={checkRow}>
                      <input type="checkbox" checked={edit.activo} onChange={updateEditing(p._id, 'activo')} />
                      Producto activo
                    </label>
                    <label style={checkRow}>
                      <input type="checkbox" checked={edit.principalHome} onChange={updateEditing(p._id, 'principalHome')} />
                      Producto principal en Inicio
                    </label>
                    <label style={checkRow}>
                      <input type="checkbox" checked={edit.destacadoHome} onChange={updateEditing(p._id, 'destacadoHome')} />
                      Producto destacado en Inicio
                    </label>
                  </div>
                )}

                <div style={{ marginTop: 12 }}>
                  <div style={{ fontWeight: 800, marginBottom: 8 }}>Foto del producto / portada (URL)</div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      className="prx-input"
                      placeholder="https://..."
                      value={imgUrl[p._id] || ''}
                      onChange={(e) => setImgUrl((prev) => ({ ...prev, [p._id]: e.target.value }))}
                    />
                    <button type="button" className="prx-btn prx-btn--secondary product-small-btn" onClick={() => addImageUrl(p)}>
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

                  {!p.images?.length && <div style={{ marginTop: 8, color: 'var(--muted)', fontSize: 13 }}>Sin imágenes. Si está marcado en Inicio, se mostrará sin foto hasta que agregues una URL.</div>}
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                  {isEditing ? (
                    <>
                      <button type="button" className="prx-btn prx-btn--primary product-action-btn" disabled={savingRow[p._id]} onClick={() => saveProduct(p)}>
                        {savingRow[p._id] ? 'Guardando…' : 'Guardar cambios'}
                      </button>
                      <button type="button" className="prx-btn prx-btn--secondary product-action-btn" onClick={() => setEditing((prev) => {
                        const copy = { ...prev };
                        delete copy[p._id];
                        return copy;
                      })}>
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <button type="button" className="prx-btn prx-btn--secondary product-action-btn" onClick={() => setEditing((prev) => ({ ...prev, [p._id]: productToEditable(p) }))}>
                      Editar descripción/datos
                    </button>
                  )}
                  <button type="button" className="prx-btn prx-btn--secondary product-action-btn" onClick={() => toggleActive(p)}>
                    {p.activo ? 'Desactivar' : 'Activar'}
                  </button>
                  <button type="button" className="prx-btn prx-btn--secondary product-action-btn" onClick={() => toggleHomeFlag(p, 'principalHome')}>
                    {p.principalHome ? 'Quitar principal' : 'Marcar principal'}
                  </button>
                  <button type="button" className="prx-btn prx-btn--secondary product-action-btn" onClick={() => toggleHomeFlag(p, 'destacadoHome')}>
                    {p.destacadoHome ? 'Quitar destacado' : 'Marcar destacado'}
                  </button>
                  <button type="button" className="prx-btn prx-btn--danger product-action-btn" onClick={() => deletePermanent(p)}>
                    Eliminar definitivo
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}

const checkRow = { display: 'flex', alignItems: 'center', gap: 9, marginTop: 12, color: 'var(--primary)', fontWeight: 850 };

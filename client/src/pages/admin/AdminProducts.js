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
    <PageShell
      title="Productos"
      subtitle="Administra el catálogo y define qué productos aparecen en la portada principal."
      width="full"
    >
      {error && <div className="prx-alert prx-alert--error">{error}</div>}

      <section className="product-admin-layout" aria-label="Administrador de productos">
        <form onSubmit={create} className="product-create-card">
          <div className="product-section-title">
            <span className="home-kicker">NUEVO PRODUCTO</span>
            <h2>Crear producto</h2>
            <p>Completa los datos principales. Luego puedes agregar imágenes por URL desde la tarjeta del producto.</p>
          </div>

          <div className="product-form-grid">
            <div>
              <label className="prx-label" htmlFor="product-sku">SKU</label>
              <input id="product-sku" value={form.sku} onChange={update('sku')} className="prx-input" />
            </div>
            <div>
              <label className="prx-label" htmlFor="product-name">Nombre</label>
              <input id="product-name" value={form.nombre} onChange={update('nombre')} className="prx-input" />
            </div>
            <div>
              <label className="prx-label" htmlFor="product-category">Categoría</label>
              <input id="product-category" value={form.categoria} onChange={update('categoria')} className="prx-input" />
            </div>
            <div>
              <label className="prx-label" htmlFor="product-unit">Unidad</label>
              <select id="product-unit" value={form.unidad} onChange={update('unidad')} className="prx-input">
                <option value="">Selecciona unidad…</option>
                {UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="product-form-grid__full">
              <label className="prx-label" htmlFor="product-description">Descripción</label>
              <textarea id="product-description" value={form.descripcion} onChange={update('descripcion')} className="prx-input prx-textarea" rows={3} />
            </div>
          </div>

          <div className="product-checks">
            <label><input type="checkbox" checked={form.principalHome} onChange={updateBool('principalHome')} /> Producto principal en Inicio</label>
            <label><input type="checkbox" checked={form.destacadoHome} onChange={updateBool('destacadoHome')} /> Producto destacado en Inicio</label>
          </div>

          <button className="prx-btn prx-btn--primary" disabled={saving}>{saving ? 'Guardando…' : 'Crear producto'}</button>
        </form>

        <aside className="product-help-card">
          <span className="home-kicker">PORTADA</span>
          <h2>Reglas de visualización</h2>
          <p>Para aparecer en Inicio, el producto debe estar activo y marcado como principal o destacado.</p>
          <ul>
            <li>Si lo desactivas, desaparece automáticamente de la portada.</li>
            <li>La descripción y foto se toman desde esta misma sección.</li>
            <li>Solo debe quedar un producto principal y uno destacado.</li>
          </ul>
        </aside>
      </section>

      {loading ? (
        <Loader label="Cargando productos..." compact />
      ) : (
        <section className="product-card-grid" aria-label="Listado de productos">
          {items.map((p) => {
            const edit = editing[p._id];
            const isEditing = Boolean(edit);
            const images = p.images || [];
            return (
              <article key={p._id} className="product-admin-card">
                <header className="product-admin-card__header">
                  <div className="product-admin-card__title">
                    <h2>{p.nombre}</h2>
                    <p>SKU: {p.sku || 'Sin SKU'} {p.unidad ? `• Unidad: ${p.unidad}` : ''}</p>
                  </div>
                  <div className="product-admin-card__badges">
                    <span className={'prx-badge ' + (p.activo ? 'prx-badge--ok' : 'prx-badge--muted')}>{p.activo ? 'ACTIVO' : 'INACTIVO'}</span>
                    {p.principalHome && <span className="prx-badge prx-badge--ok">PRINCIPAL</span>}
                    {p.destacadoHome && <span className="prx-badge prx-badge--muted">DESTACADO</span>}
                  </div>
                </header>

                <div className="product-admin-card__body">
                  <div className="product-admin-card__preview">
                    {images[0] ? (
                      <img src={resolveAssetUrl(images[0].url)} alt={p.nombre} />
                    ) : (
                      <div className="product-admin-card__placeholder">Sin foto</div>
                    )}
                  </div>

                  <div className="product-admin-card__content">
                    <p className="product-admin-card__desc">{p.descripcion || 'Sin descripción. Edita este producto para agregar la información que se verá en catálogo e Inicio.'}</p>
                    <div className="product-admin-card__meta">
                      {p.categoria && <span>{p.categoria}</span>}
                      {p.unidad && <span>{p.unidad}</span>}
                      <span>{images.length} foto{images.length === 1 ? '' : 's'}</span>
                    </div>
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
                    <div className="product-edit-panel__full">
                      <label className="prx-label">Descripción de portada / catálogo</label>
                      <textarea className="prx-input prx-textarea" rows={4} value={edit.descripcion} onChange={updateEditing(p._id, 'descripcion')} />
                    </div>
                    <div className="product-checks product-checks--edit product-edit-panel__full">
                      <label><input type="checkbox" checked={edit.activo} onChange={updateEditing(p._id, 'activo')} /> Producto activo</label>
                      <label><input type="checkbox" checked={edit.principalHome} onChange={updateEditing(p._id, 'principalHome')} /> Producto principal en Inicio</label>
                      <label><input type="checkbox" checked={edit.destacadoHome} onChange={updateEditing(p._id, 'destacadoHome')} /> Producto destacado en Inicio</label>
                    </div>
                  </div>
                )}

                <section className="product-images-panel" aria-label={`Fotos de ${p.nombre}`}>
                  <div className="product-images-panel__header">
                    <strong>Foto del producto / portada</strong>
                    <span>URL de imagen</span>
                  </div>
                  <div className="product-image-add">
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
                  {images.length ? (
                    <div className="product-thumb-grid">
                      {images.map((img) => (
                        <div key={img._id} className="product-thumb">
                          <img src={resolveAssetUrl(img.url)} alt="" />
                          <button type="button" title="Eliminar" onClick={() => removeImage(p, img._id)}>✕</button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="product-empty-note">Sin imágenes. Si está marcado en Inicio, se mostrará sin foto hasta que agregues una URL.</p>
                  )}
                </section>

                <footer className="product-actions">
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
                      Editar datos
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
                </footer>
              </article>
            );
          })}
        </section>
      )}
    </PageShell>
  );
}

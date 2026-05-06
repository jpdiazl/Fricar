import React, { useState } from 'react';
import api from '../api/client';
import PageShell from '../components/PageShell';

export default function Contacto() {
  const [form, setForm] = useState({ nombre: '', correo: '', telefono: '', mensaje: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [numero, setNumero] = useState('');

  function update(key) {
    return (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setNumero('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/contact', form);
      setNumero(data.numero);
      setForm({ nombre: '', correo: '', telefono: '', mensaje: '' });
    } catch (e) {
      setError(e?.response?.data?.error || 'No se pudo enviar tu requerimiento');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell
      title="Contacto"
      subtitle="Envíanos tu requerimiento y se generará un número automático para seguimiento."
      width="wide"
    >
      <form onSubmit={submit} className="prx-card prx-form" style={{ maxWidth: 720 }}>
        <label className="prx-label">Nombre</label>
        <input value={form.nombre} onChange={update('nombre')} className="prx-input" />

        <label className="prx-label">Correo</label>
        <input value={form.correo} onChange={update('correo')} className="prx-input" />

        <label className="prx-label">Teléfono</label>
        <input value={form.telefono} onChange={update('telefono')} className="prx-input" />

        <label className="prx-label">Mensaje</label>
        <textarea value={form.mensaje} onChange={update('mensaje')} rows={5} className="prx-input prx-textarea" />

        {error && <div className="prx-alert prx-alert--error">{error}</div>}
        {numero && (
          <div className="prx-alert prx-alert--success">
            Recibido ✅ Tu número de requerimiento es <b>{numero}</b>.
          </div>
        )}

        <button disabled={loading} className="prx-btn">{loading ? 'Enviando…' : 'Enviar'}</button>
      </form>
    </PageShell>
  );
}

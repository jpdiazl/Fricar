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
      subtitle="Cuéntanos qué necesitas y generaremos un número automático para hacer seguimiento de tu requerimiento."
      width="wide"
    >
      <section className="contact-layout" aria-label="Formulario y datos de contacto">
        <article className="contact-panel contact-panel--info">
          <span className="home-kicker">ASESORÍA COMERCIAL</span>
          <h2>Estamos listos para ayudarte</h2>
          <p>
            Escríbenos para solicitudes de productos, abastecimiento, papelería, oficina o requerimientos especiales.
            Nuestro equipo revisará tu mensaje y te responderá con el seguimiento correspondiente.
          </p>

          <div className="contact-info-grid">
            <div>
              <strong>Correo ventas</strong>
              <span>ventaschile@fricar.cl</span>
            </div>
            <div>
              <strong>Logística</strong>
              <span>logistica@fricar.cl</span>
            </div>
            <div>
              <strong>Teléfono</strong>
              <span>+56 9 8234 6827</span>
            </div>
            <div>
              <strong>Ubicación</strong>
              <span>Manzana 14 Galpón 7, Barrio Industrial Zofri, Iquique</span>
            </div>
          </div>
        </article>

        <form onSubmit={submit} className="contact-panel contact-form" aria-label="Enviar requerimiento">
          <div className="contact-form__grid">
            <div>
              <label className="prx-label" htmlFor="contact-nombre">Nombre</label>
              <input id="contact-nombre" value={form.nombre} onChange={update('nombre')} className="prx-input" autoComplete="name" />
            </div>
            <div>
              <label className="prx-label" htmlFor="contact-correo">Correo</label>
              <input id="contact-correo" type="email" value={form.correo} onChange={update('correo')} className="prx-input" autoComplete="email" />
            </div>
            <div className="contact-form__full">
              <label className="prx-label" htmlFor="contact-telefono">Teléfono</label>
              <input id="contact-telefono" value={form.telefono} onChange={update('telefono')} className="prx-input" autoComplete="tel" />
            </div>
            <div className="contact-form__full">
              <label className="prx-label" htmlFor="contact-mensaje">Mensaje</label>
              <textarea id="contact-mensaje" value={form.mensaje} onChange={update('mensaje')} rows={6} className="prx-input prx-textarea" />
            </div>
          </div>

          {error && <div className="prx-alert prx-alert--error">{error}</div>}
          {numero && (
            <div className="prx-alert prx-alert--success">
              Recibido ✅ Tu número de requerimiento es <b>{numero}</b>.
            </div>
          )}

          <button disabled={loading} className="prx-btn contact-form__submit">
            {loading ? 'Enviando…' : 'Enviar requerimiento'}
          </button>
        </form>
      </section>
    </PageShell>
  );
}

import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import PageShell from '../../components/PageShell';

const STATUS_OPTIONS = [
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'ENVIADA', label: 'Enviada' },
  { value: 'EN_PROCESO', label: 'En proceso' },
  { value: 'RESUELTA', label: 'Resuelta' },
  { value: 'CERRADA', label: 'Cerrada' }
];

export default function VendorQuotes() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/quotes');
      setQuotes(data.quotes || []);
    } catch (e) {
      setError(e?.response?.data?.error || 'No se pudieron cargar las cotizaciones');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(quoteId, estado) {
    setUpdatingId(quoteId);
    setError('');
    try {
      const { data } = await api.patch(`/api/quotes/${quoteId}/status`, { estado });
      setQuotes((prev) => prev.map((q) => q._id === quoteId ? data.quote : q));
    } catch (e) {
      setError(e?.response?.data?.error || 'No se pudo actualizar el estado');
    } finally {
      setUpdatingId(null);
    }
  }

  async function send(quoteId) {
    setSending(true);
    setError('');
    try {
      if (pdfFile) {
        const fd = new FormData();
        fd.append('notasVendedor', notes || '');
        fd.append('message', message || '');
        fd.append('pdf', pdfFile);
        await api.post(`/api/quotes/${quoteId}/send-email`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post(`/api/quotes/${quoteId}/send-email`, { notasVendedor: notes, message });
      }
      setOpenId(null);
      setNotes('');
      setMessage('');
      setPdfFile(null);
      await load();
    } catch (e) {
      setError(e?.response?.data?.error || 'No se pudo enviar el correo');
    } finally {
      setSending(false);
    }
  }

  return (
    <PageShell title="Cotizaciones" subtitle="Gestiona solicitudes, estados y respuestas por correo" width="wide">
      {loading && <div>Cargando…</div>}
      {error && <div className="prx-alert prx-alert--error">{error}</div>}

      <div className="prx-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))' }}>
        {quotes.map((q) => (
          <div key={q._id} className="prx-card quote-card">
            <div className="quote-card__head">
              <div className="quote-card__brand">
                <img src="/logo-fricar.png" alt="FRICAR" className="quote-card__logo" />
                <div>
                  <div className="quote-card__number">{q.numero}</div>
                  <div className="quote-card__date">{new Date(q.createdAt).toLocaleString()}</div>
                </div>
              </div>
              <span className={`status-pill status-pill--${q.estado}`}>{statusLabel(q.estado)}</span>
            </div>

            <div className="quote-card__client">
              <b>Cliente:</b> {q.clienteId?.nombre} — {q.clienteId?.correo}
            </div>

            <ul className="quote-card__items">
              {q.items.map((it, idx) => (
                <li key={idx}>
                  {it.productId?.nombre} — Cantidad: <b>{it.cantidad}</b>
                </li>
              ))}
            </ul>

            <label className="prx-label">Estado de cotización</label>
            <select
              value={q.estado}
              disabled={updatingId === q._id}
              onChange={(e) => updateStatus(q._id, e.target.value)}
              className="prx-input"
            >
              {STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>

            <button
              onClick={() => {
                const next = openId === q._id ? null : q._id;
                setOpenId(next);
                setNotes('');
                setMessage('');
                setPdfFile(null);
              }}
              className="prx-btnSecondary"
            >
              {openId === q._id ? 'Cerrar' : 'Responder por correo'}
            </button>

            {openId === q._id && (
              <div style={{ marginTop: 10 }}>
                <label className="prx-label">Mensaje (opcional)</label>
                <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} className="prx-input prx-textarea" />

                <label className="prx-label">Notas del vendedor (opcional)</label>
                <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className="prx-input prx-textarea" />

                <label className="prx-label">Adjuntar PDF (opcional)</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  className="prx-input"
                />
                {pdfFile && (
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
                    Archivo seleccionado: <b>{pdfFile.name}</b>
                  </div>
                )}

                <button disabled={sending} onClick={() => send(q._id)} className="prx-btn">
                  {sending ? 'Enviando…' : 'Enviar correo'}
                </button>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
                  *Configura SMTP en el backend para que el correo se envíe realmente.
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {!loading && !error && quotes.length === 0 && <div>No hay cotizaciones.</div>}
    </PageShell>
  );
}

function statusLabel(estado) {
  return STATUS_OPTIONS.find((option) => option.value === estado)?.label || estado;
}

import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import PageShell from '../../components/PageShell';

export default function VendorQuotes() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [sending, setSending] = useState(false);

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
    <PageShell title="Cotizaciones" subtitle="Panel vendedor" width="wide">
      {loading && <div>Cargando…</div>}
      {error && <div className="prx-alert prx-alert--error">{error}</div>}

      <div className="prx-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))' }}>
        {quotes.map((q) => (
          <div key={q._id} className="prx-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ fontWeight: 800 }}>{q.numero}</div>
              <span style={pill(q.estado)}>{q.estado}</span>
            </div>
            <div style={{ marginTop: 6, fontSize: 13, color: '#444' }}>
              <b>Cliente:</b> {q.clienteId?.nombre} — {q.clienteId?.correo}
            </div>
            <ul style={{ paddingLeft: 18 }}>
              {q.items.map((it, idx) => (
                <li key={idx} style={{ marginBottom: 6 }}>
                  {it.productId?.nombre} — Cantidad: <b>{it.cantidad}</b>
                </li>
              ))}
            </ul>

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
                  <div style={{ fontSize: 12, color: '#444', marginTop: 6 }}>
                    Archivo seleccionado: <b>{pdfFile.name}</b>
                  </div>
                )}

                <button disabled={sending} onClick={() => send(q._id)} className="prx-btn">
                  {sending ? 'Enviando…' : 'Enviar correo'}
                </button>
                <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>
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

function pill(estado) {
  const map = {
    PENDIENTE: { background: '#fff8e1', border: '1px solid #ffe0a3' },
    ENVIADA: { background: '#e9ffe7', border: '1px solid #b9f5b3' },
    CERRADA: { background: '#eee', border: '1px solid #ddd' }
  };
  return {
    fontSize: 12,
    padding: '4px 10px',
    borderRadius: 999,
    ...map[estado]
  };
}

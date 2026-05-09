import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import PageShell from '../../components/PageShell';
import Loader from '../../components/Loader';

export default function VendorContacts() {
  const [items, setItems] = useState([]);
  // Por defecto ocultamos los casos ya resueltos, para que el panel quede limpio.
  const [filter, setFilter] = useState('ABIERTOS'); // ABIERTOS | TODOS | NUEVO | EN PROCESO | SOLUCIONADO
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [solving, setSolving] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/contact');
      setItems(data.items || []);
    } catch (e) {
      setError(e?.response?.data?.error || 'No se pudieron cargar los requerimientos');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const counts = items.reduce(
    (acc, it) => {
      const key = it.estado || 'NUEVO';
      acc[key] = (acc[key] || 0) + 1;
      acc.TODOS += 1;
      if (key !== 'SOLUCIONADO' && key !== 'CERRADO') acc.ABIERTOS += 1;
      return acc;
    },
    { TODOS: 0, ABIERTOS: 0, 'NUEVO': 0, 'EN PROCESO': 0, 'SOLUCIONADO': 0, 'CERRADO': 0 }
  );

  const visibleItems = items.filter((it) => {
    if (filter === 'TODOS') return true;
    if (filter === 'ABIERTOS') return it.estado !== 'SOLUCIONADO' && it.estado !== 'CERRADO';
    return it.estado === filter;
  });

  async function send(id) {
    setSending(true);
    setError('');
    try {
      if (pdfFile) {
        const fd = new FormData();
        fd.append('notasVendedor', notes || '');
        fd.append('message', message || '');
        fd.append('subject', subject || '');
        fd.append('pdf', pdfFile);
        await api.post(`/api/contact/${id}/send-email`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post(`/api/contact/${id}/send-email`, { notasVendedor: notes, message, subject });
      }
      setOpenId(null);
      setNotes('');
      setMessage('');
      setSubject('');
      setPdfFile(null);
      await load();
    } catch (e) {
      setError(e?.response?.data?.error || 'No se pudo enviar el correo');
    } finally {
      setSending(false);
    }
  }

  async function solve(id) {
    setSolving(true);
    setError('');
    try {
      await api.patch(`/api/contact/${id}/solve`);
      await load();
    } catch (e) {
      setError(e?.response?.data?.error || 'No se pudo marcar como solucionado');
    } finally {
      setSolving(false);
    }
  }

  return (
    <PageShell title="Requerimientos" subtitle="Panel vendedor" width="wide">
      {loading && <Loader label="Cargando requerimientos..." compact />}
      {error && <div className="prx-alert prx-alert--error">{error}</div>}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <FilterBtn active={filter === 'ABIERTOS'} onClick={() => setFilter('ABIERTOS')}>
          Activos ({counts.ABIERTOS})
        </FilterBtn>
        <FilterBtn active={filter === 'TODOS'} onClick={() => setFilter('TODOS')}>
          Todos ({counts.TODOS})
        </FilterBtn>
        <FilterBtn active={filter === 'NUEVO'} onClick={() => setFilter('NUEVO')}>
          Pendientes ({counts['NUEVO']})
        </FilterBtn>
        <FilterBtn active={filter === 'EN PROCESO'} onClick={() => setFilter('EN PROCESO')}>
          En proceso ({counts['EN PROCESO']})
        </FilterBtn>
        <FilterBtn active={filter === 'SOLUCIONADO'} onClick={() => setFilter('SOLUCIONADO')}>
          Solucionados ({counts['SOLUCIONADO']})
        </FilterBtn>
      </div>

      <div className="prx-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))' }}>
        {visibleItems.map((it) => (
          <div key={it._id} className="prx-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ fontWeight: 800 }}>{it.numero}</div>
              <span style={pill(it.estado)}>{it.estado}</span>
            </div>

            {it.estado === 'SOLUCIONADO' && it.solvedAt && (
              <div style={{ marginTop: 6, fontSize: 12, color: '#666' }}>
                Cerrado el: <b>{formatDateTime(it.solvedAt)}</b>
              </div>
            )}

            <div style={{ marginTop: 6, fontSize: 13, color: '#444' }}>
              <b>Contacto:</b> {it.nombre} — {it.correo}{it.telefono ? ` — ${it.telefono}` : ''}
            </div>

            <div style={{ marginTop: 10, fontSize: 13, color: '#222', whiteSpace: 'pre-wrap' }}>
              {it.mensaje}
            </div>

            {/* Acciones */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
              {/* No permitir responder si ya está solucionado */}
              {it.estado !== 'SOLUCIONADO' && it.estado !== 'CERRADO' && (
                <button
                  onClick={() => {
                    const next = openId === it._id ? null : it._id;
                    setOpenId(next);
                    setNotes('');
                    setMessage('');
                    setSubject('');
                    setPdfFile(null);
                  }}
                  className="prx-btnSecondary"
                >
                  {openId === it._id ? 'Cerrar' : 'Responder por correo'}
                </button>
              )}

              {/* Marcar como solucionado: solo cuando ya se tomó el caso */}
              {it.estado === 'EN PROCESO' && (
                <button
                  disabled={solving}
                  onClick={() => solve(it._id)}
                  className="prx-btnSecondary"
                >
                  {solving ? 'Marcando…' : 'Marcar como solucionado'}
                </button>
              )}
            </div>

            {openId === it._id && (
              <div style={{ marginTop: 10 }}>
                <label className="prx-label">Asunto (opcional)</label>
                <input value={subject} onChange={(e) => setSubject(e.target.value)} className="prx-input" />

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

                <button disabled={sending} onClick={() => send(it._id)} className="prx-btn">
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

      {!loading && !error && visibleItems.length === 0 && <div>No hay requerimientos para este filtro.</div>}
    </PageShell>
  );
}

function FilterBtn({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={active ? 'prx-btn' : 'prx-btnSecondary'}
      style={{ padding: '8px 12px', borderRadius: 999 }}
    >
      {children}
    </button>
  );
}

function formatDateTime(date) {
  try {
    const d = new Date(date);
    return d.toLocaleString();
  } catch {
    return String(date);
  }
}

function pill(estado) {
  const map = {
    'NUEVO': { background: '#fff8e1', border: '1px solid #ffe0a3' },
    'EN PROCESO': { background: '#e9f3ff', border: '1px solid #b7d7ff' },
    'SOLUCIONADO': { background: '#e8f7ee', border: '1px solid #bfe8cf' },
    'CERRADO': { background: '#eee', border: '1px solid #ddd' }
  };
  return {
    fontSize: 12,
    padding: '4px 10px',
    borderRadius: 999,
    ...(map[estado] || { background: '#eee', border: '1px solid #ddd' })
  };
}

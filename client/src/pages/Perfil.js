import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import PageShell from '../components/PageShell';

export default function Perfil() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/api/quotes/my');
        if (alive) setQuotes(data.quotes || []);
      } catch (e) {
        if (alive) setError(e?.response?.data?.error || 'No se pudieron cargar tus cotizaciones');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <PageShell title="Perfil" width="wide">
      {user && (
        <div className="prx-card" style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 800 }}>{user.nombre}</div>
          <div className="prx-kv"><b>RUT:</b> {user.rut}</div>
          <div className="prx-kv"><b>Correo:</b> {user.correo}</div>
          {user.telefono && <div className="prx-kv"><b>Teléfono:</b> {user.telefono}</div>}
          <div className="prx-kv"><b>Tipo:</b> {user.tipoCliente}</div>
        </div>
      )}

      <h2 style={{ marginTop: 0 }}>Mis solicitudes de cotización</h2>

      {loading && <div>Cargando…</div>}
      {error && <div className="prx-alert prx-alert--error">{error}</div>}

      <div className="prx-grid prx-grid--cards">
        {quotes.map((q) => (
          <div key={q._id} className="prx-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ fontWeight: 800 }}>{q.numero}</div>
              <span style={pill(q.estado)}>{q.estado}</span>
            </div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>
              {new Date(q.createdAt).toLocaleString()}
            </div>

            <ul style={{ paddingLeft: 18 }}>
              {q.items.map((it, idx) => (
                <li key={idx} style={{ marginBottom: 6 }}>
                  {it.productId?.nombre || 'Producto'} — Cantidad: <b>{it.cantidad}</b>
                </li>
              ))}
            </ul>

            {q.notasVendedor && (
              <div style={{ marginTop: 8, fontSize: 13, color: '#444' }}>
                <b>Notas:</b> {q.notasVendedor}
              </div>
            )}
          </div>
        ))}
      </div>

      {!loading && !error && quotes.length === 0 && <div>No tienes cotizaciones aún.</div>}
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
    ...map[estado],
  };
}

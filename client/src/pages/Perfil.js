import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import PageShell from '../components/PageShell';
import Loader from '../components/Loader';

const STATUS_LABELS = {
  PENDIENTE: 'Pendiente',
  ENVIADA: 'Enviada',
  EN_PROCESO: 'En proceso',
  RESUELTA: 'Resuelta',
  CERRADA: 'Cerrada'
};

export default function Perfil() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingPassword, setSavingPassword] = useState(false);

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

  async function changePassword(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('La nueva contraseña y la confirmación no coinciden');
      return;
    }
    setSavingPassword(true);
    try {
      await api.put('/api/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess('Contraseña actualizada correctamente');
    } catch (e) {
      setError(e?.response?.data?.error || 'No se pudo cambiar la contraseña');
    } finally {
      setSavingPassword(false);
    }
  }

  function updatePassword(key) {
    return (e) => setPasswordForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  return (
    <PageShell title="Perfil" width="wide">
      {error && <div className="prx-alert prx-alert--error">{error}</div>}
      {success && <div className="prx-alert prx-alert--success">{success}</div>}

      {user && (
        <div className="profile-layout">
          <div className="prx-card">
            <div style={{ fontWeight: 900 }}>{user.nombre}</div>
            <div className="prx-kv"><b>RUT:</b> {user.rut}</div>
            <div className="prx-kv"><b>Correo:</b> {user.correo}</div>
            {user.telefono && <div className="prx-kv"><b>Teléfono:</b> {user.telefono}</div>}
            <div className="prx-kv"><b>Tipo:</b> {user.tipoCliente}</div>
          </div>

          <form className="prx-card" onSubmit={changePassword}>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>Cambiar contraseña</div>
            <label className="prx-label">Contraseña actual</label>
            <input type="password" value={passwordForm.currentPassword} onChange={updatePassword('currentPassword')} className="prx-input" />
            <label className="prx-label">Nueva contraseña</label>
            <input type="password" value={passwordForm.newPassword} onChange={updatePassword('newPassword')} className="prx-input" />
            <label className="prx-label">Confirmar nueva contraseña</label>
            <input type="password" value={passwordForm.confirmPassword} onChange={updatePassword('confirmPassword')} className="prx-input" />
            <button className="prx-btn" disabled={savingPassword}>{savingPassword ? 'Guardando…' : 'Guardar contraseña'}</button>
          </form>
        </div>
      )}

      <h2 style={{ marginTop: 18 }}>Mis solicitudes de cotización</h2>

      {loading && <Loader label="Cargando perfil..." compact />}

      <div className="prx-grid prx-grid--cards">
        {quotes.map((q) => (
          <div key={q._id} className="prx-card quote-card">
            <div className="quote-card__head">
              <div className="quote-card__brand">
                <img src="/logo-fricar.png" alt="FRICAR" className="quote-card__logo" />
                <div className="quote-card__number">{q.numero}</div>
              </div>
              <span className={`status-pill status-pill--${q.estado}`}>{STATUS_LABELS[q.estado] || q.estado}</span>
            </div>
            <div className="quote-card__date">{new Date(q.createdAt).toLocaleString()}</div>

            <ul className="quote-card__items">
              {q.items.map((it, idx) => (
                <li key={idx}>
                  {it.productId?.nombre || 'Producto'} — Cantidad: <b>{it.cantidad}</b>
                </li>
              ))}
            </ul>

            {q.notasVendedor && (
              <div style={{ marginTop: 8, fontSize: 13, color: 'var(--muted)' }}>
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

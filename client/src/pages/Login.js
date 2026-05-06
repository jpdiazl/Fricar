import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { formatRut } from '../utils/rut';
import PageShell from '../components/PageShell';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(rut, password);
      nav('/');
    } catch (e) {
      setError(e?.response?.data?.error || 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell title="Ingresar" width="narrow">
      <form onSubmit={onSubmit} className="prx-card prx-form">
        <label className="prx-label">RUT</label>
        <input
          value={rut}
          onChange={(e) => setRut(formatRut(e.target.value))}
          placeholder="11.111.111-1"
          inputMode="text"
          autoComplete="username"
          className="prx-input"
        />

        <label className="prx-label">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="prx-input"
          autoComplete="current-password"
        />

        {error && <div className="prx-alert prx-alert--error">{error}</div>}

        <button disabled={loading} className="prx-btn">{loading ? 'Ingresando…' : 'Ingresar'}</button>
        <p style={{ marginBottom: 0, marginTop: 12, fontSize: 14 }}>
          ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
        </p>
      </form>
    </PageShell>
  );
}

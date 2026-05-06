import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { formatRut } from '../utils/rut';
import PageShell from '../components/PageShell';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();

  const [tipoCliente, setTipoCliente] = useState('NATURAL');
  const [form, setForm] = useState({
    rut: '',
    password: '',
    nombre: '',
    correo: '',
    telefono: '',
    razonSocial: '',
    giro: '',
    direccion: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const showEmpresa = useMemo(() => tipoCliente === 'EMPRESA', [tipoCliente]);

  function update(key) {
    return (e) => {
      const v = e.target.value;
      setForm((prev) => ({
        ...prev,
        [key]: key === 'rut' ? formatRut(v) : v
      }));
    };
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ ...form, tipoCliente });
      nav('/');
    } catch (e) {
      setError(e?.response?.data?.error || 'No se pudo registrar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell title="Registro" width="narrow">
      <form onSubmit={onSubmit} className="prx-card prx-form">
        <label className="prx-label">Tipo de cliente</label>
        <select value={tipoCliente} onChange={(e) => setTipoCliente(e.target.value)} className="prx-input">
          <option value="NATURAL">Cliente Natural</option>
          <option value="EMPRESA">Cliente Empresa</option>
        </select>

        <label className="prx-label">RUT</label>
        <input value={form.rut} onChange={update('rut')} className="prx-input" placeholder="11.111.111-1" />

        <label className="prx-label">Contraseña</label>
        <input type="password" value={form.password} onChange={update('password')} className="prx-input" />

        <label className="prx-label">Nombre</label>
        <input value={form.nombre} onChange={update('nombre')} className="prx-input" />

        <label className="prx-label">Correo</label>
        <input value={form.correo} onChange={update('correo')} className="prx-input" />

        <label className="prx-label">Teléfono</label>
        <input value={form.telefono} onChange={update('telefono')} className="prx-input" />

        {showEmpresa && (
          <>
            <hr className="prx-divider" />
            <label className="prx-label">Razón Social</label>
            <input value={form.razonSocial} onChange={update('razonSocial')} className="prx-input" />

            <label className="prx-label">Giro</label>
            <input value={form.giro} onChange={update('giro')} className="prx-input" />

            <label className="prx-label">Dirección</label>
            <input value={form.direccion} onChange={update('direccion')} className="prx-input" />
          </>
        )}

        {error && <div className="prx-alert prx-alert--error">{error}</div>}

        <button disabled={loading} className="prx-btn">{loading ? 'Creando cuenta…' : 'Crear cuenta'}</button>
        <p style={{ marginBottom: 0, marginTop: 12, fontSize: 14 }}>
          ¿Ya tienes cuenta? <Link to="/login">Ingresar</Link>
        </p>
      </form>
    </PageShell>
  );
}

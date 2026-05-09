import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import PageShell from '../../components/PageShell';
import { formatRut } from '../../utils/rut';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwords, setPasswords] = useState({});

  const [createForm, setCreateForm] = useState({ rut: '', password: '', role: 'VENDEDOR', nombre: '', correo: '', telefono: '' });
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/users');
      setUsers(data.users || []);
    } catch (e) {
      setError(e?.response?.data?.error || 'No se pudieron cargar usuarios');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function updateUser(id, payload, message = 'Usuario actualizado') {
    setError('');
    setSuccess('');
    try {
      await api.put(`/api/users/${id}`, payload);
      setSuccess(message);
      await load();
    } catch (e) {
      setError(e?.response?.data?.error || 'No se pudo actualizar');
    }
  }

  async function changePassword(id) {
    const password = passwords[id] || '';
    if (password.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    await updateUser(id, { password }, 'Contraseña actualizada');
    setPasswords((prev) => ({ ...prev, [id]: '' }));
  }

  async function deleteUser(id, name) {
    const ok = window.confirm(`¿Eliminar al usuario ${name}? Esta acción no se puede deshacer.`);
    if (!ok) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/api/users/${id}`);
      setSuccess('Usuario eliminado');
      await load();
    } catch (e) {
      setError(e?.response?.data?.error || 'No se pudo eliminar');
    }
  }

  function updateCreate(key) {
    return (e) => {
      const v = e.target.value;
      setCreateForm((prev) => ({
        ...prev,
        [key]: key === 'rut' ? formatRut(v) : v
      }));
    };
  }

  async function create(e) {
    e.preventDefault();
    setCreating(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/api/users', createForm);
      setCreateForm({ rut: '', password: '', role: 'VENDEDOR', nombre: '', correo: '', telefono: '' });
      setSuccess('Usuario creado');
      await load();
    } catch (e) {
      setError(e?.response?.data?.error || 'No se pudo crear');
    } finally {
      setCreating(false);
    }
  }

  return (
    <PageShell title="Usuarios" subtitle="Administra roles, contraseñas y eliminación de cuentas" width="wide">
      {error && <div className="prx-alert prx-alert--error">{error}</div>}
      {success && <div className="prx-alert prx-alert--success">{success}</div>}

      <form onSubmit={create} className="prx-card" style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>Crear Vendedor / Admin</div>
        <div className="prx-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          <div>
            <label className="prx-label">RUT</label>
            <input value={createForm.rut} onChange={updateCreate('rut')} className="prx-input" placeholder="11.111.111-1" />
          </div>
          <div>
            <label className="prx-label">Contraseña</label>
            <input type="password" value={createForm.password} onChange={updateCreate('password')} className="prx-input" />
          </div>
          <div>
            <label className="prx-label">Rol</label>
            <select value={createForm.role} onChange={updateCreate('role')} className="prx-input">
              <option value="VENDEDOR">VENDEDOR</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          <div>
            <label className="prx-label">Nombre</label>
            <input value={createForm.nombre} onChange={updateCreate('nombre')} className="prx-input" />
          </div>
          <div>
            <label className="prx-label">Correo</label>
            <input value={createForm.correo} onChange={updateCreate('correo')} className="prx-input" />
          </div>
          <div>
            <label className="prx-label">Teléfono</label>
            <input value={createForm.telefono} onChange={updateCreate('telefono')} className="prx-input" />
          </div>
        </div>
        <button disabled={creating} className="prx-btn">{creating ? 'Creando…' : 'Crear'}</button>
      </form>

      {loading && <div>Cargando…</div>}

      <div className="prx-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))' }}>
        {users.map((u) => (
          <div key={u._id} className="prx-card user-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ fontWeight: 900 }}>{u.nombre}</div>
              <span className={`role-pill role-pill--${u.role}`}>{u.role}</span>
            </div>
            <div className="prx-kv">RUT: {u.rut}</div>
            <div className="prx-kv">{u.correo}</div>

            <label className="prx-label">Cambiar rol</label>
            <select value={u.role} onChange={(e) => updateUser(u._id, { role: e.target.value }, 'Rol actualizado')} className="prx-input">
              <option value="CLIENTE">CLIENTE</option>
              <option value="VENDEDOR">VENDEDOR</option>
              <option value="ADMIN">ADMIN</option>
            </select>

            <label className="prx-label">Nueva contraseña</label>
            <div className="inline-actions">
              <input
                type="password"
                value={passwords[u._id] || ''}
                onChange={(e) => setPasswords((prev) => ({ ...prev, [u._id]: e.target.value }))}
                className="prx-input"
                placeholder="Mínimo 6 caracteres"
              />
              <button type="button" className="prx-btnSecondary" onClick={() => changePassword(u._id)}>Cambiar</button>
            </div>

            {u.tipoCliente && <div className="prx-kv" style={{ marginTop: 8 }}>Tipo cliente: {u.tipoCliente}</div>}

            <button type="button" className="prx-btnDanger" onClick={() => deleteUser(u._id, u.nombre)}>
              Eliminar usuario
            </button>
          </div>
        ))}
      </div>

      {!loading && users.length === 0 && <div>No hay usuarios.</div>}
    </PageShell>
  );
}

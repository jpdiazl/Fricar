import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import PageShell from '../../components/PageShell';
import { formatRut } from '../../utils/rut';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  async function updateRole(id, role) {
    setError('');
    try {
      await api.put(`/api/users/${id}`, { role });
      await load();
    } catch (e) {
      setError(e?.response?.data?.error || 'No se pudo actualizar');
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
    try {
      await api.post('/api/users', createForm);
      setCreateForm({ rut: '', password: '', role: 'VENDEDOR', nombre: '', correo: '', telefono: '' });
      await load();
    } catch (e) {
      setError(e?.response?.data?.error || 'No se pudo crear');
    } finally {
      setCreating(false);
    }
  }

  return (
    <PageShell title="Usuarios" width="wide">
      {error && <div className="prx-alert prx-alert--error">{error}</div>}

      <form onSubmit={create} className="prx-card" style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 800, marginBottom: 10 }}>Crear Vendedor / Admin</div>
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
          <div key={u._id} className="prx-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ fontWeight: 800 }}>{u.nombre}</div>
              <span style={pill(u.role)}>{u.role}</span>
            </div>
            <div style={{ fontSize: 12, color: '#666' }}>RUT: {u.rut}</div>
            <div style={{ fontSize: 13, color: '#444', marginTop: 6 }}>{u.correo}</div>

            <label className="prx-label">Cambiar rol</label>
            <select value={u.role} onChange={(e) => updateRole(u._id, e.target.value)} className="prx-input">
              <option value="CLIENTE">CLIENTE</option>
              <option value="VENDEDOR">VENDEDOR</option>
              <option value="ADMIN">ADMIN</option>
            </select>

            {u.tipoCliente && <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>Tipo cliente: {u.tipoCliente}</div>}
          </div>
        ))}
      </div>

      {!loading && users.length === 0 && <div>No hay usuarios.</div>}
    </PageShell>
  );
}

function pill(role) {
  const map = {
    CLIENTE: { background: '#fff8e1', border: '1px solid #ffe0a3' },
    VENDEDOR: { background: '#e1f2ff', border: '1px solid #a3d8ff' },
    ADMIN: { background: '#eee', border: '1px solid #ddd' }
  };
  return { fontSize: 12, padding: '4px 10px', borderRadius: 999, ...map[role] };
}

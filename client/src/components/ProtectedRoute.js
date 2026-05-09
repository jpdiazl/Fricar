import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loader from './Loader';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) return <Loader label="Preparando sesión..." />;
  if (!user) return <Navigate to="/login" replace />;

  if (roles && roles.length && !roles.includes(user.role)) {
    return (
      <div className="prx-page">
        <div className="prx-container prx-container--wide">
          <div className="prx-card">
            <div style={{ fontWeight: 800, marginBottom: 6 }}>No tienes permiso para ver esta sección</div>
            <div style={{ color: '#555', fontSize: 14 }}>
              Tu rol actual es <b>{user.role}</b>. Puedes volver al <Link to="/">inicio</Link>.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

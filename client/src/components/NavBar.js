import React, { useEffect, useMemo, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBranding } from '../contexts/BrandingContext';

const linkStyle = ({ isActive }) => ({
  textDecoration: 'none',
  padding: '6px 10px',
  borderRadius: 10,
  color: isActive ? 'var(--onPrimary)' : 'var(--text)',
  background: isActive ? 'var(--primary)' : 'transparent'
});

export default function NavBar() {
  const { user, logout } = useAuth();
  const { companyName, logoUrl } = useBranding();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the mobile menu when resizing to desktop.
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 860) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const navLinks = useMemo(() => (
    <>
      <NavLink to="/catalogo" style={linkStyle} onClick={() => setMobileOpen(false)}>Catálogo</NavLink>
      <NavLink to="/contacto" style={linkStyle} onClick={() => setMobileOpen(false)}>Contacto</NavLink>
      <NavLink to="/cotizar" style={linkStyle} onClick={() => setMobileOpen(false)}>Cotizar</NavLink>
      {user?.role === 'CLIENTE' && <NavLink to="/perfil" style={linkStyle} onClick={() => setMobileOpen(false)}>Perfil</NavLink>}

      {['VENDEDOR', 'ADMIN'].includes(user?.role) && (
        <>
          <NavLink to="/vendedor/cotizaciones" style={linkStyle} onClick={() => setMobileOpen(false)}>Cotizaciones</NavLink>
          <NavLink to="/vendedor/requerimientos" style={linkStyle} onClick={() => setMobileOpen(false)}>Requerimientos</NavLink>
        </>
      )}

      {user?.role === 'ADMIN' && (
        <>
          <NavLink to="/admin" style={linkStyle} onClick={() => setMobileOpen(false)}>Dashboard</NavLink>
          <NavLink to="/admin/productos" style={linkStyle} onClick={() => setMobileOpen(false)}>Productos</NavLink>
          <NavLink to="/admin/usuarios" style={linkStyle} onClick={() => setMobileOpen(false)}>Usuarios</NavLink>
        </>
      )}
    </>
  ), [user]);

  const authLinks = useMemo(() => (
    !user ? (
      <>
        <NavLink to="/login" style={linkStyle} onClick={() => setMobileOpen(false)}>Ingresar</NavLink>
        <NavLink to="/registro" style={linkStyle} onClick={() => setMobileOpen(false)}>Registro</NavLink>
      </>
    ) : (
      <>
        <span className="fricar-navbar__user">{user.nombre} ({user.role})</span>
        <button className="fricar-btn" onClick={() => { setMobileOpen(false); logout(); }}>Salir</button>
      </>
    )
  ), [user, logout]);

  return (
    <header className="fricar-navbar">
      <div className="fricar-navbar__left">
        <Link to="/" className="fricar-brand">
          {logoUrl ? <img src={logoUrl} alt={companyName} className="fricar-brand__logo" /> : null}
          <div className="fricar-brand__name">{companyName}</div>
        </Link>
        <nav className="fricar-navbar__links">
          {navLinks}
        </nav>
      </div>

      <div className="fricar-navbar__right">
        {authLinks}

        {/* Mobile toggle */}
        <button
          type="button"
          className="fricar-navbar__toggle"
          aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {/* simple hamburger */}
          <span className="fricar-navbar__toggleBars" />
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="fricar-navbar__mobile">
          <div className="fricar-navbar__mobileSection">
            {navLinks}
          </div>
          <div className="fricar-navbar__mobileSection" style={{ paddingTop: 10, borderTop: '1px solid var(--border)' }}>
            {authLinks}
          </div>
        </div>
      )}
    </header>
  );
}

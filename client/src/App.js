import React from 'react';
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Catalogo from './pages/Catalogo';
import Cotizar from './pages/Cotizar';
import Perfil from './pages/Perfil';
import Contacto from './pages/Contacto';

import VendorQuotes from './pages/vendor/VendorQuotes';
import VendorContacts from './pages/vendor/VendorContacts';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminUsers from './pages/admin/AdminUsers';

export default function App() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/cotizar" element={<Cotizar />} />

        <Route
          path="/perfil"
          element={
            <ProtectedRoute roles={["CLIENTE"]}>
              <Perfil />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vendedor/cotizaciones"
          element={
            <ProtectedRoute roles={["VENDEDOR", "ADMIN"]}>
              <VendorQuotes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vendedor/requerimientos"
          element={
            <ProtectedRoute roles={["VENDEDOR", "ADMIN"]}>
              <VendorContacts />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/productos"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/usuarios"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<div style={{ padding: 24 }}>Página no encontrada</div>} />
      </Routes>
    </div>
  );
}

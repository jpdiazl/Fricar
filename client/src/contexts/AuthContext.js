import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('prx_token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadMe(t) {
    if (!t) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${t}` }
      });
      setUser(data.user);
    } catch {
      localStorage.removeItem('prx_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMe(token);
  }, [token]);

  async function login(rut, password) {
    const { data } = await api.post('/api/auth/login', { rut, password });
    localStorage.setItem('prx_token', data.token);
    setToken(data.token);
    return data.token;
  }

  async function register(payload) {
    const { data } = await api.post('/api/auth/register', payload);
    localStorage.setItem('prx_token', data.token);
    setToken(data.token);
    return data.token;
  }

  function logout() {
    localStorage.removeItem('prx_token');
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({ token, user, loading, login, register, logout, reload: () => loadMe(token) }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}

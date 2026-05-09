import React, { useEffect, useState } from 'react';

export default function GlobalLoader() {
  const [visible, setVisible] = useState(() => !window.sessionStorage.getItem('fricarSplashShown'));

  useEffect(() => {
    if (!visible) return undefined;
    const timer = window.setTimeout(() => {
      window.sessionStorage.setItem('fricarSplashShown', 'true');
      setVisible(false);
    }, 1550);
    return () => window.clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fricar-splash" role="status" aria-live="polite" aria-label="Cargando FRICAR">
      <div className="fricar-splash__orb fricar-splash__orb--one" aria-hidden="true" />
      <div className="fricar-splash__orb fricar-splash__orb--two" aria-hidden="true" />
      <div className="fricar-splash__card">
        <img src="/logo-fricar.png" alt="FRICAR" className="fricar-splash__logo" />
        <div className="fricar-splash__bar" aria-hidden="true"><span /></div>
        <p>Importamos lo que importa</p>
      </div>
    </div>
  );
}

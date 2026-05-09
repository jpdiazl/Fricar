import React, { useEffect, useState } from 'react';
import { subscribeGlobalLoading } from '../utils/loadingBus';

export default function GlobalLoader() {
  const [pending, setPending] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => subscribeGlobalLoading(setPending), []);

  useEffect(() => {
    let timer;
    if (pending > 0) {
      timer = window.setTimeout(() => setVisible(true), 120);
    } else {
      setVisible(false);
    }
    return () => window.clearTimeout(timer);
  }, [pending]);

  if (!visible) return null;

  return (
    <div className="fricar-global-loader" role="status" aria-live="polite" aria-label="Cargando contenido">
      <div className="fricar-global-loader__card">
        <span className="fricar-global-loader__spinner" aria-hidden="true" />
        <span>Cargando...</span>
      </div>
    </div>
  );
}

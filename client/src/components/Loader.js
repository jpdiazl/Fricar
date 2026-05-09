import React from 'react';

export default function Loader({ label = 'Cargando...', compact = false }) {
  return (
    <div className={compact ? 'fricar-loader fricar-loader--compact' : 'fricar-loader'} role="status" aria-live="polite">
      <span className="fricar-loader__mark" aria-hidden="true">
        <span />
      </span>
      <span>{label}</span>
    </div>
  );
}

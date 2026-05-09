import React from 'react';

/**
 * PageShell: contenedor consistente para todas las páginas.
 * - width: 'narrow' (auth/forms) | 'wide' (default) | 'full'
 */
export default function PageShell({ title, subtitle, width = 'wide', actions, children }) {
  return (
    <main className="prx-page">
      <div className="prx-page__backgroundOrb prx-page__backgroundOrb--left" aria-hidden="true" />
      <div className="prx-page__backgroundOrb prx-page__backgroundOrb--top" aria-hidden="true" />
      <div className="prx-page__backgroundDots" aria-hidden="true" />

      <div className={`prx-container prx-container--${width}`}>
        {(title || subtitle || actions) && (
          <header className="prx-pageHeader">
            <div>
              {title && <h1 className="prx-h1">{title}</h1>}
              {subtitle && <p className="prx-subtitle">{subtitle}</p>}
            </div>
            {actions ? <div className="prx-actions">{actions}</div> : null}
          </header>
        )}

        <section className="prx-content" aria-label={title || 'Contenido principal'}>{children}</section>
      </div>
    </main>
  );
}

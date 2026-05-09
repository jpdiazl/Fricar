import React from 'react';

const COMPANY = {
  nombre: 'FRICAR',
  slogan: 'Conectamos productos con propósito',
  historia:
    'Desde 1986 entregamos confianza y eficiencia en el abastecimiento de insumos para oficinas, alimentación y operaciones industriales en todo el norte de Chile.',
  direccion: 'Manzana 14, Galpón 7, Zona Franca Iquique, Chile',
  telefono: '+56 57 2392825 / 2392826 / 2392827',
  correo: 'fricar@fricar.cl',
  web: 'www.fricar.cl'
};

export default function Home() {
  return (
    <div className="prx-page">
      <div className="prx-container prx-container--wide">
        <header style={hero}>
          <div>
            <div style={kicker}>DESDE 1986</div>
            <h1 style={title}>{COMPANY.nombre}</h1>
            <p style={lead}>
              <b>{COMPANY.slogan}</b> — {COMPANY.historia}
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
              <a href="/catalogo" style={btn}>Ver catálogo</a>
              <a href="/cotizar" style={btnAlt}>Solicitar cotización</a>
              <a href="/contacto" style={btnAlt}>Enviar requerimiento</a>
            </div>
          </div>
          <div style={heroCard}>
            <img src="/logo-fricar.png" alt="FRICAR" style={heroLogo} />
            <div style={{ fontWeight: 950, marginBottom: 10, color: 'var(--primary)' }}>Contacto comercial</div>
            <div style={miniLine}><b>Dirección:</b> {COMPANY.direccion}</div>
            <div style={miniLine}><b>Teléfono:</b> {COMPANY.telefono}</div>
            <div style={miniLine}><b>Correo:</b> {COMPANY.correo}</div>
            <div style={{ ...miniLine, marginBottom: 0 }}><b>Web:</b> {COMPANY.web}</div>
          </div>
        </header>

        <div className="prx-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          <section className="prx-card">
            <h2 style={h2}>¿Qué hacemos?</h2>
            <p style={p}>
              Abastecemos con responsabilidad, eficiencia y cercanía, ofreciendo productos y soluciones de calidad a precios competitivos.
              Operamos desde Zona Franca de Iquique, con capacidad logística para atender oficinas, instituciones, faenas y operaciones industriales.
            </p>
            <p style={p}>
              Nuestro modelo es simple: tú solicitas, nosotros respondemos por correo con una propuesta clara y, si hace falta, adjuntando PDF.
            </p>
          </section>

          <section className="prx-card">
            <h2 style={h2}>Líneas de abastecimiento</h2>
            <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--muted)', lineHeight: 1.65 }}>
              <li><b>Papelería y oficina:</b> resmas, útiles, artículos escolares, limpieza y EPP.</li>
              <li><b>Alimentos para consumo humano:</b> arroz, fideos, azúcar, harina, aceites y huevos frescos.</li>
              <li><b>Alimentación animal:</b> insumos para mascotas, producción avícola y ganadera.</li>
            </ul>
          </section>
        </div>

        <section className="prx-card" style={{ marginTop: 16 }}>
          <h2 style={h2}>¿Cómo funciona?</h2>
          <ol style={{ margin: 0, paddingLeft: 18, color: 'var(--muted)', lineHeight: 1.7 }}>
            <li><b>Catálogo:</b> revisa productos y arma tu solicitud.</li>
            <li><b>Cotización:</b> el sistema genera un número automático CTZ.</li>
            <li><b>Respuesta:</b> un vendedor responde por correo con el detalle y PDF opcional.</li>
            <li><b>Seguimiento:</b> la cotización puede quedar pendiente, enviada, en proceso o resuelta.</li>
          </ol>
        </section>

        <section className="prx-card" style={{ marginTop: 16 }}>
          <h2 style={h2}>Nuestros pilares</h2>
          <div className="prx-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            <div style={pillCard}>
              <div style={pillTitle}>Cumplimiento comprobado</div>
              <div style={pillText}>Puntualidad, responsabilidad y trazabilidad en cada entrega.</div>
            </div>
            <div style={pillCard}>
              <div style={pillTitle}>Precios competitivos</div>
              <div style={pillText}>Importación directa y proveedores locales para optimizar costos sin sacrificar calidad.</div>
            </div>
            <div style={pillCard}>
              <div style={pillTitle}>Cercanía</div>
              <div style={pillText}>Trato humano y atención personalizada, con soluciones a medida.</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

const hero = {
  display: 'grid',
  gridTemplateColumns: '1.35fr .85fr',
  gap: 18,
  alignItems: 'stretch',
  marginBottom: 18,
  padding: '34px clamp(18px, 4vw, 36px)',
  borderRadius: 28,
  border: '1px solid var(--border)',
  background: 'linear-gradient(135deg,#f8fbff 0%,#eef4fb 62%,#ffffff 100%)',
  boxShadow: 'var(--shadow)'
};
const kicker = { display: 'inline-block', background: '#e9f1fb', color: 'var(--secondary)', padding: '8px 12px', borderRadius: 999, fontSize: 12, fontWeight: 950, letterSpacing: '.08em' };
const title = { margin: '12px 0 10px', fontSize: 'clamp(42px, 7vw, 72px)', lineHeight: .95, letterSpacing: '-.06em', color: 'var(--primary)' };
const lead = { marginTop: 0, color: 'var(--text)', fontSize: 17, lineHeight: 1.65, maxWidth: 720 };
const heroCard = { border: '1px solid var(--border)', borderRadius: 24, padding: 18, background: 'rgba(255,255,255,.85)', boxShadow: 'var(--shadowSoft)' };
const heroLogo = { width: 140, height: 92, objectFit: 'contain', display: 'block', marginBottom: 8 };
const miniLine = { fontSize: 13, color: 'var(--muted)', marginBottom: 8, lineHeight: 1.45 };
const h2 = { marginTop: 0, marginBottom: 10, color: 'var(--primary)', letterSpacing: '-.02em' };
const p = { marginTop: 0, color: 'var(--muted)', lineHeight: 1.65 };
const btn = { display: 'inline-block', padding: '11px 16px', borderRadius: 999, background: 'linear-gradient(135deg,var(--primary),var(--secondary))', color: '#fff', textDecoration: 'none', fontWeight: 900, boxShadow: '0 10px 20px rgba(29,59,124,.18)' };
const btnAlt = { ...btn, background: '#fff', color: 'var(--primary)', border: '1px solid var(--border)', boxShadow: 'none' };
const pillCard = { border: '1px solid var(--border)', borderRadius: 18, padding: 15, background: 'var(--surface2)' };
const pillTitle = { fontWeight: 950, marginBottom: 6, color: 'var(--primary)' };
const pillText = { fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 };

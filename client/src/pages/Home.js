import React from 'react';

// Datos base (puedes ajustarlos si cambia la información)
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
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <header style={hero}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: 1.8, color: '#555', fontWeight: 800 }}>DESDE 1986</div>
          <h1 style={{ margin: '6px 0 8px 0' }}>{COMPANY.nombre}</h1>
          <p style={{ marginTop: 0, color: '#333', fontSize: 16 }}>
            <b>{COMPANY.slogan}</b> — {COMPANY.historia}
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
            <a href="/catalogo" style={btn}>Ver catálogo</a>
            <a href="/cotizar" style={btnAlt}>Solicitar cotización</a>
            <a href="/contacto" style={btnAlt}>Enviar requerimiento</a>
          </div>
        </div>
        <div style={heroCard}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Contacto</div>
          <div style={miniLine}><b>Dirección:</b> {COMPANY.direccion}</div>
          <div style={miniLine}><b>Teléfono:</b> {COMPANY.telefono}</div>
          <div style={miniLine}><b>Correo:</b> {COMPANY.correo}</div>
          <div style={{ ...miniLine, marginBottom: 0 }}><b>Web:</b> {COMPANY.web}</div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        <section style={cardStyle}>
          <h2 style={h2}>¿Qué hacemos?</h2>
          <p style={p}>
            Abastecemos con responsabilidad, eficiencia y cercanía, ofreciendo productos y soluciones de calidad a precios competitivos.
            Operamos desde Zona Franca de Iquique, con capacidad logística para atender oficinas, instituciones, faenas y operaciones industriales.
          </p>
          <p style={p}>
            Nuestro modelo es simple: tú solicitas, nosotros respondemos por correo con una propuesta clara (y si hace falta, adjuntando PDF).
          </p>
        </section>

        <section style={cardStyle}>
          <h2 style={h2}>Líneas de abastecimiento</h2>
          <ul style={{ margin: 0, paddingLeft: 18, color: '#333' }}>
            <li><b>Papelería y oficina:</b> resmas, útiles, artículos escolares, materiales de limpieza y EPP.</li>
            <li><b>Alimentos para consumo humano:</b> arroz, fideos, azúcar, harina, aceites y huevos frescos.</li>
            <li><b>Alimentación animal:</b> insumos para mascotas, producción avícola y ganadera.</li>
          </ul>
        </section>
      </div>

      <section style={{ ...cardStyle, marginTop: 16 }}>
        <h2 style={h2}>¿Cómo funciona?</h2>
        <ol style={{ margin: 0, paddingLeft: 18 }}>
          <li><b>Catálogo:</b> revisa productos y arma tu solicitud.</li>
          <li><b>Cotización:</b> el sistema genera un número automático (CTZ-xxxxxx).</li>
          <li><b>Respuesta:</b> un vendedor responde por correo con el detalle (y PDF opcional).</li>
          <li><b>Requerimientos:</b> si es una consulta general, usa “Contacto” y tendrás tu número (REQ-xxxxxx).</li>
        </ol>
      </section>

      <section style={{ ...cardStyle, marginTop: 16 }}>
        <h2 style={h2}>Nuestros pilares</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
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
  );
}

const cardStyle = {
  border: '1px solid #eee',
  borderRadius: 16,
  padding: 16,
  background: '#fff'
};

const h2 = { marginTop: 0, marginBottom: 8 };
const p = { marginTop: 0, color: '#444' };

const btn = {
  display: 'inline-block',
  padding: '10px 14px',
  borderRadius: 12,
  background: '#111',
  color: '#fff',
  textDecoration: 'none'
};

const btnAlt = {
  ...btn,
  background: '#fff',
  color: '#111',
  border: '1px solid #ddd'
};

const hero = {
  display: 'grid',
  gridTemplateColumns: '1.4fr 1fr',
  gap: 16,
  alignItems: 'stretch',
  marginBottom: 16
};

const heroCard = {
  border: '1px solid #eee',
  borderRadius: 16,
  padding: 16,
  background: '#fff'
};

const miniLine = { fontSize: 13, color: '#333', marginBottom: 6 };

const pillCard = {
  border: '1px solid #eee',
  borderRadius: 16,
  padding: 14,
  background: '#fff'
};
const pillTitle = { fontWeight: 900, marginBottom: 6 };
const pillText = { fontSize: 13, color: '#444' };

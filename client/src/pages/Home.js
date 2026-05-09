import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import ProductImageCarousel from '../components/ProductImageCarousel';

const COMPANY = {
  nombre: 'FRICAR',
  slogan: 'Importamos lo que importa',
  direccion: 'Manzana 14 Galpón 7, Barrio Industrial Zofri, Iquique',
  correoVentas: 'ventaschile@fricar.cl',
  correoLogistica: 'logistica@fricar.cl',
  telefono: '+56 9 8234 6827'
};

const AREAS = [
  'Papel y fotocopia',
  'Útiles y escritorio',
  'Abastecimiento institucional',
  'Productos para operación',
  'Alimento avícola',
  'Materias primas'
];

const CATEGORIES = [
  'Marcas Torre',
  'Marcas Artel',
  'Oficina y escolar',
  'Papelería',
  'Alimentación animal',
  'Importadores y exportadores'
];

const BRAND_LOGOS = ['Torre', 'Artel', 'Excellent Copy', 'FRICAR'];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await api.get('/api/products');
        if (alive) setProducts(data.items || []);
      } catch {
        if (alive) setProducts([]);
      } finally {
        if (alive) setLoadingProducts(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const { mainProduct, featuredProduct } = useMemo(() => {
    const active = (products || []).filter((p) => p?.activo !== false);

    // Solo se muestran productos configurados desde Dashboard > Productos.
    // Si están inactivos o sin marcar, Inicio no muestra textos ni placeholders fijos.
    const main = active.find((p) => p.principalHome) || null;
    const featured = active.find((p) => p.destacadoHome && String(p._id) !== String(main?._id)) || null;

    return { mainProduct: main, featuredProduct: featured };
  }, [products]);

  return (
    <main className="home-page" aria-label="Página principal de FRICAR">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero__bgShape home-hero__bgShape--one" aria-hidden="true" />
        <div className="home-hero__bgShape home-hero__bgShape--two" aria-hidden="true" />
        <div className="home-hero__dots" aria-hidden="true" />

        <div className="home-hero__content">
          <span className="home-kicker">DESDE 1986</span>
          <h1 id="home-title">Soluciones comerciales para oficina, papelería, abastecimiento y operación.</h1>
          <span className="home-title-line" aria-hidden="true" />
          <p>
            FRICAR es una empresa importadora y exportadora con foco en atención comercial,
            abastecimiento y distribución. Trabajamos líneas de oficina y escolar, productos de
            marcas reconocidas y abastecimiento para distintas necesidades operativas.
          </p>
          <div className="home-actions" aria-label="Acciones principales">
            <a href="/catalogo" className="home-btn home-btn--primary">
              Ver catálogo <span aria-hidden="true">→</span>
            </a>
            <a href="/cotizar" className="home-btn home-btn--secondary">
              Solicitar cotización <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        {(loadingProducts || mainProduct) && (
          <ProductSpotlight product={mainProduct} loading={loadingProducts} type="principal" />
        )}
      </section>

      <section className="home-stats" aria-label="Resumen comercial">
        <InfoCard icon="◎" title="+39 años" text="de trayectoria comercial, atención a empresas e instituciones y experiencia en abastecimiento." />
        <InfoCard icon="▣" title="Línea principal" text="Productos para oficina, papelería, escolar y abastecimiento de uso diario." />
        <InfoCard icon="◇" title="Cobertura comercial" text="Oficina, papelería, escolar, alimentación animal y productos para operación." />
      </section>

      <section className="home-brand-strip" aria-labelledby="brands-title">
        <div>
          <span className="home-kicker">NUESTRAS MARCAS</span>
          <h2 id="brands-title">Trabajamos con marcas reconocidas</h2>
        </div>
        <div className="home-brand-logos" aria-label="Marcas disponibles">
          {BRAND_LOGOS.map((brand) => <span key={brand}>{brand}</span>)}
        </div>
      </section>

      <section className="home-two-cols" aria-label="Información de la empresa y áreas de trabajo">
        <article className="home-card home-card--about">
          <span className="home-kicker">QUIÉNES SOMOS</span>
          <h2>Importación, comercialización y abastecimiento</h2>
          <p>
            La empresa está enfocada en el rubro escolar, oficina y papelería, sumando además
            líneas complementarias para alimentación integral de animales y avícola, además de
            productos como maíz, harina de soya, harina de carne y aceite.
          </p>
          <div className="home-category-grid">
            {CATEGORIES.map((item) => <span key={item}>{item}</span>)}
          </div>
        </article>

        <article className="home-card home-card--blue">
          <span className="home-card__glow" aria-hidden="true" />
          <h2>Áreas de trabajo</h2>
          <div className="home-area-grid">
            {AREAS.map((item) => <span key={item}>{item}</span>)}
          </div>
        </article>
      </section>

      <section className="home-two-cols home-two-cols--compact" aria-label="Productos destacados e identidad visual">
        {(loadingProducts || featuredProduct) && (
          <ProductSpotlight product={featuredProduct} loading={loadingProducts} type="destacado" />
        )}

        <article className="home-card home-card--identity">
          <span className="home-kicker">IDENTIDAD VISUAL</span>
          <h2>Imagen corporativa alineada con la marca</h2>
          <p>
            La página fue reorganizada usando la paleta principal de FRICAR, con tonos azules,
            rojo corporativo y grises definidos en el manual de logo, junto con el eslogan
            “{COMPANY.slogan}”.
          </p>
        </article>
      </section>

      <section className="home-cta" aria-labelledby="cta-title">
        <div>
          <h2 id="cta-title">¿Necesitas algo específico?</h2>
          <p>Nuestro equipo está listo para asesorarte y ayudarte a encontrar la mejor solución.</p>
        </div>
        <a href="/contacto" className="home-btn home-btn--light">Contactar asesor <span aria-hidden="true">→</span></a>
      </section>

      <section className="home-footer-cards" aria-label="Datos de contacto FRICAR">
        <article className="home-card home-brand-card">
          <img src="/logo-fricar.png" alt="FRICAR" />
          <p>Empresa dedicada al rubro escolar, oficina y papelería, con líneas complementarias para abastecimiento y comercialización.</p>
        </article>
        <article className="home-card">
          <h3>Contacto</h3>
          <p>{COMPANY.correoVentas}<br />{COMPANY.correoLogistica}<br />{COMPANY.telefono}</p>
        </article>
        <article className="home-card">
          <h3>Ubicación</h3>
          <p>{COMPANY.direccion}</p>
        </article>
      </section>
    </main>
  );
}

function InfoCard({ icon, title, text }) {
  return (
    <article className="home-card home-info-card">
      <span className="home-info-card__icon" aria-hidden="true">{icon}</span>
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
    </article>
  );
}

function HomeLoader({ label = 'Cargando información...' }) {
  return (
    <div className="home-loader" role="status" aria-live="polite">
      <span className="home-loader__ring" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

function ProductSpotlight({ product, loading, type }) {
  const isMain = type === 'principal';

  if (!loading && !product) return null;
  if (loading) {
    return (
      <article className={isMain ? 'home-product-card home-product-card--main' : 'home-card home-product-card'}>
        <span className="home-kicker">{isMain ? 'PRODUCTO PRINCIPAL' : 'PRODUCTO DESTACADO'}</span>
        <HomeLoader label="Cargando producto desde el dashboard..." />
      </article>
    );
  }

  const title = product?.nombre || '';
  const description = product?.descripcion || '';
  const images = product?.images || [];

  return (
    <article className={isMain ? 'home-product-card home-product-card--main' : 'home-card home-product-card'}>
      <span className="home-kicker">{isMain ? 'PRODUCTO PRINCIPAL' : 'PRODUCTO DESTACADO'}</span>
      {isMain ? (
        <div className={images.length ? 'home-product-main-layout' : 'home-product-main-layout home-product-main-layout--no-image'}>
          {images.length ? (
            <div className="home-product-image-wrap">
              <ProductImageCarousel images={images} alt={title} height={190} />
            </div>
          ) : null}
          <div className="home-product-content">
            <h2>{title}</h2>
            <p>{description}</p>
            <div className="home-tags">
              {product?.unidad && <span>{product.unidad}</span>}
              {product?.categoria && <span>{product.categoria}</span>}
              {product?.sku && <span>SKU {product.sku}</span>}
            </div>
          </div>
        </div>
      ) : (
        <>
          <h2>{title}</h2>
          {images.length ? <ProductImageCarousel images={images} alt={title} height={160} /> : null}
          <p>{description}</p>
        </>
      )}
    </article>
  );
}

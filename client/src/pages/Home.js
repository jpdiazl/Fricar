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
    const main = active.find((p) => p.principalHome) || active[0] || null;
    const featured = active.find((p) => p.destacadoHome && String(p._id) !== String(main?._id))
      || active.find((p) => String(p._id) !== String(main?._id))
      || main
      || null;
    return { mainProduct: main, featuredProduct: featured };
  }, [products]);

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero__content">
          <div className="home-kicker">DESDE 1986</div>
          <h1>Soluciones comerciales para oficina, papelería, abastecimiento y operación.</h1>
          <p>
            FRICAR es una empresa importadora y exportadora con foco en atención comercial,
            abastecimiento y distribución. Trabajamos líneas de oficina y escolar, productos de
            marcas reconocidas y abastecimiento para distintas necesidades operativas.
          </p>
          <div className="home-actions">
            <a href="/catalogo" className="home-btn home-btn--primary">Ver catálogo</a>
            <a href="/cotizar" className="home-btn home-btn--secondary">Solicitar cotización</a>
          </div>
        </div>

        <ProductSpotlight product={mainProduct} loading={loadingProducts} type="principal" />
      </section>

      <section className="home-stats">
        <InfoCard title="+39 años" text="de trayectoria comercial, atención a empresas e instituciones y experiencia en abastecimiento." />
        <InfoCard title="Línea principal" text="Excellent Copy FT 70, papel orientado a impresión y fotocopiado de uso diario." />
        <InfoCard title="Cobertura comercial" text="Oficina, papelería, escolar, alimentación animal y productos para operación." />
      </section>

      <section className="home-two-cols">
        <div className="home-card home-card--about">
          <div className="home-kicker">QUIÉNES SOMOS</div>
          <h2>Importación, comercialización y abastecimiento</h2>
          <p>
            La empresa está enfocada en el rubro escolar, oficina y papelería, sumando además
            líneas complementarias para alimentación integral de animales y avícola, además de
            productos como maíz, harina de soya, harina de carne y aceite.
          </p>
          <div className="home-category-grid">
            {CATEGORIES.map((item) => <span key={item}>{item}</span>)}
          </div>
        </div>

        <div className="home-card home-card--blue">
          <h2>Áreas de trabajo</h2>
          <div className="home-area-grid">
            {AREAS.map((item) => <span key={item}>{item}</span>)}
          </div>
        </div>
      </section>

      <section className="home-two-cols home-two-cols--compact">
        <ProductSpotlight product={featuredProduct} loading={loadingProducts} type="destacado" />

        <div className="home-card">
          <div className="home-kicker">IDENTIDAD VISUAL</div>
          <h2>Imagen corporativa alineada con la marca</h2>
          <p>
            La página fue reorganizada usando la paleta principal de FRICAR, con tonos azules,
            rojo corporativo y grises definidos en el manual de logo, junto con el eslogan
            “{COMPANY.slogan}”.
          </p>
        </div>
      </section>

      <section className="home-footer-cards">
        <div className="home-card home-brand-card">
          <img src="/logo-fricar.png" alt="FRICAR" />
          <p>Empresa dedicada al rubro escolar, oficina y papelería, con líneas complementarias para abastecimiento y comercialización.</p>
        </div>
        <div className="home-card">
          <h3>Contacto</h3>
          <p>{COMPANY.correoVentas}<br />{COMPANY.correoLogistica}<br />{COMPANY.telefono}</p>
        </div>
        <div className="home-card">
          <h3>Ubicación</h3>
          <p>{COMPANY.direccion}</p>
        </div>
      </section>
    </div>
  );
}

function InfoCard({ title, text }) {
  return (
    <div className="home-card home-info-card">
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}

function ProductSpotlight({ product, loading, type }) {
  const isMain = type === 'principal';
  const fallbackTitle = isMain ? 'Excellent Copy FT 70' : 'Excellent Copy FT 70';
  const fallbackText = isMain
    ? 'Papel de alta calidad para impresiones, desarrollado para uso en impresoras y fotocopiadoras de alta velocidad, con buen desempeño en impresión simple y dúplex.'
    : 'Excellent Copy es un papel de alta calidad para todo tipo de impresiones. Su ficha indica brillo ISO 96, opacidad objetivo entre 93 y 95 según gramaje, y uso especialmente adaptado a máquinas con principio xerográfico.';

  const title = product?.nombre || fallbackTitle;
  const description = product?.descripcion || fallbackText;
  const images = product?.images || [];

  return (
    <div className={isMain ? 'home-product-card home-product-card--main' : 'home-card home-product-card'}>
      <div className="home-kicker">{isMain ? 'PRODUCTO PRINCIPAL' : 'PRODUCTO DESTACADO'}</div>
      {isMain ? (
        <div className="home-product-main-layout">
          <div className="home-product-image-wrap">
            {images.length ? <ProductImageCarousel images={images} alt={title} height={190} /> : <div className="home-product-placeholder">FRICAR</div>}
          </div>
          <div>
            <h2>{title}</h2>
            <p>{loading ? 'Cargando producto desde el dashboard…' : description}</p>
            <div className="home-tags">
              <span>{product?.unidad || '70 g/m²'}</span>
              <span>{product?.categoria || 'Uso oficina'}</span>
              <span>{product?.sku ? `SKU ${product.sku}` : 'Cotizable'}</span>
            </div>
          </div>
        </div>
      ) : (
        <>
          <h2>{title}</h2>
          {images.length ? <ProductImageCarousel images={images} alt={title} height={160} /> : null}
          <p>{loading ? 'Cargando producto desde el dashboard…' : description}</p>
        </>
      )}
    </div>
  );
}

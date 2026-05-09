# Cambios UI Inicio y Loader FRICAR

## Página principal
- Se rediseñó la portada con un estilo más cercano a la referencia enviada: fondo con degradados, formas suaves, patrón de puntos, tarjetas tipo glass y mayor jerarquía visual.
- Se mejoró la semántica HTML usando `main`, `section`, `article`, `aria-label` y títulos asociados.
- El producto principal y el producto destacado siguen viniendo desde `Dashboard > Productos`; no se agregaron datos fijos como respaldo.
- Si un producto está inactivo o no está marcado como principal/destacado, no se muestra en Inicio.
- Se agregó sección de marcas, CTA de contacto y tarjetas con más interacción visual.

## Loader
- Se agregó `src/components/Loader.js` como loader reutilizable.
- Se aplicó loader en catálogo, perfil, dashboard, productos, usuarios, cotizaciones, requerimientos y ruta protegida.
- En Inicio se agregó loader para los productos cargados desde el dashboard.

## UI general del proyecto
- Se mejoraron sombras, hover, tarjetas, botones, tablas y fondos globales.
- Se agregó soporte para reducir animaciones cuando el usuario tiene `prefers-reduced-motion` activo.

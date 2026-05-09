# Cambios realizados en FRICAR

## Diseño visual
- Se renovó la paleta general usando colores del sitio `public_html`: azul corporativo, azul secundario, rojo FRICAR, grises y fondos claros.
- Se mejoraron tarjetas, botones, formularios, sombras, bordes, navbar y tipografías.
- Se agregó el logo `logo-fricar.png` dentro de `client/public/` para usarlo directamente en la app.
- Las tarjetas de cotización ahora muestran el logo de FRICAR junto al número de cotización.

## Cotizaciones
- Se agregaron nuevos estados: `EN_PROCESO` y `RESUELTA`.
- Vendedor y administrador pueden cambiar el estado de una cotización desde el panel de cotizaciones.
- Se mantiene el envío por correo y, al responder, la cotización sigue pasando a `ENVIADA` como antes.

## Usuarios
- El administrador ahora puede eliminar usuarios desde el panel de usuarios.
- El administrador ahora puede cambiar la contraseña de cualquier usuario desde el panel.
- Se bloquea la eliminación del propio usuario administrador conectado.

## Cliente
- El cliente ahora puede cambiar su contraseña desde su perfil, indicando contraseña actual, nueva contraseña y confirmación.

## Archivos principales editados
- `client/src/index.css`
- `client/src/components/NavBar.js`
- `client/src/contexts/BrandingContext.js`
- `client/src/pages/vendor/VendorQuotes.js`
- `client/src/pages/admin/AdminUsers.js`
- `client/src/pages/Perfil.js`
- `server/src/models/Quote.js`
- `server/src/routes/quotes.js`
- `server/src/routes/users.js`
- `server/src/routes/auth.js`
- `server/src/models/Branding.js`
- `server/src/routes/branding.js`

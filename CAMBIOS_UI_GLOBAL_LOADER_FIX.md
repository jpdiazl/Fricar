# Cambios UI global y Loader

## Loader
- Se agregó `GlobalLoader` para mostrar un loader real en cualquier petición hacia la API.
- Se agregó `loadingBus` para conectar Axios con el loader global.
- Se actualizaron los interceptores de Axios para activar/desactivar el loader automáticamente.
- Se mantiene el loader local en pantallas específicas para estados internos de carga.

## UI global
- Se mejoró el fondo general de todo el proyecto con degradados y capas suaves.
- Se aplicó diseño consistente a `PageShell`, tarjetas, formularios, tablas, botones, badges y navbar.
- Se mejoró el Dashboard principal para usar la misma estructura visual que el resto del proyecto.
- Se mantuvieron las funcionalidades existentes.

## Páginas afectadas visualmente
- Inicio
- Catálogo
- Contacto
- Cotización
- Login
- Registro
- Perfil
- Dashboard
- Productos
- Usuarios
- Cotizaciones vendedor/admin
- Requerimientos vendedor/admin

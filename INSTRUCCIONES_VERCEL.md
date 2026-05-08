# FRICAR corregido para Vercel

Este ZIP corrige la separación entre frontend y backend para que Vercel pueda abrir bien la página y la API.

## Cambios realizados

- Se agregó `client/vercel.json` para que React no tire error al abrir rutas como `/login`, `/catalogo` o `/admin`.
- Se agregó `server/vercel.json` y `server/api/index.js` para que Express funcione como Serverless Function en Vercel.
- Se separó el backend en `server/src/app.js` y `server/src/index.js`:
  - `app.js` exporta la app para Vercel.
  - `index.js` queda solo para ejecutar localmente.
- Se cambió React a versión 18 para evitar problemas con `react-scripts`.
- Se eliminó `server/.env` del proyecto por seguridad. Las variables deben agregarse en Vercel, no subirse a GitHub.
- Se dejó `server/.env.example` como plantilla.

## Cómo desplegar en Vercel

### 1. Backend: proyecto `fricar-server`

En Vercel, entra al proyecto `fricar-server` y revisa:

- Root Directory: `server`
- Framework Preset: Other
- Build Command: vacío o automático
- Output Directory: vacío
- Install Command: `npm install`

En Settings > Environment Variables agrega:

```env
MONGO_URI=tu_cadena_real_de_mongodb
JWT_SECRET=una_clave_larga_y_segura
JWT_EXPIRES_IN=7d
APP_BASE_URL=https://fricar-client.vercel.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_correo
SMTP_PASS=tu_app_password
SMTP_FROM=FRICAR Cotizaciones <tu_correo>
SEED_ADMIN_RUT=11.111.111-1
SEED_ADMIN_PASS=Admin123!
SEED_ADMIN_EMAIL=admin@fricar.local
```

Después redeploy. Prueba abrir:

```txt
https://fricar-server.vercel.app/health
```

Debe responder algo parecido a:

```json
{ "ok": true, "database": "connected" }
```

### 2. Frontend: proyecto `fricar-client`

En Vercel, entra al proyecto `fricar-client` y revisa:

- Root Directory: `client`
- Framework Preset: Create React App
- Build Command: `npm run build`
- Output Directory: `build`
- Install Command: `npm install`

En Settings > Environment Variables agrega:

```env
REACT_APP_API_URL=https://fricar-server.vercel.app
```

Después redeploy. Abre:

```txt
https://fricar-client.vercel.app
```

## Para probar localmente

Backend:

```bash
cd server
cp .env.example .env
npm install
npm start
```

Frontend:

```bash
cd client
npm install
npm start
```

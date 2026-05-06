# FRICAR - Portal de Catálogo, Cotizaciones y Requerimientos (Client + API)

Incluye:
- **client/** React (CRA)
- **server/** Express + MongoDB

## Requisitos
- Node 18+
- MongoDB

## Backend

1) Copia el ejemplo:

```bash
cd server
cp .env.example .env
```

2) Edita `server/.env`:
- `MONGO_URI`
- `JWT_SECRET`
- (Opcional) `SEED_ADMIN_RUT`, `SEED_ADMIN_PASS` para crear un admin al iniciar
- (Opcional) SMTP (`SMTP_HOST`, `SMTP_USER`, etc.) para que el vendedor envíe correos reales

3) Instala y levanta:

```bash
npm install
npm run dev
```

API: `http://localhost:4000`

## Frontend

1) Crea `client/.env` si quieres cambiar la API:

```bash
REACT_APP_API_URL=http://localhost:4000
```

2) Instala y levanta:

```bash
cd client
npm install
npm start
```

Front: `http://localhost:3000`

## Roles
- **CLIENTE**: catálogo, contacto, cotizar, perfil (mis cotizaciones)
- **VENDEDOR**: ve cotizaciones y puede enviar respuesta por correo
- **ADMIN**: dashboard, CRUD productos, gestionar usuarios/roles

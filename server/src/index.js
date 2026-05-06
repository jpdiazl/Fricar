import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { connectDb } from './config/db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import productRoutes from './routes/products.js';
import quoteRoutes from './routes/quotes.js';
import contactRoutes from './routes/contact.js';
import metricsRoutes from './routes/metrics.js';
import brandingRoutes from './routes/branding.js';
import { User } from './models/User.js';
import bcrypt from 'bcryptjs';
import { normalizeRut } from './utils/rut.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: false }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 60 * 1000, max: 120 }));

app.get('/health', (req, res) => res.json({ ok: true }));

// Serve uploaded assets (logo, product images, etc.)
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/branding', brandingRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno' });
});

async function ensureSeedAdmin() {
  const seedRut = process.env.SEED_ADMIN_RUT;
  const seedPass = process.env.SEED_ADMIN_PASS;
  const seedEmail = process.env.SEED_ADMIN_EMAIL || 'admin@fricar.local';
  if (!seedRut || !seedPass) return;

  const rut = normalizeRut(seedRut);
  const exists = await User.findOne({ rut });
  if (exists) return;

  const passwordHash = await bcrypt.hash(seedPass, 10);
  await User.create({
    rut,
    passwordHash,
    role: 'ADMIN',
    tipoCliente: 'NATURAL',
    nombre: 'Administrador FRICAR',
    correo: seedEmail
  });
  console.log('[seed] Admin creado:', rut);
}

const port = Number(process.env.PORT || 4000);
const mongo = process.env.MONGO_URI;
if (!mongo) {
  console.error('Falta MONGO_URI en .env');
  process.exit(1);
}

connectDb(mongo)
  .then(async () => {
    console.log('MongoDB conectado');
    await ensureSeedAdmin();
    app.listen(port, () => console.log(`API FRICAR en http://localhost:${port}`));
  })
  .catch((e) => {
    console.error('Error conectando a MongoDB', e);
    process.exit(1);
  });

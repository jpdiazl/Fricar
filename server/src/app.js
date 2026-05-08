import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import { connectDb } from './config/db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import productRoutes from './routes/products.js';
import quoteRoutes from './routes/quotes.js';
import contactRoutes from './routes/contact.js';
import metricsRoutes from './routes/metrics.js';
import brandingRoutes from './routes/branding.js';
import { User } from './models/User.js';
import { normalizeRut } from './utils/rut.js';

const app = express();
let connectionPromise = null;
let seedPromise = null;

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

async function ensureDatabase() {
  if (mongoose.connection.readyState === 1) return;

  const mongo = process.env.MONGO_URI;
  if (!mongo) {
    throw new Error('Falta MONGO_URI en las variables de entorno');
  }

  if (!connectionPromise) {
    connectionPromise = connectDb(mongo).then(() => {
      console.log('MongoDB conectado');
    });
  }

  await connectionPromise;

  if (!seedPromise) {
    seedPromise = ensureSeedAdmin().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }
  await seedPromise;
}

app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: true, credentials: false }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 60 * 1000, max: 120, standardHeaders: true, legacyHeaders: false }));

app.get('/', (req, res) => res.json({ ok: true, service: 'FRICAR API' }));
app.get('/health', async (req, res, next) => {
  try {
    await ensureDatabase();
    res.json({ ok: true, database: 'connected' });
  } catch (error) {
    next(error);
  }
});

// Sirve recursos subidos si se ejecuta localmente. En Vercel se recomienda usar URLs externas.
app.use('/uploads', express.static('uploads'));

app.use('/api', async (req, res, next) => {
  try {
    await ensureDatabase();
    next();
  } catch (error) {
    next(error);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/branding', brandingRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Error interno' });
});

export default app;
export { ensureDatabase };

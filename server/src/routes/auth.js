import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User.js';
import { normalizeRut } from '../utils/rut.js';

const router = Router();

const registerSchema = z.object({
  rut: z.string().min(3),
  password: z.string().min(6),
  tipoCliente: z.enum(['NATURAL', 'EMPRESA']),
  nombre: z.string().min(2),
  correo: z.string().email(),
  telefono: z.string().optional(),
  razonSocial: z.string().optional(),
  giro: z.string().optional(),
  direccion: z.string().optional()
});

const loginSchema = z.object({
  rut: z.string().min(3),
  password: z.string().min(6)
});

function sign(user) {
  return jwt.sign(
    { id: String(user._id), rut: user.rut, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Validación', details: parsed.error.flatten() });

  const data = parsed.data;
  const rut = normalizeRut(data.rut);

  const exists = await User.findOne({ rut });
  if (exists) return res.status(409).json({ error: 'El RUT ya está registrado' });

  if (data.tipoCliente === 'EMPRESA' && !data.razonSocial) {
    return res.status(400).json({ error: 'Razón social requerida para empresa' });
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await User.create({
    rut,
    passwordHash,
    role: 'CLIENTE',
    tipoCliente: data.tipoCliente,
    nombre: data.nombre,
    correo: data.correo,
    telefono: data.telefono,
    razonSocial: data.razonSocial,
    giro: data.giro,
    direccion: data.direccion
  });

  const token = sign(user);
  return res.status(201).json({ token });
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Validación', details: parsed.error.flatten() });

  const rut = normalizeRut(parsed.data.rut);
  const user = await User.findOne({ rut });
  if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

  const token = sign(user);
  return res.json({ token });
});

router.get('/me', async (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No autorizado' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select('-passwordHash');
    if (!user) return res.status(401).json({ error: 'No autorizado' });
    return res.json({ user });
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }
});

export default router;

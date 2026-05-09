import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { normalizeRut } from '../utils/rut.js';

const router = Router();

router.get('/', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
  return res.json({ users });
});

const updateSchema = z.object({
  role: z.enum(['CLIENTE','VENDEDOR','ADMIN']).optional(),
  tipoCliente: z.enum(['NATURAL','EMPRESA']).optional(),
  nombre: z.string().min(2).optional(),
  correo: z.string().email().optional(),
  telefono: z.string().optional(),
  razonSocial: z.string().optional(),
  giro: z.string().optional(),
  direccion: z.string().optional(),
  password: z.string().min(6).optional()
});

router.put('/:id', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Validación', details: parsed.error.flatten() });

  const patch = { ...parsed.data };
  if (patch.password) {
    patch.passwordHash = await bcrypt.hash(patch.password, 10);
    delete patch.password;
  }

  const user = await User.findByIdAndUpdate(req.params.id, patch, { new: true }).select('-passwordHash');
  if (!user) return res.status(404).json({ error: 'No encontrado' });
  return res.json({ user });
});


router.delete('/:id', requireAuth, requireRole('ADMIN'), async (req, res) => {
  if (String(req.user.id) === String(req.params.id)) {
    return res.status(400).json({ error: 'No puedes eliminar tu propio usuario administrador desde este panel' });
  }

  const user = await User.findByIdAndDelete(req.params.id).select('-passwordHash');
  if (!user) return res.status(404).json({ error: 'No encontrado' });
  return res.json({ ok: true, user });
});

// Admin can create vendor/admin quickly
const createSchema = z.object({
  rut: z.string().min(3),
  password: z.string().min(6),
  role: z.enum(['VENDEDOR','ADMIN']),
  nombre: z.string().min(2),
  correo: z.string().email(),
  telefono: z.string().optional()
});

router.post('/', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Validación', details: parsed.error.flatten() });

  const rut = normalizeRut(parsed.data.rut);
  const exists = await User.findOne({ rut });
  if (exists) return res.status(409).json({ error: 'El RUT ya existe' });

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await User.create({
    rut,
    passwordHash,
    role: parsed.data.role,
    tipoCliente: 'NATURAL',
    nombre: parsed.data.nombre,
    correo: parsed.data.correo,
    telefono: parsed.data.telefono
  });

  return res.status(201).json({ user: await User.findById(user._id).select('-passwordHash') });
});

export default router;

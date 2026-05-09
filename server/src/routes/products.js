import { Router } from 'express';
import { z } from 'zod';
import { Product } from '../models/Product.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

function isProbablyUrl(s) {
  if (typeof s !== 'string') return false;
  const v = s.trim();
  if (!v) return false;
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

const productSchema = z.object({
  sku: z.string().min(2),
  nombre: z.string().min(2),
  descripcion: z.string().optional(),
  categoria: z.string().optional(),
  unidad: z.string().optional(),
  activo: z.boolean().optional(),
  principalHome: z.boolean().optional(),
  destacadoHome: z.boolean().optional()
});

// Public catalog (no prices)
router.get('/', async (req, res) => {
  const activeOnly = req.query.activeOnly !== 'false';
  const filter = activeOnly ? { activo: true } : {};
  const items = await Product.find(filter).sort({ categoria: 1, nombre: 1 });
  return res.json({ items });
});

// Add product image by URL (links only)
router.post('/:id/images', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const item = await Product.findById(req.params.id);
  if (!item) return res.status(404).json({ error: 'No encontrado' });

  const { url } = req.body || {};
  if (!isProbablyUrl(url)) return res.status(400).json({ error: 'URL inválida' });

  const clean = url.trim();

  // Avoid duplicates
  const exists = (item.images || []).some((x) => String(x.url) === clean);
  if (!exists) {
    item.images = [...(item.images || []), { url: clean }];
    await item.save();
  }

  return res.json({ item });
});

// Remove product image by imageId
router.delete('/:id/images/:imageId', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const item = await Product.findById(req.params.id);
  if (!item) return res.status(404).json({ error: 'No encontrado' });

  const before = (item.images || []).length;
  item.images = (item.images || []).filter((x) => String(x._id) !== String(req.params.imageId));
  if ((item.images || []).length === before) return res.status(404).json({ error: 'Imagen no encontrada' });

  await item.save();
  return res.json({ item });
});

// Admin CRUD
router.post('/', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Validación', details: parsed.error.flatten() });

  try {
    if (parsed.data.principalHome) await Product.updateMany({}, { $set: { principalHome: false } });
    if (parsed.data.destacadoHome) await Product.updateMany({}, { $set: { destacadoHome: false } });
    const created = await Product.create(parsed.data);
    return res.status(201).json({ item: created });
  } catch (e) {
    return res.status(409).json({ error: 'SKU ya existe o datos inválidos' });
  }
});

router.put('/:id', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const parsed = productSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Validación', details: parsed.error.flatten() });

  if (parsed.data.principalHome) {
    await Product.updateMany({ _id: { $ne: req.params.id } }, { $set: { principalHome: false } });
  }
  if (parsed.data.destacadoHome) {
    await Product.updateMany({ _id: { $ne: req.params.id } }, { $set: { destacadoHome: false } });
  }

  const item = await Product.findByIdAndUpdate(req.params.id, parsed.data, { new: true });
  if (!item) return res.status(404).json({ error: 'No encontrado' });
  return res.json({ item });
});

// Keep current behavior: DELETE == desactivar (soft)
router.delete('/:id', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const item = await Product.findByIdAndUpdate(req.params.id, { activo: false }, { new: true });
  if (!item) return res.status(404).json({ error: 'No encontrado' });
  return res.json({ ok: true });
});

// Permanent delete
router.delete('/:id/permanent', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const item = await Product.findById(req.params.id);
  if (!item) return res.status(404).json({ error: 'No encontrado' });

  await Product.findByIdAndDelete(req.params.id);
  return res.json({ ok: true });
});

export default router;

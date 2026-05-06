import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { Quote } from '../models/Quote.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { nextSequence } from '../utils/sequence.js';
import { sendMail } from '../utils/mailer.js';
import multer from 'multer';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB
});

// Wrapper para capturar MulterError y evitar que crashee el server
function uploadPdf(req, res, next) {
  upload.single('pdf')(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'El PDF supera el tamaño máximo permitido (25MB)' });
      }
      return res.status(400).json({ error: `Error de archivo: ${err.code}` });
    }
    return res.status(400).json({ error: 'Error subiendo archivo' });
  });
}

const createSchema = z.object({
  items: z.array(
    z.object({ productId: z.string().min(1), cantidad: z.coerce.number().int().min(1) })
  ).min(1)
});

router.post('/', requireAuth, requireRole('CLIENTE'), async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Validación', details: parsed.error.flatten() });

  // Validate products exist
  const ids = parsed.data.items.map((i) => i.productId);
  const existing = await Product.find({ _id: { $in: ids }, activo: true }).select('_id');
  if (existing.length !== new Set(ids).size) {
    return res.status(400).json({ error: 'Uno o más productos no existen o están inactivos' });
  }

  const numero = await nextSequence('cotizacion', { prefix: 'CTZ-', pad: 6 });
  const quote = await Quote.create({
    numero,
    clienteId: req.user.id,
    items: parsed.data.items.map((i) => ({ productId: i.productId, cantidad: i.cantidad }))
  });

  return res.status(201).json({ quote });
});

router.get('/my', requireAuth, requireRole('CLIENTE'), async (req, res) => {
  const quotes = await Quote.find({ clienteId: req.user.id })
    .populate('items.productId')
    .sort({ createdAt: -1 });
  return res.json({ quotes });
});

// Vendor/admin access
router.get('/', requireAuth, requireRole(['VENDEDOR','ADMIN']), async (req, res) => {
  const estado = req.query.estado;
  const filter = estado ? { estado } : {};
  const quotes = await Quote.find(filter)
    .populate('clienteId', '-passwordHash')
    .populate('items.productId')
    .sort({ createdAt: -1 });
  return res.json({ quotes });
});

const sendSchema = z.object({
  notasVendedor: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().optional()
});

router.post('/:id/send-email', requireAuth, requireRole(['VENDEDOR','ADMIN']), uploadPdf, async (req, res) => {
  // Si viene multipart/form-data, los campos llegan como strings
  const parsed = sendSchema.safeParse({
    notasVendedor: req.body?.notasVendedor,
    subject: req.body?.subject,
    message: req.body?.message
  });
  if (!parsed.success) return res.status(400).json({ error: 'Validación', details: parsed.error.flatten() });

  const quote = await Quote.findById(req.params.id)
    .populate('items.productId');
  if (!quote) return res.status(404).json({ error: 'No encontrado' });

  const cliente = await User.findById(quote.clienteId).select('-passwordHash');
  if (!cliente) {
    // Evita crash cuando el usuario cliente ya no existe o la referencia está dañada
    return res.status(400).json({ error: 'El cliente asociado a esta cotización no existe (clienteId inválido)' });
  }
  const to = cliente.correo;

  const itemsHtml = quote.items
    .map((it) => `<li>${it.productId.nombre} — Cantidad: <b>${it.cantidad}</b></li>`)
    .join('');

  const html = `
    <div style="font-family:Arial,sans-serif">
      <h2>Respuesta a Cotización ${quote.numero}</h2>
      <p>Hola ${cliente.nombre},</p>
      <p>${parsed.data.message || 'Recibimos tu solicitud de cotización. A continuación el detalle solicitado:'}</p>
      <ul>${itemsHtml}</ul>
      ${parsed.data.notasVendedor ? `<p><b>Notas del vendedor:</b> ${parsed.data.notasVendedor}</p>` : ''}
      <p>Saludos,<br/>FRICAR</p>
    </div>
  `;

  const attachments = [];
  if (req.file) {
    // Acepta solo PDF
    const isPdf = req.file.mimetype === 'application/pdf' || (req.file.originalname || '').toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      return res.status(400).json({ error: 'El archivo adjunto debe ser PDF' });
    }
    attachments.push({
      filename: req.file.originalname || `cotizacion-${quote.numero}.pdf`,
      content: req.file.buffer,
      contentType: 'application/pdf'
    });
  }

  await sendMail({
    to,
    subject: parsed.data.subject || `FRICAR - Cotización ${quote.numero}`,
    html,
    attachments
  });

  quote.estado = 'ENVIADA';
  quote.vendedorId = req.user.id;
  quote.notasVendedor = parsed.data.notasVendedor;
  quote.enviadaPorCorreo = true;
  await quote.save();

  return res.json({ ok: true });
});

export default router;

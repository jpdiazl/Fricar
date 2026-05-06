import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import { ContactRequest } from '../models/ContactRequest.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { nextSequence } from '../utils/sequence.js';
import { sendMail } from '../utils/mailer.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB
});

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
  nombre: z.string().min(2),
  correo: z.string().email(),
  telefono: z.string().optional(),
  mensaje: z.string().min(10)
});

// Público: crear requerimiento
router.post('/', async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Validación', details: parsed.error.flatten() });

  const numero = await nextSequence('requerimiento', { prefix: 'REQ-', pad: 6 });
  const item = await ContactRequest.create({ numero, ...parsed.data });

  // Notificación opcional al vendedor/área comercial
  const notifyTo = process.env.CONTACT_NOTIFY_TO;
  if (notifyTo) {
    const html = `
      <div style="font-family:Arial,sans-serif">
        <h2>Nuevo requerimiento ${item.numero}</h2>
        <p><b>Nombre:</b> ${item.nombre}</p>
        <p><b>Correo:</b> ${item.correo}</p>
        ${item.telefono ? `<p><b>Teléfono:</b> ${item.telefono}</p>` : ''}
        <p><b>Mensaje:</b></p>
        <div style="white-space:pre-wrap">${escapeHtml(item.mensaje)}</div>
      </div>
    `;
    // Si falla el correo, NO rompemos la creación del requerimiento
    sendMail({
      to: notifyTo,
      subject: `FRICAR - Nuevo requerimiento ${item.numero}`,
      html
    }).catch(() => {});
  }

  return res.status(201).json({ numero: item.numero });
});

// Vendedor/admin: listar requerimientos
router.get('/', requireAuth, requireRole(['VENDEDOR', 'ADMIN']), async (req, res) => {
  const estado = req.query.estado;
  const filter = estado ? { estado } : {};
  const items = await ContactRequest.find(filter).sort({ createdAt: -1 });
  return res.json({ items });
});

const sendSchema = z.object({
  notasVendedor: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().optional()
});

// Vendedor/admin: responder por correo (misma lógica que cotizaciones)
router.post('/:id/send-email', requireAuth, requireRole(['VENDEDOR', 'ADMIN']), uploadPdf, async (req, res) => {
  const parsed = sendSchema.safeParse({
    notasVendedor: req.body?.notasVendedor,
    subject: req.body?.subject,
    message: req.body?.message
  });
  if (!parsed.success) return res.status(400).json({ error: 'Validación', details: parsed.error.flatten() });

  const item = await ContactRequest.findById(req.params.id);
  if (!item) return res.status(404).json({ error: 'No encontrado' });

  const html = `
    <div style="font-family:Arial,sans-serif">
      <h2>Respuesta a requerimiento ${item.numero}</h2>
      <p>Hola ${item.nombre},</p>
      <p>${parsed.data.message || 'Gracias por contactarnos. Recibimos tu requerimiento y te respondemos a continuación:'}</p>
      <hr style="border:none;border-top:1px solid #eee"/>
      <p><b>Tu mensaje: </b></p>
      <div style="white-space:pre-wrap">${escapeHtml(item.mensaje)}</div>
      ${parsed.data.notasVendedor ? `<p style="margin-top:14px"><b>Notas:</b> ${escapeHtml(parsed.data.notasVendedor)}</p>` : ''}
      <p style="margin-top:18px">Saludos,<br/>FRICAR</p>
    </div>
  `;

  const attachments = [];
  if (req.file) {
    const isPdf = req.file.mimetype === 'application/pdf' || (req.file.originalname || '').toLowerCase().endsWith('.pdf');
    if (!isPdf) return res.status(400).json({ error: 'El archivo adjunto debe ser PDF' });
    attachments.push({
      filename: req.file.originalname || `requerimiento-${item.numero}.pdf`,
      content: req.file.buffer,
      contentType: 'application/pdf'
    });
  }

  await sendMail({
    to: item.correo,
    subject: parsed.data.subject || `FRICAR - Requerimiento ${item.numero}`,
    html,
    attachments
  });

  item.estado = 'EN PROCESO';
  item.vendedorId = req.user.id;
  item.notasVendedor = parsed.data.notasVendedor;
  item.enviadaPorCorreo = true;
  await item.save();

  return res.json({ ok: true });
});

// Vendedor/admin: marcar como SOLUCIONADO (cierra el requerimiento)
router.patch('/:id/solve', requireAuth, requireRole(['VENDEDOR', 'ADMIN']), async (req, res) => {
  const item = await ContactRequest.findById(req.params.id);
  if (!item) return res.status(404).json({ error: 'No encontrado' });

  // Si estaba NUEVO y lo cierran directo, igual permitimos.
  item.estado = 'SOLUCIONADO';
  item.vendedorId = req.user.id;
  item.solvedAt = item.solvedAt || new Date();
  await item.save();

  return res.json({ ok: true });
});

function escapeHtml(str) {
  return String(str || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export default router;

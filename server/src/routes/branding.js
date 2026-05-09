import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { Branding } from '../models/Branding.js';

const router = Router();

// Public endpoint for the frontend
router.get('/public', async (req, res) => {
  const doc = await Branding.findOne({ key: 'main' });
  return res.json({
    companyName: doc?.companyName || 'FRICAR',
    logoUrl: doc?.logoUrl || '/logo-fricar.png'
  });
});

// Admin update company name + logoUrl (links only)
router.put('/', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const { companyName, logoUrl } = req.body || {};
  const update = {
    companyName: (companyName || 'FRICAR').toString(),
  };
  if (typeof logoUrl === 'string') {
    update.logoUrl = logoUrl.trim();
  }

  const updated = await Branding.findOneAndUpdate(
    { key: 'main' },
    { $set: update },
    { upsert: true, new: true }
  );
  return res.json({ item: updated });
});

export default router;

import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { Quote } from '../models/Quote.js';
import { ContactRequest } from '../models/ContactRequest.js';

const router = Router();

router.get('/', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const [users, products, quotes, contacts, pendingQuotes] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Quote.countDocuments(),
    ContactRequest.countDocuments(),
    Quote.countDocuments({ estado: 'PENDIENTE' })
  ]);

  return res.json({
    users,
    products,
    quotes,
    pendingQuotes,
    contacts
  });
});

export default router;

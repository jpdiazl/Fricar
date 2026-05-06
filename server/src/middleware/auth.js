import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No autorizado' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, role, rut }
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

export function requireRole(roles) {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'No autorizado' });
    if (!allowed.includes(req.user.role)) return res.status(403).json({ error: 'Prohibido' });
    return next();
  };
}

import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

export async function auth(req, res, next) {
  const token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role === 'officer') {
      const result = await query('SELECT id, name, email, department FROM officers WHERE id = $1', [payload.officerId]);
      if (!result.rows[0]) return res.status(401).json({ error: 'Session is invalid' });
      req.account = { ...result.rows[0], role: 'officer' };
    } else {
      const result = await query('SELECT id, name, email, role FROM users WHERE id = $1', [payload.userId]);
      if (!result.rows[0]) return res.status(401).json({ error: 'Session is invalid' });
      req.account = result.rows[0];
    }
    next();
  } catch (_error) { res.status(401).json({ error: 'Session is invalid or expired' }); }
}

export function requireRole(...roles) {
  return (req, res, next) => roles.includes(req.account?.role) ? next() : res.status(403).json({ error: 'Insufficient permissions' });
}
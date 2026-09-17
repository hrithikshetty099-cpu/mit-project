import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

export async function authOfficer(req, res, next) {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;
  if (!token) return res.status(401).json({ error: 'Officer authentication required' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const result = await query("SELECT id, name, email, department, verified, verification_status FROM officers WHERE id = $1 AND verified = true AND verification_status = 'approved'", [payload.officerId]);
    if (!result.rows[0]) return res.status(401).json({ error: 'Officer session is invalid' });
    req.officer = result.rows[0];
    next();
  } catch (_error) {
    res.status(401).json({ error: 'Officer session is invalid or expired' });
  }
}
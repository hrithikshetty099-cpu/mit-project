import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { isValidDepartment } from '../config/departments.js';

function issueToken(officer) {
  return jwt.sign({ officerId: officer.id, department: officer.department, role: 'officer' }, process.env.JWT_SECRET, { expiresIn: '8h' });
}

export async function registerOfficer(req, res) {
  const { name, email, password, department } = req.body;
  if (!name || !email || !password || !department || !req.file) return res.status(400).json({ error: 'name, email, password, department and job ID card are required' });
  if (!isValidDepartment(department)) return res.status(400).json({ error: 'Invalid department' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
  try {
    const hash = await bcrypt.hash(password, 12);
    const documentUrl = `/uploads/${req.file.filename}`;
    const result = await query('INSERT INTO officers (name, email, password_hash, department, id_card_url, verification_document, verified, verification_status) VALUES ($1, $2, $3, $4, $5, $5, false, \'pending\') RETURNING id, name, email, department, verified, verification_status', [name, email.toLowerCase(), hash, department, documentUrl]);
    res.status(201).json({ officer: result.rows[0], message: 'Registration submitted. Your account is pending admin verification.' });
  } catch (error) {
    res.status(error.code === '23505' ? 409 : 500).json({ error: error.code === '23505' ? 'Email is already registered' : error.message });
  }
}

export async function loginOfficer(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password are required' });
  const result = await query('SELECT id, name, email, password_hash, department, verified, verification_status FROM officers WHERE email = $1', [email.toLowerCase()]);
  const officer = result.rows[0];
  if (!officer || !(await bcrypt.compare(password, officer.password_hash))) return res.status(401).json({ error: 'Invalid email or password' });
  if (!officer.verified || officer.verification_status !== 'approved') return res.status(403).json({ error: officer.verification_status === 'rejected' ? 'Officer registration was rejected' : 'Officer registration is awaiting admin approval' });
  delete officer.password_hash;
  res.json({ officer, token: issueToken(officer) });
}

export function currentOfficer(req, res) { res.json({ officer: req.officer }); }
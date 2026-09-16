import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

function issueToken(officer) {
  return jwt.sign({ officerId: officer.id, department: officer.department, role: 'officer' }, process.env.JWT_SECRET, { expiresIn: '8h' });
}

export async function registerOfficer(req, res) {
  const { name, job_id, phone, password, department } = req.body;
  if (!name || !job_id || !phone || !password || !department) return res.status(400).json({ error: 'name, job_id, phone, password and department are required' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
  try {
    const hash = await bcrypt.hash(password, 12);
    const documentUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const result = await query('INSERT INTO officers (name, job_id, phone, email, password_hash, department, verification_document) VALUES ($1, $2, $3, $2 || \'@officer.local\', $4, $5, $6) RETURNING id, name, job_id, phone, department, verification_status', [name, job_id, phone, hash, department, documentUrl]);
    res.status(201).json({ officer: result.rows[0], message: 'Registration submitted for admin approval' });
  } catch (error) {
    res.status(error.code === '23505' ? 409 : 500).json({ error: error.code === '23505' ? 'Job ID is already registered' : error.message });
  }
}

export async function loginOfficer(req, res) {
  const { job_id, phone, password } = req.body;
  if (!job_id || !phone || !password) return res.status(400).json({ error: 'job_id, phone and password are required' });
  const result = await query('SELECT id, name, job_id, phone, password_hash, department, verification_status FROM officers WHERE job_id = $1 AND phone = $2', [job_id, phone]);
  const officer = result.rows[0];
  if (!officer || !(await bcrypt.compare(password, officer.password_hash))) return res.status(401).json({ error: 'Invalid email or password' });
  if (officer.verification_status !== 'approved') return res.status(403).json({ error: officer.verification_status === 'rejected' ? 'Officer registration was rejected' : 'Officer registration is awaiting admin approval' });
  delete officer.password_hash;
  res.json({ officer, token: issueToken(officer) });
}

export function currentOfficer(req, res) { res.json({ officer: req.officer }); }
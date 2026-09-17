import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { isValidDepartment } from '../config/departments.js';

const otpLifetimeMs = 5 * 60 * 1000;

function issueToken(officer) {
  return jwt.sign({ officerId: officer.id, department: officer.department, role: 'officer' }, process.env.JWT_SECRET, { expiresIn: '8h' });
}

export async function registerOfficer(req, res) {
  const { name, email, password, department, phone, municipality_ward } = req.body;
  if (!name || !email || !password || !department || !phone || !municipality_ward || !req.file) return res.status(400).json({ error: 'name, email, password, phone, municipality/ward, department and job ID card are required' });
  if (!isValidDepartment(department)) return res.status(400).json({ error: 'Invalid department' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
  try {
    const hash = await bcrypt.hash(password, 12);
    const documentUrl = `/uploads/${req.file.filename}`;
    const result = await query('INSERT INTO officers (name, email, password_hash, phone, municipality_ward, department, id_card_url, verification_document, verified, verification_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $7, false, \'pending\') RETURNING id, name, email, phone, municipality_ward, department, verified, verification_status', [name, email.toLowerCase(), hash, phone, municipality_ward, department, documentUrl]);
    res.status(201).json({ officer: result.rows[0], message: 'Registration submitted. Your account is pending admin verification.' });
  } catch (error) {
    res.status(error.code === '23505' ? 409 : 500).json({ error: error.code === '23505' ? 'Email is already registered' : error.message });
  }
}

export async function requestOfficerOtp(req, res) {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number is required' });
  const result = await query('SELECT id, verified, verification_status FROM officers WHERE phone = $1', [phone]);
  const officer = result.rows[0];
  if (!officer) return res.status(401).json({ error: 'No officer is registered with this phone number' });
  if (!officer.verified || officer.verification_status !== 'approved') return res.status(403).json({ error: officer.verification_status === 'rejected' ? 'Officer registration was rejected' : 'Officer registration is awaiting admin approval' });
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const otpHash = await bcrypt.hash(otp, 10);
  await query('UPDATE officers SET otp_hash = $1, otp_expires_at = NOW() + INTERVAL \'5 minutes\' WHERE id = $2', [otpHash, officer.id]);
  console.log(`[OFFICER OTP] ${phone}: ${otp}`);
  res.json({ message: 'OTP generated. Check the backend console in development.' });
}

export async function verifyOfficerOtp(req, res) {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ error: 'Phone number and OTP are required' });
  const result = await query('SELECT id, name, email, phone, municipality_ward, department, verified, verification_status, otp_hash FROM officers WHERE phone = $1 AND verified = true AND verification_status = \'approved\' AND otp_expires_at > NOW()', [phone]);
  const officer = result.rows[0];
  if (!officer || !(await bcrypt.compare(String(otp), officer.otp_hash))) return res.status(401).json({ error: 'Invalid or expired OTP' });
  await query('UPDATE officers SET otp_hash = NULL, otp_expires_at = NULL WHERE id = $1', [officer.id]);
  delete officer.otp_hash;
  res.json({ officer, token: issueToken(officer) });
}

export function currentOfficer(req, res) { res.json({ officer: req.officer }); }
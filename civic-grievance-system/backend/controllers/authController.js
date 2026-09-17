import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

const tokenFor = (account) => jwt.sign({ userId: account.id, role: account.role }, process.env.JWT_SECRET, { expiresIn: '8h' });

export async function registerCitizen(req, res) {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !phone || !password) return res.status(400).json({ error: 'name, email, phone and password are required' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
  try {
    const result = await query('INSERT INTO users (name, email, phone, password_hash, role) VALUES ($1, LOWER($2), $3, $4, \'citizen\') RETURNING id, name, email, phone, role', [name, email, phone, await bcrypt.hash(password, 12)]);
    res.status(201).json({ user: result.rows[0], token: tokenFor(result.rows[0]) });
  } catch (error) {
    console.error('Citizen registration database error:', error);
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') return res.status(503).json({ error: 'Database is unavailable. Start PostgreSQL and verify DATABASE_URL.' });
    if (error.code === '28P01') return res.status(503).json({ error: 'PostgreSQL rejected DATABASE_URL credentials. Update backend/.env with the correct password.' });
    if (error.code === '3D000') return res.status(503).json({ error: 'Database civic_grievance does not exist.' });
    if (error.code === '42P01') return res.status(500).json({ error: 'Database table users does not exist. Run npm run db:init.' });
    res.status(error.code === '23505' ? 409 : 500).json({ error: error.code === '23505' ? 'Email or phone is already registered' : error.message });
  }
}

export async function loginCitizen(req, res) {
  try {
    const { identifier, email, password } = req.body;
    const loginIdentifier = identifier || email;
    if (!loginIdentifier || !password) return res.status(400).json({ error: 'email or phone and password are required' });
    const result = await query('SELECT id, name, email, phone, password_hash, role FROM users WHERE email = LOWER($1) OR phone = $1 LIMIT 1', [loginIdentifier]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password || '', user.password_hash))) return res.status(401).json({ error: 'Invalid email or password' });
    delete user.password_hash;
    res.json({ user, token: tokenFor(user) });
  } catch (error) {
    console.error('Citizen login database error:', error);
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') return res.status(503).json({ error: 'Database is unavailable. Start PostgreSQL and verify DATABASE_URL.' });
    if (error.code === '28P01') return res.status(503).json({ error: 'PostgreSQL rejected DATABASE_URL credentials. Update backend/.env with the correct password.' });
    if (error.code === '3D000') return res.status(503).json({ error: 'Database civic_grievance does not exist.' });
    if (error.code === '42P01') return res.status(500).json({ error: 'Database table users does not exist. Run npm run db:init.' });
    res.status(500).json({ error: 'Citizen login failed because of a database error.' });
  }
}
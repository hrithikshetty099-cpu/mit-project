import bcrypt from 'bcrypt';
import 'dotenv/config';
import { query, pool } from '../config/db.js';

const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) throw new Error('Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD before running this script');
const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
await query(`INSERT INTO users (name, email, password_hash, role) VALUES ($1, LOWER($2), $3, 'admin') ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash, role = 'admin'`, [ADMIN_NAME, ADMIN_EMAIL, hash]);
console.log(`Admin account ready for ${ADMIN_EMAIL}`);
await pool.end();
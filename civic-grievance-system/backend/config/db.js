import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required. Copy backend/.env.example to backend/.env and configure PostgreSQL.');
export const pool = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 3000 });
export const query = (text, params) => pool.query(text, params);
export async function checkDatabase() {
  const result = await query('SELECT NOW() AS now');
  return result.rows[0];
}
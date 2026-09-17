import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL || (process.env.DB_HOST && [
  `postgresql://${encodeURIComponent(process.env.DB_USER || 'postgres')}:${encodeURIComponent(process.env.DB_PASSWORD || '')}`,
  `${process.env.DB_HOST}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'civic_grievance'}`
].join(''));
if (!connectionString) throw new Error('Set DATABASE_URL or DB_HOST, DB_PORT, DB_USER, DB_PASSWORD and DB_NAME in backend/.env.');
export const pool = new Pool({ connectionString, connectionTimeoutMillis: 3000 });
export const query = (text, params) => pool.query(text, params);
export async function checkDatabase() {
  const result = await query('SELECT NOW() AS now');
  return result.rows[0];
}
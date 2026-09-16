import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const query = (text, params) => pool.query(text, params);
export async function checkDatabase() {
  const result = await query('SELECT NOW() AS now');
  return result.rows[0];
}
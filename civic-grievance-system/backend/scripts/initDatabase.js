import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../config/db.js';

const directory = path.dirname(fileURLToPath(import.meta.url));
const migrations = ['init.sql', 'officers.sql', 'auth.sql'];

try {
  await pool.query('BEGIN');
  for (const migration of migrations) {
    const sql = await fs.readFile(path.join(directory, '..', 'migrations', migration), 'utf8');
    console.log(`Applying ${migration}`);
    await pool.query(sql);
  }
  await pool.query('COMMIT');
  console.log('Database initialization completed.');
} catch (error) {
  try { await pool.query('ROLLBACK'); } catch (_rollbackError) {}
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') console.error('Database initialization failed: PostgreSQL is unavailable. Start PostgreSQL and verify DATABASE_URL.');
  else console.error('Database initialization failed:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}

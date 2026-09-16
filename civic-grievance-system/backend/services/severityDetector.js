import { query } from '../config/db.js';

export async function detectSeverity(lat, lng) {
  const result = await query(`SELECT 1 FROM landmarks WHERE ST_DWithin(location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, 250) LIMIT 1`, [lng, lat]);
  return result.rows.length ? 'High' : 'Normal';
}
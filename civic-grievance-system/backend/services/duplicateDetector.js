import { query } from '../config/db.js';
export async function findDuplicate(category, lat, lng) {
  const result = await query(`SELECT id FROM complaints WHERE category = $1 AND status NOT IN ('Marked Fixed', 'Citizen Verified') AND created_at > NOW() - INTERVAL '30 days' AND ST_DWithin(location, ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography, 100) ORDER BY created_at DESC LIMIT 1`, [category, lng, lat]);
  return result.rows[0] || null;
}
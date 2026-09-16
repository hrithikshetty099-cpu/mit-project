import { query } from '../config/db.js';
export async function routeComplaint(category) {
  const result = await query('SELECT id, name FROM departments WHERE category_mapping ? $1 LIMIT 1', [category]);
  return result.rows[0] || null;
}
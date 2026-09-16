import { query } from '../config/db.js';
export async function resolveComplaint(req, res) {
  const media = req.file ? `/uploads/${req.file.filename}` : null;
  const result = await query("UPDATE complaints SET status = 'Marked Fixed', after_media_url = $1, updated_at = NOW() WHERE id = $2 RETURNING *", [media, req.params.id]);
  await query("INSERT INTO status_history (complaint_id, stage) VALUES ($1, 'Marked Fixed')", [req.params.id]);
  res.json(result.rows[0]);
}
export async function verifyComplaint(req, res) {
  const { citizen_id, confirmed, lat, lng } = req.body;
  if (!citizen_id || typeof confirmed !== 'boolean' || lat === undefined || lng === undefined) return res.status(400).json({ error: 'citizen_id, confirmed, lat and lng are required' });
  const nearby = await query(`SELECT 1 FROM complaints WHERE id = $1 AND ST_DWithin(location, ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography, 1000)`, [req.params.id, lng, lat]);
  if (!nearby.rows.length) return res.status(403).json({ error: 'Verification is limited to nearby citizens' });
  await query('INSERT INTO verifications (complaint_id, citizen_id, confirmed) VALUES ($1,$2,$3)', [req.params.id, citizen_id, confirmed]);
  const disputes = await query('SELECT COUNT(*)::int AS count FROM verifications WHERE complaint_id = $1 AND confirmed = false', [req.params.id]);
  if (disputes.rows[0].count >= 3) {
    await query("UPDATE complaints SET status = 'Inspection', updated_at = NOW() WHERE id = $1", [req.params.id]);
    await query("INSERT INTO status_history (complaint_id, stage) VALUES ($1, 'Inspection')", [req.params.id]);
  }
  res.status(201).json({ accepted: true, disputes: disputes.rows[0].count });
}
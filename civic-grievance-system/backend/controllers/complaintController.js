import { query } from '../config/db.js';
import { classifyComplaint } from '../services/aiClassifier.js';
import { routeComplaint } from '../services/router.js';
import { findDuplicate } from '../services/duplicateDetector.js';
import { detectSeverity } from '../services/severityDetector.js';

export async function createComplaint(req, res) {
  try {
    const { description, lat, lng, address } = req.body;
    if (!description || lat === undefined || lng === undefined) return res.status(400).json({ error: 'description, lat and lng are required' });
    const { category, confidence } = classifyComplaint(description, req.file?.path);
    const department = await routeComplaint(category);
    const duplicate = await findDuplicate(category, Number(lat), Number(lng));
    const severity = await detectSeverity(Number(lat), Number(lng));
    const mediaUrl = req.file ? `/uploads/${req.file.filename}` : null;
    if (duplicate) {
      const linked = await query(`INSERT INTO complaints (category, description, lat, lng, location, address, media_url, department_id, severity, master_complaint_id) VALUES ($1,$2,$3,$4,ST_SetSRID(ST_MakePoint($4,$3),4326)::geography,$5,$6,$7,$8,$9) RETURNING *`, [category, description, lat, lng, address || null, mediaUrl, department?.id || null, severity, duplicate.id]);
      await query('UPDATE complaints SET affected_citizens = affected_citizens + 1, severity = CASE WHEN $2 = \'High\' THEN \'High\' ELSE severity END, updated_at = NOW() WHERE id = $1', [duplicate.id, severity]);
      await query('INSERT INTO status_history (complaint_id, stage) VALUES ($1, $2)', [linked.rows[0].id, 'Reported']);
      return res.status(201).json({ complaint: linked.rows[0], master_complaint_id: duplicate.id, duplicate: true, confidence });
    }
    const result = await query(`INSERT INTO complaints (category, description, lat, lng, location, address, media_url, department_id, severity) VALUES ($1,$2,$3,$4,ST_SetSRID(ST_MakePoint($4,$3),4326)::geography,$5,$6,$7,$8) RETURNING *`, [category, description, lat, lng, address || null, mediaUrl, department?.id || null, severity]);
    await query('INSERT INTO status_history (complaint_id, stage) VALUES ($1, $2)', [result.rows[0].id, 'Reported']);
    res.status(201).json({ complaint: result.rows[0], duplicate: false, confidence });
  } catch (error) { res.status(500).json({ error: error.message }); }
}

export async function listComplaints(req, res) {
  const result = await query('SELECT * FROM complaints ORDER BY created_at DESC');
  res.json(result.rows);
}
export async function getComplaint(req, res) {
  const complaint = await query('SELECT * FROM complaints WHERE id = $1', [req.params.id]);
  const history = await query('SELECT * FROM status_history WHERE complaint_id = $1 ORDER BY timestamp', [req.params.id]);
  if (!complaint.rows[0]) return res.status(404).json({ error: 'Complaint not found' });
  res.json({ complaint: complaint.rows[0], history: history.rows });
}
export async function updateStatus(req, res) {
  const { status } = req.body;
  const result = await query('UPDATE complaints SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *', [status, req.params.id]);
  await query('INSERT INTO status_history (complaint_id, stage) VALUES ($1, $2)', [req.params.id, status]);
  res.json(result.rows[0]);
}
export async function heatmap(req, res) {
  const result = await query('SELECT id, lat, lng, status, severity, affected_citizens FROM complaints ORDER BY created_at DESC');
  res.json(result.rows);
}
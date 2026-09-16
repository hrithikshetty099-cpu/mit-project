import { query } from '../config/db.js';
import { classifyComplaint } from '../services/aiClassifier.js';
import { routeComplaint } from '../services/router.js';
import { findDuplicate } from '../services/duplicateDetector.js';
import { detectSeverity } from '../services/severityDetector.js';

export async function createComplaint(req, res) {
  try {
    const { title, description, lat, lng, address, department_id, preferred_language = 'en' } = req.body;
    const citizenId = req.account?.role === 'citizen' ? req.account.id : null;
    if (!title || !description || lat === undefined || lng === undefined || !department_id) return res.status(400).json({ error: 'title, description, department_id, lat and lng are required' });
    const selectedDepartment = await query('SELECT id FROM departments WHERE id = $1', [department_id]);
    if (!selectedDepartment.rows[0]) return res.status(400).json({ error: 'Invalid department' });
    const { category, confidence } = classifyComplaint(description, req.file?.path);
    const department = selectedDepartment.rows[0] || await routeComplaint(category);
    const duplicate = await findDuplicate(category, Number(lat), Number(lng));
    const severity = await detectSeverity(Number(lat), Number(lng));
    const mediaUrl = req.file ? `/uploads/${req.file.filename}` : null;
    if (duplicate) {
      const linked = await query(`INSERT INTO complaints (title, category, description, lat, lng, location, address, media_url, department_id, severity, master_complaint_id, citizen_id, preferred_language) VALUES ($1,$2,$3,$4,$5,ST_SetSRID(ST_MakePoint($5,$4),4326)::geography,$6,$7,$8,$9,$10,$11,$12) RETURNING *`, [title, category, description, lat, lng, address || null, mediaUrl, department.id, severity, duplicate.id, citizenId, preferred_language]);
      await query('UPDATE complaints SET affected_citizens = affected_citizens + 1, severity = CASE WHEN $2 = \'High\' THEN \'High\' ELSE severity END, updated_at = NOW() WHERE id = $1', [duplicate.id, severity]);
      await query('INSERT INTO status_history (complaint_id, stage) VALUES ($1, $2)', [linked.rows[0].id, 'Reported']);
      return res.status(201).json({ complaint: linked.rows[0], master_complaint_id: duplicate.id, duplicate: true, confidence });
    }
    const result = await query(`INSERT INTO complaints (title, category, description, lat, lng, location, address, media_url, department_id, severity, citizen_id, preferred_language) VALUES ($1,$2,$3,$4,$5,ST_SetSRID(ST_MakePoint($5,$4),4326)::geography,$6,$7,$8,$9,$10,$11) RETURNING *`, [title, category, description, lat, lng, address || null, mediaUrl, department.id, severity, citizenId, preferred_language]);
    await query('INSERT INTO status_history (complaint_id, stage) VALUES ($1, $2)', [result.rows[0].id, 'Reported']);
    res.status(201).json({ complaint: result.rows[0], duplicate: false, confidence });
  } catch (error) { res.status(500).json({ error: error.message }); }
}

export async function listComplaints(req, res) {
  const result = req.account?.role === 'admin'
    ? await query('SELECT * FROM complaints ORDER BY created_at DESC')
    : await query('SELECT * FROM complaints WHERE citizen_id = $1 ORDER BY created_at DESC', [req.account.id]);
  res.json(result.rows);
}
export async function getComplaint(req, res) {
  const complaint = req.account?.role === 'admin'
    ? await query('SELECT * FROM complaints WHERE id = $1', [req.params.id])
    : await query('SELECT * FROM complaints WHERE id = $1 AND citizen_id = $2', [req.params.id, req.account.id]);
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
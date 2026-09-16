import { query } from '../config/db.js';

export async function getAssignedComplaints(req, res) {
  const result = await query(`SELECT c.*, d.name AS department_name FROM complaints c JOIN departments d ON d.id = c.department_id WHERE c.department_id = $1 ORDER BY c.created_at DESC`, [req.officer.department]);
  res.json(result.rows);
}

export async function updateAssignedStatus(req, res) {
  const { status, remarks } = req.body;
  const allowed = ['Assigned', 'Inspection', 'Work Started', 'Marked Fixed'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid officer status' });
  const result = await query(`UPDATE complaints SET status = $1, officer_remarks = COALESCE($2, officer_remarks), updated_at = NOW() WHERE id = $3 AND department_id = $4 AND (assigned_officer_id IS NULL OR assigned_officer_id = $5) RETURNING *`, [status, remarks || null, req.params.id, req.officer.department, req.officer.id]);
  if (!result.rows[0]) return res.status(404).json({ error: 'Complaint not found in your department' });
  await query('INSERT INTO status_history (complaint_id, stage) VALUES ($1, $2)', [req.params.id, status]);
  res.json(result.rows[0]);
}

export async function updateAssignedRemarks(req, res) {
  const result = await query(`UPDATE complaints SET officer_remarks = $1, updated_at = NOW() WHERE id = $2 AND department_id = $3 AND (assigned_officer_id IS NULL OR assigned_officer_id = $4) RETURNING *`, [req.body.remarks || '', req.params.id, req.officer.department, req.officer.id]);
  if (!result.rows[0]) return res.status(404).json({ error: 'Complaint not found in your department' });
  res.json(result.rows[0]);
}

export async function resolveAssignedComplaint(req, res) {
  const media = req.file ? `/uploads/${req.file.filename}` : null;
  const result = await query(`UPDATE complaints SET status = 'Marked Fixed', after_media_url = $1, updated_at = NOW() WHERE id = $2 AND department_id = $3 AND (assigned_officer_id IS NULL OR assigned_officer_id = $4) RETURNING *`, [media, req.params.id, req.officer.department, req.officer.id]);
  if (!result.rows[0]) return res.status(404).json({ error: 'Complaint not found in your department' });
  await query("INSERT INTO status_history (complaint_id, stage) VALUES ($1, 'Marked Fixed')", [req.params.id]);
  res.json(result.rows[0]);
}
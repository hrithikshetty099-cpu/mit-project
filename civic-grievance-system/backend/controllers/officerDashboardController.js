import { query } from '../config/db.js';

export async function getAssignedComplaints(req, res) {
  const result = await query(`SELECT c.*, d.name AS department_name FROM complaints c JOIN departments d ON d.id = c.department_id JOIN officers o ON o.department = CASE d.name WHEN 'Roads & Infrastructure Department' THEN 'road_service' WHEN 'Electricity Department' THEN 'electrical' WHEN 'Waste Management & Municipality Department' THEN 'municipality' WHEN 'Water Supply Department' THEN 'water_leakage' END WHERE o.id = $1 ORDER BY c.created_at DESC`, [req.officer.id]);
  res.json(result.rows);
}

export async function updateAssignedStatus(req, res) {
  const { status, remarks } = req.body;
  const allowed = ['Assigned', 'Inspection', 'Work Started', 'Marked Fixed'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid officer status' });
  const result = await query(`UPDATE complaints c SET status = $1, officer_remarks = COALESCE($2, c.officer_remarks), updated_at = NOW() FROM departments d, officers o WHERE c.department_id = d.id AND o.id = $5 AND o.department = CASE d.name WHEN 'Roads & Infrastructure Department' THEN 'road_service' WHEN 'Electricity Department' THEN 'electrical' WHEN 'Waste Management & Municipality Department' THEN 'municipality' WHEN 'Water Supply Department' THEN 'water_leakage' END AND c.id = $3 AND (c.assigned_officer_id IS NULL OR c.assigned_officer_id = $5) RETURNING c.*`, [status, remarks || null, req.params.id, req.officer.department, req.officer.id]);
  if (!result.rows[0]) return res.status(404).json({ error: 'Complaint not found in your department' });
  await query('INSERT INTO status_history (complaint_id, stage) VALUES ($1, $2)', [req.params.id, status]);
  res.json(result.rows[0]);
}

export async function updateAssignedRemarks(req, res) {
  const result = await query(`UPDATE complaints c SET officer_remarks = $1, updated_at = NOW() FROM departments d, officers o WHERE c.department_id = d.id AND o.id = $4 AND o.department = CASE d.name WHEN 'Roads & Infrastructure Department' THEN 'road_service' WHEN 'Electricity Department' THEN 'electrical' WHEN 'Waste Management & Municipality Department' THEN 'municipality' WHEN 'Water Supply Department' THEN 'water_leakage' END AND c.id = $2 AND (c.assigned_officer_id IS NULL OR c.assigned_officer_id = $4) RETURNING c.*`, [req.body.remarks || '', req.params.id, req.officer.department, req.officer.id]);
  if (!result.rows[0]) return res.status(404).json({ error: 'Complaint not found in your department' });
  res.json(result.rows[0]);
}

export async function resolveAssignedComplaint(req, res) {
  const media = req.file ? `/uploads/${req.file.filename}` : null;
  const result = await query(`UPDATE complaints c SET status = 'Marked Fixed', after_media_url = $1, updated_at = NOW() FROM departments d, officers o WHERE c.department_id = d.id AND o.id = $4 AND o.department = CASE d.name WHEN 'Roads & Infrastructure Department' THEN 'road_service' WHEN 'Electricity Department' THEN 'electrical' WHEN 'Waste Management & Municipality Department' THEN 'municipality' WHEN 'Water Supply Department' THEN 'water_leakage' END AND c.id = $2 AND (c.assigned_officer_id IS NULL OR c.assigned_officer_id = $4) RETURNING c.*`, [media, req.params.id, req.officer.department, req.officer.id]);
  if (!result.rows[0]) return res.status(404).json({ error: 'Complaint not found in your department' });
  await query("INSERT INTO status_history (complaint_id, stage) VALUES ($1, 'Marked Fixed')", [req.params.id]);
  res.json(result.rows[0]);
}
import cron from 'node-cron';
import { query } from '../config/db.js';
export function startEscalationJob() {
  cron.schedule('0 0 * * *', async () => {
    await query(`INSERT INTO escalations (complaint_id, level) SELECT id, CASE WHEN created_at < NOW() - INTERVAL '7 days' THEN 2 ELSE 1 END FROM complaints WHERE status NOT IN ('Marked Fixed', 'Citizen Verified') AND created_at < NOW() - INTERVAL '3 days' AND NOT EXISTS (SELECT 1 FROM escalations e WHERE e.complaint_id = complaints.id AND e.timestamp > NOW() - INTERVAL '1 day')`);
  });
}
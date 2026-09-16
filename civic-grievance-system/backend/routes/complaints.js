import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import { createComplaint, listComplaints, getComplaint, updateStatus, heatmap } from '../controllers/complaintController.js';
const router = Router();
router.get('/', listComplaints); router.get('/heatmap', heatmap); router.get('/:id', getComplaint);
router.post('/', upload.single('media'), createComplaint); router.patch('/:id/status', updateStatus);
export default router;
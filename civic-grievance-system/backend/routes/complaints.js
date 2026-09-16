import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import { createComplaint, listComplaints, getComplaint, updateStatus, heatmap } from '../controllers/complaintController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { auth, requireRole } from '../middleware/auth.js';
const router = Router();
router.get('/', auth, requireRole('citizen', 'admin'), asyncHandler(listComplaints)); router.get('/heatmap', asyncHandler(heatmap)); router.get('/:id', auth, requireRole('citizen', 'admin'), asyncHandler(getComplaint));
router.post('/', auth, requireRole('citizen'), upload.single('media'), asyncHandler(createComplaint)); router.patch('/:id/status', auth, requireRole('admin'), asyncHandler(updateStatus));
export default router;
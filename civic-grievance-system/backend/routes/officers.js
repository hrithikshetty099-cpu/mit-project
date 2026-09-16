import { Router } from 'express';
import { registerOfficer, loginOfficer, currentOfficer } from '../controllers/officerController.js';
import { getAssignedComplaints, updateAssignedStatus, updateAssignedRemarks, resolveAssignedComplaint } from '../controllers/officerDashboardController.js';
import { authOfficer } from '../middleware/authOfficer.js';
import { upload } from '../middleware/upload.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();
router.post('/register', upload.single('job_id_document'), asyncHandler(registerOfficer));
router.post('/login', asyncHandler(loginOfficer));
router.get('/me', authOfficer, asyncHandler(currentOfficer));
router.get('/complaints', authOfficer, asyncHandler(getAssignedComplaints));
router.patch('/complaints/:id/status', authOfficer, asyncHandler(updateAssignedStatus));
router.patch('/complaints/:id/remarks', authOfficer, asyncHandler(updateAssignedRemarks));
router.post('/complaints/:id/resolve', authOfficer, upload.single('after_media'), asyncHandler(resolveAssignedComplaint));
export default router;
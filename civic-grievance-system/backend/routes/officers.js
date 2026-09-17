import { Router } from 'express';
import { registerOfficer, requestOfficerOtp, verifyOfficerOtp, currentOfficer } from '../controllers/officerController.js';
import { getAssignedComplaints, updateAssignedStatus, updateAssignedRemarks, resolveAssignedComplaint } from '../controllers/officerDashboardController.js';
import { authOfficer } from '../middleware/authOfficer.js';
import { upload } from '../middleware/upload.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { DEPARTMENTS } from '../config/departments.js';

const router = Router();
router.get('/departments', (_req, res) => res.json(DEPARTMENTS.map(({ value, name }) => ({ value, name }))));
router.post('/register', upload.single('idCard'), asyncHandler(registerOfficer));
router.post('/login/request-otp', asyncHandler(requestOfficerOtp));
router.post('/login/verify-otp', asyncHandler(verifyOfficerOtp));
router.get('/me', authOfficer, asyncHandler(currentOfficer));
router.get('/complaints', authOfficer, asyncHandler(getAssignedComplaints));
router.patch('/complaints/:id/status', authOfficer, asyncHandler(updateAssignedStatus));
router.patch('/complaints/:id/remarks', authOfficer, asyncHandler(updateAssignedRemarks));
router.post('/complaints/:id/resolve', authOfficer, upload.single('after_media'), asyncHandler(resolveAssignedComplaint));
export default router;
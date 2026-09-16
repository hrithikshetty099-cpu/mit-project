import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { listUsers, listOfficers, listDepartments, createDepartment, assignOfficer, reviewOfficer, assignComplaint, assignComplaintOfficer, listAllComplaints } from '../controllers/adminController.js';
const router = Router(); router.use(auth, requireRole('admin'));
router.get('/users', asyncHandler(listUsers)); router.get('/officers', asyncHandler(listOfficers)); router.get('/departments', asyncHandler(listDepartments)); router.post('/departments', asyncHandler(createDepartment)); router.get('/complaints', asyncHandler(listAllComplaints)); router.patch('/officers/:id/department', asyncHandler(assignOfficer)); router.patch('/officers/:id/verification', asyncHandler(reviewOfficer)); router.patch('/complaints/:id/department', asyncHandler(assignComplaint)); router.patch('/complaints/:id/officer', asyncHandler(assignComplaintOfficer));
export default router;
import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import { resolveComplaint, verifyComplaint } from '../controllers/verificationController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
const router = Router();
router.post('/:id/resolve', upload.single('after_media'), asyncHandler(resolveComplaint)); router.post('/:id/verify', asyncHandler(verifyComplaint));
export default router;
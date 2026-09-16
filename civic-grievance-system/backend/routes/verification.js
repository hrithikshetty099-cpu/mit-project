import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import { resolveComplaint, verifyComplaint } from '../controllers/verificationController.js';
const router = Router();
router.post('/:id/resolve', upload.single('after_media'), resolveComplaint); router.post('/:id/verify', verifyComplaint);
export default router;
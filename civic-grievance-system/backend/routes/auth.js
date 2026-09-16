import { Router } from 'express';
import { registerCitizen, loginCitizen } from '../controllers/authController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
const router = Router();
router.post('/register', asyncHandler(registerCitizen));
router.post('/login', asyncHandler(loginCitizen));
export default router;
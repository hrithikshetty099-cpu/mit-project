import { Router } from 'express';
import { query } from '../config/db.js';
const router = Router();
router.get('/', async (_req, res) => res.json((await query('SELECT * FROM departments ORDER BY name')).rows));
export default router;
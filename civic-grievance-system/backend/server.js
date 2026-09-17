import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { checkDatabase } from './config/db.js';
import complaintsRouter from './routes/complaints.js';
import departmentsRouter from './routes/departments.js';
import verificationRouter from './routes/verification.js';
import officersRouter from './routes/officers.js';
import authRouter from './routes/auth.js';
import adminRouter from './routes/admin.js';
import { startEscalationJob } from './services/escalationEngine.js';

const app = express();
const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: (origin, callback) => {
  if (!origin || origin === allowedOrigin || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return callback(null, true);
  callback(new Error('Origin is not allowed by CORS'));
} }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.get('/api/health', async (_req, res) => {
  try { res.json({ status: 'ok', database: await checkDatabase() }); }
  catch (error) {
    console.error('Database health check failed:', error);
    const errorMessage = error.code === '28P01' ? 'PostgreSQL rejected DATABASE_URL credentials.' : error.code === '3D000' ? 'Database civic_grievance does not exist.' : 'PostgreSQL is unavailable. Start PostgreSQL and verify DATABASE_URL.';
    res.status(503).json({ status: 'degraded', error: errorMessage });
  }
});
app.use('/api/complaints', complaintsRouter);
app.use('/api/departments', departmentsRouter);
app.use('/api/complaints', verificationRouter);
app.use('/api/officers', officersRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use((error, _req, res, _next) => {
  console.error(error);
  if (res.headersSent) return;
  if (error.type === 'entity.parse.failed') return res.status(400).json({ error: 'Request body must be valid JSON.' });
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') return res.status(503).json({ error: 'Database is unavailable. Start PostgreSQL and verify DATABASE_URL.' });
  res.status(500).json({ error: 'Internal server error' });
});
const port = Number(process.env.PORT || 5000);
app.listen(port, '0.0.0.0', () => { console.log(`Civic grievance API listening on http://localhost:${port}`); startEscalationJob(); });
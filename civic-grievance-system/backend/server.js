import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { checkDatabase } from './config/db.js';
import complaintsRouter from './routes/complaints.js';
import departmentsRouter from './routes/departments.js';
import verificationRouter from './routes/verification.js';
import { startEscalationJob } from './services/escalationEngine.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.get('/api/health', async (_req, res) => {
  try { res.json({ status: 'ok', database: await checkDatabase() }); }
  catch (error) { res.status(503).json({ status: 'degraded', database: error.message }); }
});
app.use('/api/complaints', complaintsRouter);
app.use('/api/departments', departmentsRouter);
app.use('/api/complaints', verificationRouter);
const port = Number(process.env.PORT || 5000);
app.listen(port, () => { console.log(`Civic grievance API listening on http://localhost:${port}`); startEscalationJob(); });
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
import timelineRouter from './routes/timeline.js';
import profileRouter from './routes/profile.js';
import dbTestRouter from './routes/dbTest.js';
import postsRouter from './routes/posts.js';
import metricsRouter from './routes/metrics.js';
import publicProfileRouter from './routes/publicProfile.js';
import vcardRouter from './routes/vcard.js';
import emailChecklistRouter from './routes/emailChecklist.js';
import uploadRouter from './routes/upload.js';
import ogRouter from './routes/og.js';
import getPort from 'get-port';
const app = express();
app.use(cors());
app.use(express.json());
// Routers
app.use('/api/auth', authRouter);
app.use('/api/timeline', timelineRouter);
app.use('/api/profile', profileRouter);
app.use('/api/posts', postsRouter);
app.use('/api/metrics', metricsRouter);
app.use('/api', dbTestRouter);
app.use('/api/public-profile', publicProfileRouter);
app.use('/api/vcard', vcardRouter);
app.use('/api/email/checklist', emailChecklistRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/og', ogRouter);
// Health Check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'Server is healthy!' });
});
async function startServer() {
    const preferredPort = process.env.PORT ? Number(process.env.PORT) : 3000;
    const port = await getPort({ port: preferredPort });
    app.listen(port, () => {
        console.log(`🚀 Backend server running stable at http://localhost:${port}`);
    });
}
startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
export default app;

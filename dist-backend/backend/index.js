import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRouter from './routes/auth.js';
import timelineRouter from './routes/timeline.js';
import profileRouter from './routes/profile.js';
import dbTestRouter from './routes/dbTest.js';
import postsRouter from './routes/posts.js';
import getPort from 'get-port';
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
// Routers
app.use('/api/auth', authRouter);
app.use('/api/timeline', timelineRouter);
app.use('/api/profile', profileRouter);
app.use('/api/posts', postsRouter);
app.use('/api', dbTestRouter);
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

import { Router } from 'express';
import { db } from '../db.js';
import { sql } from 'drizzle-orm';
const router = Router();
router.get('/db-test', async (_req, res) => {
    try {
        const result = await db.execute(sql `SELECT NOW();`);
        res.status(200).json({ connected: true, serverTime: result.rows[0] });
    }
    catch (error) {
        console.error('DB Connection error:', error);
        res.status(500).json({ connected: false, error: error.message });
    }
});
export default router;

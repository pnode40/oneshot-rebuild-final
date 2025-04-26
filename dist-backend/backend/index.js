import express from 'express';
import authRouter from './routes/auth.js';
// 👇 NEW: Mock in-memory DB
const mockDb = {
    users: {
        records: [],
        async findOne(query) {
            return this.records.find((user) => user.email === query.email) || null;
        },
        async insertOne(user) {
            const id = Math.random().toString(36).substring(2, 15);
            const newUser = { ...user, _id: id };
            this.records.push(newUser);
            return { insertedId: id };
        }
    }
};
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use((req, res, next) => {
    req.db = mockDb;
    next();
});
app.use('/api/auth', authRouter);
app.get('/api/health', (_req, res) => {
    res.json({ status: 'Server is healthy!' });
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

import { db } from '../db.js';
// @ts-ignore - Type mismatch is expected as we're using Drizzle ORM
export const attachDb = (req, _res, next) => {
    req.db = db;
    next();
};

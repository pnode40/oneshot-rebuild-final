import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { db } from '../db.js';
import { posts } from '../schema.js';
import { sql } from 'drizzle-orm';
const router = Router();
// GET /api/posts - Get all posts
router.get('/', requireAuth, async (_req, res) => {
    try {
        const allPosts = await db.select().from(posts);
        res.json(allPosts);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});
// GET /api/posts/:postId - Get a specific post
router.get('/:postId', requireAuth, async (req, res) => {
    try {
        const postId = parseInt(req.params.postId);
        const post = await db.select().from(posts).where(sql `id = ${postId}`);
        if (!post.length) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json(post[0]);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch post' });
    }
});
// POST /api/posts - Create a new post
router.post('/', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { title, content } = req.body;
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }
        const inserted = await db.insert(posts).values({
            userId,
            title,
            content,
        }).returning();
        res.status(201).json(inserted[0]);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create post' });
    }
});
// PUT /api/posts/:postId - Update a post
router.put('/:postId', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        const postId = parseInt(req.params.postId);
        const { title, content } = req.body;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const updated = await db.execute(sql `
      UPDATE posts
      SET title = ${title}, content = ${content}
      WHERE id = ${postId} AND user_id = ${userId}
    `);
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update post' });
    }
});
// DELETE /api/posts/:postId - Delete a post
router.delete('/:postId', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        const postId = parseInt(req.params.postId);
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        await db.execute(sql `
      DELETE FROM posts
      WHERE id = ${postId} AND user_id = ${userId}
    `);
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete post' });
    }
});
// POST /api/posts/:postId/like - Like a post
router.post('/:postId/like', requireAuth, async (req, res) => {
    try {
        const postId = parseInt(req.params.postId);
        await db.execute(sql `
      UPDATE posts
      SET likes = likes + 1
      WHERE id = ${postId}
    `);
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to like post' });
    }
});
// POST /api/posts/:postId/comment - Add a comment to a post (placeholder)
router.post('/:postId/comment', requireAuth, async (req, res) => {
    res.status(501).json({ error: 'Comments functionality not implemented yet' });
});
export default router;

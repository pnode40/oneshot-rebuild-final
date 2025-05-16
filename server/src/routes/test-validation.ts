import express from 'express';
import { loginSchema } from '../validations/authSchemas';
import { validateRequest } from '../middleware/validationMiddleware';

const router = express.Router();

// POST /api/test-validation
router.post(
  '/test-validation',
  validateRequest({ body: loginSchema }),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Validation passed!',
      data: req.body, // should now be parsed + safe
    });
  }
);

export default router; 
import express from 'express';
import testAuthRouter from './test-auth';
import testRbacRouter from './test-rbac';
import testValidationRouter from './test-validation';

const router = express.Router();

// Mount all test-related routes
router.use('/test-auth', testAuthRouter);
router.use('/test-rbac', testRbacRouter);
router.use('/test-validation', testValidationRouter);

export default router; 
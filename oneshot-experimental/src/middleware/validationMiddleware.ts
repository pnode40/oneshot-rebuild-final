import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

// Type for request validation schemas
type ValidationSchema = {
  params?: AnyZodObject;
  query?: AnyZodObject;
  body?: AnyZodObject;
};

/**
 * Format Zod validation errors into a consistent structure
 */
function formatZodErrors(error: ZodError) {
  return error.errors.map(err => ({
    path: err.path.join('.'),
    message: err.message
  }));
}

/**
 * Middleware for validating request data against Zod schemas
 * Can validate params, query, and body data
 */
export const validateRequest = (schemas: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate each part of the request if a schema is provided
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
      
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format validation errors
        const formattedErrors = formatZodErrors(error);
        
        // Use standard response format
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: formattedErrors
        });
      }
      
      next(error);
    }
  };
}; 
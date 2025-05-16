import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

interface ValidationSchemas {
  body?: AnyZodObject;
  params?: AnyZodObject;
  query?: AnyZodObject;
}

/**
 * Middleware factory for validating request data with Zod schemas
 * 
 * @param schemas Object containing Zod schemas for body, params, and/or query
 * @returns Express middleware function that validates request parts
 * 
 * @example
 * // Usage with single schema
 * router.post('/users', validateRequest({ body: createUserSchema }), createUserHandler);
 * 
 * @example
 * // Usage with multiple schemas
 * router.get('/users/:id', validateRequest({
 *   params: userIdParamSchema,
 *   query: userQuerySchema
 * }), getUserHandler);
 */
export const validateRequest = (schemas: ValidationSchemas) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.flatten().fieldErrors,
        });
      }
      return next(error);
    }
  };

/**
 * Legacy middleware for validating only request body
 * @deprecated Use validateRequest instead
 */
export const validate = (schema: AnyZodObject, source: 'body' | 'query' | 'params' = 'body') => {
  console.warn('The validate() middleware is deprecated. Please use validateRequest() instead.');
  
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get data from the specified source
      const data = req[source];
      
      // Validate the data against the schema
      const validationResult = schema.safeParse(data);
      
      if (!validationResult.success) {
        // Format validation errors
        const formattedErrors = formatZodErrors(validationResult.error);
        
        // Use standard response format
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: formattedErrors
        });
      }
      
      // Attach validated data to the request object
      req[source] = validationResult.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Formats Zod validation errors into a more user-friendly format
 * 
 * @param error ZodError object
 * @returns Formatted error object
 */
function formatZodErrors(error: ZodError) {
  return error.errors.reduce((acc, err) => {
    // Get the field name from the path
    const field = err.path.join('.');
    
    // Add the error message to the accumulator
    acc[field] = err.message;
    return acc;
  }, {} as Record<string, string>);
} 
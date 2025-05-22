/**
 * Standard success response format
 */
export const successResponse = <T>(
  message: string, 
  data?: T, 
  statusCode: number = 200
) => {
  return {
    success: true,
    message,
    data,
    statusCode
  };
};

/**
 * Standard error response format
 */
export const errorResponse = (
  message: string, 
  error?: any, 
  statusCode: number = 500
) => {
  // Format the error for safe client consumption
  const formattedError = error 
    ? (error.message || String(error))
    : undefined;
  
  return {
    success: false,
    message,
    error: formattedError,
    statusCode
  };
};

/**
 * Validation error response format
 */
export const validationErrorResponse = (
  message: string,
  validationErrors: Record<string, string>
) => {
  return {
    success: false,
    message,
    validationErrors,
    statusCode: 400
  };
}; 
/**
 * Error Handling Middleware
 * Global error handler for consistent error responses
 */

export const errorHandler = (error, request, reply) => {
  request.log.error(error);
  
  // Handle Fastify validation errors
  if (error.validation) {
    return reply.code(400).send({
      success: false,
      message: 'Validation error',
      errors: error.validation
    });
  }
  
  // Handle JWT errors
  if (error.code?.startsWith('FST_JWT')) {
    return reply.code(401).send({
      success: false,
      message: 'Authentication failed',
      code: error.code
    });
  }
  
  // Handle database errors
  if (error.code === 'ER_DUP_ENTRY') {
    return reply.code(409).send({
      success: false,
      message: 'Duplicate entry',
      error: 'Resource already exists'
    });
  }
  
  // Default error response
  const statusCode = error.statusCode || 500;
  
  reply.code(statusCode).send({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

/**
 * Not Found Handler
 */
export const notFoundHandler = (request, reply) => {
  reply.code(404).send({
    success: false,
    message: 'Route not found',
    path: request.url
  });
};

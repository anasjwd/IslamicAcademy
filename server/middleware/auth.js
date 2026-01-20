/**
 * Authentication Middleware
 * Verifies JWT tokens and attaches user info to request
 */

export const authenticate = async (request, reply) => {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({
        success: false,
        message: 'Access token required'
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify JWT token using access token namespace
    const decoded = await request.server.jwt.access.verify(token);
    
    // Attach user info to request
    request.user = {
      id: decoded.id || decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
    
  } catch (error) {
    if (error.code === 'FST_JWT_AUTHORIZATION_TOKEN_EXPIRED') {
      return reply.code(401).send({
        success: false,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    return reply.code(401).send({
      success: false,
      message: 'Invalid token'
    });
  }
};

/**
 * Admin Authorization Middleware
 * Requires authenticate middleware to run first
 */
export const requireAdmin = async (request, reply) => {
  if (!request.user) {
    return reply.code(401).send({
      success: false,
      message: 'Authentication required'
    });
  }
  
  if (request.user.role !== 'admin') {
    return reply.code(403).send({
      success: false,
      message: 'Admin access required'
    });
  }
};

/**
 * User Authorization Middleware
 * Verifies user can only access their own resources
 */
export const requireOwnerOrAdmin = async (request, reply) => {
  if (!request.user) {
    return reply.code(401).send({
      success: false,
      message: 'Authentication required'
    });
  }
  
  const resourceUserId = parseInt(request.params.userId || request.params.id);
  
  if (request.user.role !== 'admin' && request.user.id !== resourceUserId) {
    return reply.code(403).send({
      success: false,
      message: 'Access denied'
    });
  }
};

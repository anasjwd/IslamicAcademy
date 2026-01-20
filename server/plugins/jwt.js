import fastifyPlugin from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';

async function jwtPlugin(fastify, opts) {
  // Register cookie plugin first
  await fastify.register(fastifyCookie);

  // Register access token JWT (15min)
  await fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET,
    sign: {
      expiresIn: '15m',
    },
    namespace: 'access',
    jwtVerify: 'accessVerify',
    jwtSign: 'accessSign',
  });

  // Register refresh token JWT (7d)
  await fastify.register(fastifyJwt, {
    secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    sign: {
      expiresIn: '7d',
    },
    cookie: {
      cookieName: 'refreshToken',
      signed: false,
    },
    namespace: 'refresh',
    jwtVerify: 'refreshVerify',
    jwtSign: 'refreshSign',
  });

  // Decorator for verifying access token from Authorization header
  fastify.decorate('jwtAuth', async function (request, reply) {
    try {
      const authHeader = request.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.code(401).send({
          success: false,
          message: 'Missing or invalid authorization header',
        });
      }

      const token = authHeader.substring(7);
      const decoded = fastify.jwt.access.verify(token);

      // Populate request.user with decoded payload
      request.user = {
        id: decoded.id,
        first_name: decoded.first_name,
        last_name: decoded.last_name,
        email: decoded.email,
        role: decoded.role,
      };
    } catch (error) {
      return reply.code(401).send({
        success: false,
        message: 'Invalid or expired token',
      });
    }
  });

  // Decorator for admin-only routes
  fastify.decorate('adminAuth', async function (request, reply) {
    await fastify.jwtAuth(request, reply);
    
    if (request.user && request.user.role !== 'admin') {
      return reply.code(403).send({
        success: false,
        message: 'Admin access required',
      });
    }
  });
}

export default fastifyPlugin(jwtPlugin);

import Fastify from 'fastify';
import 'dotenv/config';
import { initDatabase } from './config/database.js';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import jwtPlugin from './plugins/jwt.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = Number(process.env.PORT) || 3306;
const HOST = process.env.HOST || "127.0.0.1";

const app = Fastify({
  logger: {
    level: "info",
    transport: {
      target: "pino-pretty",
      options: { colorize: true },
    },
  },
});

// Register CORS
await app.register(cors, {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
});

// Register rate limiting
await app.register(rateLimit, {
  max: 100, // Max requests per timeWindow
  timeWindow: '15 minutes'
});

// Register JWT plugin
await app.register(jwtPlugin);

// Register multipart for file uploads
await app.register(multipart, {
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
    files: 10 // Max 10 files per request
  }
});

// Serve static files (uploaded PDFs)
await app.register(fastifyStatic, {
  root: join(__dirname, 'uploads'),
  prefix: '/uploads/'
});

app.get('/health', async () => {
  return { status: "OK", timestamp: new Date().toISOString() };
});

await app.register(authRoutes, { prefix: "/api/auth" });
await app.register(courseRoutes, { prefix: "/api" });
await app.register(subscriptionRoutes, { prefix: "/api" });

// Error handlers
app.setErrorHandler(errorHandler);
app.setNotFoundHandler(notFoundHandler);

const start = async () => {
  try {
    // Initialize database connection
    await initDatabase();
    app.log.info('Database connected');
    
    const address = app.listen({port: PORT, host: HOST}, (err) => {
      if (err) {
        app.log.error(err);
        process.exit(1);
      }
    });
    app.log.info(`🚀 Server started successfully on ${address}`);
  } catch(err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
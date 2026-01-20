import { AuthController } from "../Controllers/authController.js";
import { authenticate, requireAdmin, requireOwnerOrAdmin } from '../middleware/auth.js';
import { signupValidation, loginValidation } from '../middleware/validation.js';

export default async function authRoutes(app, options) {
  // Create controller instance with app reference for JWT access
  const authController = new AuthController(app);
  
  // Public routes
  app.post('/signup', { preHandler: [signupValidation] }, authController.signup);
  app.post('/login', { preHandler: [loginValidation] }, authController.login);
  app.post('/logout', authController.logout);
  app.post('/refresh', authController.refreshToken);
  
  // Admin routes
  app.post('/admin', { preHandler: [authenticate, requireAdmin] }, authController.createAdmin);
  
  // User profile routes
  app.get('/profile/:id', { preHandler: [authenticate, requireOwnerOrAdmin] }, authController.getProfile);
  app.put('/profile/:id', { preHandler: [authenticate, requireOwnerOrAdmin] }, authController.updateProfile);
}
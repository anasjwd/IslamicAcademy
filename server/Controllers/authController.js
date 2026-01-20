import UserModel from '../models/user.js';
import SubscriptionModel from '../models/subscription.js';
import crypto from 'crypto';

export class AuthController {
  constructor(app) {
    this.app = app;
  }

  /**
   * User signup/registration
   */
  signup = async (request, reply) => {
    try {
      const { first_name, last_name, email, password, age, is_employed, whatsapp_number } = request.body;
      
      // Validate required fields
      if (!first_name || !last_name || !email || !password) {
        return reply.code(400).send({
          success: false,
          message: 'Missing required fields: first_name, last_name, email, password'
        });
      }
      
      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return reply.code(409).send({
          success: false,
          message: 'Email already registered'
        });
      }
      
      // Create new user
      const user = await UserModel.create({
        first_name,
        last_name,
        email,
        password, // Will be hashed automatically
        role: 'client',
        age,
        is_employed,
        whatsapp_number
      });
      
      // Remove password from response
      delete user.password;
      
      return reply.code(201).send({
        success: true,
        message: 'User registered successfully',
        data: user
      });
      
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to register user',
        error: error.message
      });
    }
  }

  /**
   * User login
   */
  login = async (request, reply) => {
    try {
      const { email, password } = request.body;
      
      // Validate required fields
      if (!email || !password) {
        return reply.code(400).send({
          success: false,
          message: 'Email and password are required'
        });
      }
      
      // Find user by email
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return reply.code(401).send({
          success: false,
          message: 'Invalid email or password'
        });
      }
      
      // Verify password
      const isValidPassword = await UserModel.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return reply.code(401).send({
          success: false,
          message: 'Invalid email or password'
        });
      }
      
      // Remove password from response
      const userData = { ...user };
      delete userData.password;
      
      // Generate JWT tokens
      const payload = {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      };
      
      const accessToken = this.app.jwt.access.sign(payload);
      // Add random component to ensure uniqueness for rapid logins
      const refreshToken = this.app.jwt.refresh.sign({ id: user.id, nonce: crypto.randomBytes(16).toString('hex') });
      
      // Hash and store refresh token
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');
      await UserModel.storeRefreshToken(user.id, tokenHash, expiresAt);
      
      // Set refresh token as httpOnly cookie
      reply.setCookie('refreshToken', refreshToken, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      });
      
      return reply.code(200).send({
        success: true,
        message: 'Login successful',
        accessToken,
        data: userData
      });
      
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        message: 'Login failed',
        error: error.message
      });
    }
  }

  /**
   * User logout
   */
  logout = async (request, reply) => {
    try {
      const refreshToken = request.cookies.refreshToken;
      
      if (refreshToken) {
        // Hash the refresh token
        const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
        
        // Verify and decode the refresh token to get user ID
        try {
          const decoded = this.app.jwt.refresh.verify(refreshToken);
          // Delete all refresh tokens for this user
          await UserModel.deleteAllRefreshTokens(decoded.id);
        } catch (error) {
          // Token is invalid, but we'll still clear the cookie
          request.log.warn('Invalid refresh token during logout');
        }
      }
      
      // Clear the refresh token cookie
      reply.clearCookie('refreshToken', {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
      
      return reply.code(200).send({
        success: true,
        message: 'Logout successful'
      });
      
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        message: 'Logout failed',
        error: error.message
      });
    }
  }

  /**
   * Create admin user (protected route - should require admin authentication)
   */
  createAdmin = async (request, reply) => {
    try {
      const { first_name, last_name, email, password, whatsapp_number } = request.body;
      
      // Validate required fields
      if (!first_name || !last_name || !email || !password) {
        return reply.code(400).send({
          success: false,
          message: 'Missing required fields: first_name, last_name, email, password'
        });
      }
      
      // Admin authorization is handled by middleware
      
      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return reply.code(409).send({
          success: false,
          message: 'Email already registered'
        });
      }
      
      // Create admin user
      const admin = await UserModel.create({
        first_name,
        last_name,
        email,
        password,
        role: 'admin',
        whatsapp_number
      });
      
      // Remove password from response
      delete admin.password;
      
      return reply.code(201).send({
        success: true,
        message: 'Admin user created successfully',
        data: admin
      });
      
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to create admin user',
        error: error.message
      });
    }
  }

  /**
   * Get user profile
   */
  getProfile = async (request, reply) => {
    try {
      const { id } = request.params;
      
      // Authorization is handled by middleware
      
      const user = await UserModel.findById(id);
      if (!user) {
        return reply.code(404).send({
          success: false,
          message: 'User not found'
        });
      }
      
      // Remove password from response
      delete user.password;
      
      // Get user's subscriptions
      const subscriptions = await SubscriptionModel.findByUserId(id);
      
      return reply.code(200).send({
        success: true,
        data: {
          ...user,
          subscriptions
        }
      });
      
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to get user profile',
        error: error.message
      });
    }
  }

  /**
   * Update user profile
   */
  updateProfile = async (request, reply) => {
    try {
      const { id } = request.params;
      const updates = request.body;
      
      // Authorization is handled by middleware
      
      // Don't allow updating email or role through this endpoint
      delete updates.email;
      delete updates.role;
      delete updates.password;
      
      const success = await UserModel.update(id, updates);
      if (!success) {
        return reply.code(404).send({
          success: false,
          message: 'User not found'
        });
      }
      
      // Get updated user
      const user = await UserModel.findById(id);
      delete user.password;
      
      return reply.code(200).send({
        success: true,
        message: 'Profile updated successfully',
        data: user
      });
      
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to update profile',
        error: error.message
      });
    }
  }

  /**
   * Refresh access token using refresh token
   */
  refreshToken = async (request, reply) => {
    try {
      const refreshToken = request.cookies.refreshToken;
      
      if (!refreshToken) {
        return reply.code(401).send({
          success: false,
          message: 'No refresh token provided',
        });
      }

      // Verify refresh token
      const decoded = this.app.jwt.refresh.verify(refreshToken);
      
      // Hash the token to look it up in database
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      
      // Check if token exists in database
      const storedToken = await UserModel.findRefreshToken(decoded.id, tokenHash);
      
      if (!storedToken) {
        return reply.code(401).send({
          success: false,
          message: 'Invalid or expired refresh token',
        });
      }

      // Get user details
      const user = await UserModel.findById(decoded.id);
      
      if (!user) {
        return reply.code(404).send({
          success: false,
          message: 'User not found',
        });
      }

      // Generate new access token
      const payload = {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      };
      const newAccessToken = this.app.jwt.access.sign(payload);

      // Generate new refresh token
      const newRefreshToken = this.app.jwt.refresh.sign({ id: user.id });
      const newTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');

      // Rotate refresh token in database
      await UserModel.rotateRefreshToken(tokenHash, user.id, newTokenHash, expiresAt);

      // Set new refresh token cookie
      reply.setCookie('refreshToken', newRefreshToken, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      });

      return reply.code(200).send({
        success: true,
        accessToken: newAccessToken,
      });
    } catch (error) {
      request.log.error('Refresh token error:', error);
      return reply.code(401).send({
        success: false,
        message: 'Invalid or expired refresh token',
      });
    }
  }
}

// Don't export a singleton - let routes create instance with app reference
export default AuthController;
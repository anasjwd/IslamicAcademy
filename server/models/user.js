import { getPool } from '../config/database.js';
import bcrypt from 'bcrypt';
import RefreshTokenModel from './refreshToken.js';
import crypto from 'crypto';

class UserModel {
  constructor() {
    this.tableName = 'users';
  }

  /**
   * Create the users table if it doesn't exist
   */
  async createTable() {
    const pool = getPool();
    const query = `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id INT PRIMARY KEY AUTO_INCREMENT,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role ENUM('admin', 'client') DEFAULT 'client' NOT NULL,
        age INT,
        is_employed BOOLEAN DEFAULT FALSE,
        whatsapp_number VARCHAR(20),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    try {
      await pool.execute(query);
      console.log(`✅ Table ${this.tableName} created or already exists`);
      return true;
    } catch (error) {
      console.error(`❌ Error creating table ${this.tableName}:`, error.message);
      throw error;
    }
  }

  /**
   * Create a new user
   */
  async create(userData) {
    const pool = getPool();
    const { first_name, last_name, email, password, role = 'client', age, is_employed, whatsapp_number } = userData;
    
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const query = `
        INSERT INTO ${this.tableName} 
        (first_name, last_name, email, password, role, age, is_employed, whatsapp_number)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await pool.execute(query, [
        first_name,
        last_name,
        email,
        hashedPassword,
        role,
        age || null,
        is_employed || false,
        whatsapp_number || null
      ]);
      
      return {
        id: result.insertId,
        first_name,
        last_name,
        email,
        role,
        age,
        is_employed,
        whatsapp_number
      };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  async findById(id) {
    const pool = getPool();
    const query = `SELECT * FROM ${this.tableName} WHERE id = ?`;
    
    try {
      const [rows] = await pool.execute(query, [id]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email) {
    const pool = getPool();
    const query = `SELECT * FROM ${this.tableName} WHERE email = ?`;
    
    try {
      const [rows] = await pool.execute(query, [email]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify password
   */
  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Update user
   */
  async update(id, userData) {
    const pool = getPool();
    const allowedFields = ['first_name', 'last_name', 'age', 'is_employed', 'whatsapp_number', 'role'];
    const updates = [];
    const values = [];
    
    for (const [key, value] of Object.entries(userData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    values.push(id);
    const query = `UPDATE ${this.tableName} SET ${updates.join(', ')} WHERE id = ?`;
    
    try {
      const [result] = await pool.execute(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update password
   */
  async updatePassword(id, newPassword) {
    const pool = getPool();
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const query = `UPDATE ${this.tableName} SET password = ? WHERE id = ?`;
    
    try {
      const [result] = await pool.execute(query, [hashedPassword, id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete user
   */
  async delete(id) {
    const pool = getPool();
    const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
    
    try {
      const [result] = await pool.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find all users with optional filters
   */
  async findAll(filters = {}) {
    const pool = getPool();
    let query = `SELECT id, first_name, last_name, email, role, age, is_employed, whatsapp_number, created_at, updated_at FROM ${this.tableName}`;
    const conditions = [];
    const values = [];
    
    if (filters.role) {
      conditions.push('role = ?');
      values.push(filters.role);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY created_at DESC';
    
    if (filters.limit) {
      query += ' LIMIT ?';
      values.push(filters.limit);
    }
    
    try {
      const [rows] = await pool.execute(query, values);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Count users
   */
  async count(filters = {}) {
    const pool = getPool();
    let query = `SELECT COUNT(*) as count FROM ${this.tableName}`;
    const conditions = [];
    const values = [];
    
    if (filters.role) {
      conditions.push('role = ?');
      values.push(filters.role);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    try {
      const [rows] = await pool.execute(query, values);
      return rows[0].count;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find refresh token for a user
   */
  async findRefreshToken(userId, tokenHash) {
    return await RefreshTokenModel.findByUserAndHash(userId, tokenHash);
  }

  /**
   * Store a new refresh token
   */
  async storeRefreshToken(userId, tokenHash, expiresAt) {
    return await RefreshTokenModel.create(userId, tokenHash, expiresAt);
  }

  /**
   * Rotate refresh token - delete old and create new
   */
  async rotateRefreshToken(oldTokenHash, userId, newTokenHash, expiresAt) {
    return await RefreshTokenModel.rotate(oldTokenHash, userId, newTokenHash, expiresAt);
  }

  /**
   * Delete all refresh tokens for a user (used during logout)
   */
  async deleteAllRefreshTokens(userId) {
    return await RefreshTokenModel.deleteByUserId(userId);
  }
}

export default new UserModel();

import { getPool } from '../config/database.js';

class RefreshTokenModel {
  constructor() {
    this.tableName = 'refresh_tokens';
  }

  /**
   * Create the refresh_tokens table if it doesn't exist
   */
  async createTable() {
    const pool = getPool();
    const query = `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        token_hash VARCHAR(64) NOT NULL UNIQUE,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_token_hash (token_hash),
        INDEX idx_expires_at (expires_at)
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
   * Store a refresh token
   */
  async create(userId, tokenHash, expiresAt) {
    const pool = getPool();
    const query = `
      INSERT INTO ${this.tableName} (user_id, token_hash, expires_at)
      VALUES (?, ?, ?)
    `;
    
    try {
      const [result] = await pool.execute(query, [userId, tokenHash, expiresAt]);
      return {
        id: result.insertId,
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find a refresh token by user ID and token hash
   */
  async findByUserAndHash(userId, tokenHash) {
    const pool = getPool();
    const query = `
      SELECT * FROM ${this.tableName} 
      WHERE user_id = ? AND token_hash = ? AND expires_at > NOW()
    `;
    
    try {
      const [rows] = await pool.execute(query, [userId, tokenHash]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a specific refresh token
   */
  async deleteByHash(tokenHash) {
    const pool = getPool();
    const query = `DELETE FROM ${this.tableName} WHERE token_hash = ?`;
    
    try {
      const [result] = await pool.execute(query, [tokenHash]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete all refresh tokens for a user
   */
  async deleteByUserId(userId) {
    const pool = getPool();
    const query = `DELETE FROM ${this.tableName} WHERE user_id = ?`;
    
    try {
      const [result] = await pool.execute(query, [userId]);
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Clean up expired tokens (can be run periodically)
   */
  async deleteExpired() {
    const pool = getPool();
    const query = `DELETE FROM ${this.tableName} WHERE expires_at < NOW()`;
    
    try {
      const [result] = await pool.execute(query);
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Rotate refresh token - delete old and insert new
   */
  async rotate(oldTokenHash, userId, newTokenHash, expiresAt) {
    const pool = getPool();
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Delete old token
      await connection.execute(
        `DELETE FROM ${this.tableName} WHERE token_hash = ?`,
        [oldTokenHash]
      );
      
      // Insert new token
      await connection.execute(
        `INSERT INTO ${this.tableName} (user_id, token_hash, expires_at) VALUES (?, ?, ?)`,
        [userId, newTokenHash, expiresAt]
      );
      
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default new RefreshTokenModel();

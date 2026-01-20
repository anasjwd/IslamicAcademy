import { getPool } from '../config/database.js';

class SubscriptionModel {
  constructor() {
    this.tableName = 'subscriptions';
  }

  /**
   * Create the subscriptions table if it doesn't exist
   */
  async createTable() {
    const pool = getPool();
    const query = `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NULL,
        course_id INT NOT NULL,
        -- Guest user info (only for non-logged-in users)
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        email VARCHAR(255) NOT NULL,
        whatsapp_number VARCHAR(20),
        age INT,
        is_employed BOOLEAN,
        is_guest BOOLEAN DEFAULT TRUE,
        subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        -- Prevent duplicate subscriptions for logged-in users
        UNIQUE KEY unique_user_course (user_id, course_id),
        INDEX idx_email (email),
        INDEX idx_course_id (course_id),
        INDEX idx_user_id (user_id)
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
   * Create the subscription_details view
   */
  async createView() {
    const pool = getPool();
    const query = `
      CREATE OR REPLACE VIEW subscription_details AS
      SELECT 
        s.id as subscription_id,
        s.course_id,
        s.subscribed_at,
        s.is_guest,
        -- Use user data if exists, otherwise use subscription data
        COALESCE(u.id, NULL) as user_id,
        COALESCE(u.first_name, s.first_name) as first_name,
        COALESCE(u.last_name, s.last_name) as last_name,
        COALESCE(u.email, s.email) as email,
        COALESCE(u.whatsapp_number, s.whatsapp_number) as whatsapp_number,
        COALESCE(u.age, s.age) as age,
        COALESCE(u.is_employed, s.is_employed) as is_employed,
        u.role
      FROM ${this.tableName} s
      LEFT JOIN users u ON s.user_id = u.id;
    `;
    
    try {
      await pool.execute(query);
      console.log(`✅ View subscription_details created or replaced`);
      return true;
    } catch (error) {
      console.error(`❌ Error creating view:`, error.message);
      throw error;
    }
  }

  /**
   * Create a subscription for a logged-in user
   */
  async createForUser(userId, courseId) {
    const pool = getPool();
    
    try {
      // Get user email
      const [users] = await pool.execute('SELECT email FROM users WHERE id = ?', [userId]);
      if (users.length === 0) {
        throw new Error('User not found');
      }
      
      const query = `
        INSERT INTO ${this.tableName} 
        (user_id, course_id, email, is_guest)
        VALUES (?, ?, ?, FALSE)
      `;
      
      const [result] = await pool.execute(query, [userId, courseId, users[0].email]);
      
      return {
        id: result.insertId,
        user_id: userId,
        course_id: courseId,
        is_guest: false
      };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('User already subscribed to this course');
      }
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new Error('User or course not found');
      }
      throw error;
    }
  }

  /**
   * Create a subscription for a guest user
   */
  async createForGuest(guestData) {
    const pool = getPool();
    const { course_id, first_name, last_name, whatsapp_number, age, is_employed } = guestData;
    
    try {
      const query = `
        INSERT INTO ${this.tableName} 
        (user_id, course_id, first_name, last_name, email, whatsapp_number, age, is_employed, is_guest)
        VALUES (NULL, ?, ?, ?, NULL, ?, ?, ?, TRUE)
      `;
      
      const [result] = await pool.execute(query, [
        course_id,
        first_name,
        last_name,
        whatsapp_number || null,
        age || null,
        is_employed || false
      ]);
      
      return {
        id: result.insertId,
        course_id,
        first_name,
        last_name,
        whatsapp_number,
        age,
        is_employed,
        is_guest: true
      };
    } catch (error) {
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new Error('Course not found');
      }
      throw error;
    }
  }

  /**
   * Find subscription by ID
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
   * Check if user is subscribed to a course
   */
  async isUserSubscribed(userId, courseId) {
    const pool = getPool();
    const query = `
      SELECT id FROM ${this.tableName} 
      WHERE user_id = ? AND course_id = ?
    `;
    
    try {
      const [rows] = await pool.execute(query, [userId, courseId]);
      return rows.length > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all subscriptions for a user
   */
  async findByUserId(userId) {
    const pool = getPool();
    const query = `
      SELECT 
        s.*,
        c.name as course_name,
        c.description as course_description,
        c.image as course_image
      FROM ${this.tableName} s
      INNER JOIN courses c ON s.course_id = c.id
      WHERE s.user_id = ?
      ORDER BY s.subscribed_at DESC
    `;
    
    try {
      const [rows] = await pool.execute(query, [userId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all subscribers for a course using the view
   */
  async findByCourseId(courseId, filters = {}) {
    const pool = getPool();
    let query = `
      SELECT * FROM subscription_details 
      WHERE course_id = ?
    `;
    const values = [courseId];
    
    if (filters.is_guest !== undefined) {
      query += ' AND is_guest = ?';
      values.push(filters.is_guest);
    }
    
    query += ' ORDER BY subscribed_at DESC';
    
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
   * Get all subscribers (using view)
   */
  async findAll(filters = {}) {
    const pool = getPool();
    let query = 'SELECT * FROM subscription_details WHERE 1=1';
    const values = [];
    
    if (filters.is_guest !== undefined) {
      query += ' AND is_guest = ?';
      values.push(filters.is_guest);
    }
    
    if (filters.course_id) {
      query += ' AND course_id = ?';
      values.push(filters.course_id);
    }
    
    query += ' ORDER BY subscribed_at DESC';
    
    if (filters.limit) {
      query += ' LIMIT ?';
      values.push(filters.limit);
      
      if (filters.offset) {
        query += ' OFFSET ?';
        values.push(filters.offset);
      }
    }
    
    try {
      const [rows] = await pool.execute(query, values);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a subscription
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
   * Delete user subscription for a course
   */
  async deleteUserSubscription(userId, courseId) {
    const pool = getPool();
    const query = `
      DELETE FROM ${this.tableName} 
      WHERE user_id = ? AND course_id = ?
    `;
    
    try {
      const [result] = await pool.execute(query, [userId, courseId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Count subscriptions for a course
   */
  async countByCourseId(courseId) {
    const pool = getPool();
    const query = `
      SELECT COUNT(*) as count FROM ${this.tableName} 
      WHERE course_id = ?
    `;
    
    try {
      const [rows] = await pool.execute(query, [courseId]);
      return rows[0].count;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Count all subscriptions
   */
  async count(filters = {}) {
    const pool = getPool();
    let query = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE 1=1`;
    const values = [];
    
    if (filters.is_guest !== undefined) {
      query += ' AND is_guest = ?';
      values.push(filters.is_guest);
    }
    
    if (filters.course_id) {
      query += ' AND course_id = ?';
      values.push(filters.course_id);
    }
    
    try {
      const [rows] = await pool.execute(query, values);
      return rows[0].count;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get subscription statistics
   */
  async getStats() {
    const pool = getPool();
    const query = `
      SELECT 
        COUNT(*) as total_subscriptions,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT course_id) as courses_with_subscriptions,
        SUM(CASE WHEN is_guest = TRUE THEN 1 ELSE 0 END) as guest_subscriptions,
        SUM(CASE WHEN is_guest = FALSE THEN 1 ELSE 0 END) as user_subscriptions
      FROM ${this.tableName}
    `;
    
    try {
      const [rows] = await pool.execute(query);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }
}

export default new SubscriptionModel();

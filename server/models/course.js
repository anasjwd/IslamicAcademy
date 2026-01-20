import { getPool } from '../config/database.js';

class CourseModel {
  constructor() {
    this.tableName = 'courses';
  }

  /**
   * Create the courses table if it doesn't exist
   */
  async createTable() {
    const pool = getPool();
    const query = `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        label VARCHAR(255),
        description TEXT,
        image VARCHAR(500),
        duration VARCHAR(100),
        price DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name)
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
   * Create a new course
   */
  async create(courseData) {
    const pool = getPool();
    const { name, label, description, image, duration, price } = courseData;
    
    try {
      const query = `
        INSERT INTO ${this.tableName} 
        (name, label, description, image, duration, price)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await pool.execute(query, [
        name,
        label || null,
        description || null,
        image || null,
        duration || null,
        price || null
      ]);
      
      return {
        id: result.insertId,
        name,
        label,
        description,
        image,
        duration,
        price
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find course by ID
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
   * Find course by ID with files
   */
  async findByIdWithFiles(id) {
    const pool = getPool();
    const query = `
      SELECT 
        c.*,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', cf.id,
            'file_name', cf.file_name,
            'file_path', cf.file_path,
            'created_at', cf.created_at
          )
        ) as files
      FROM ${this.tableName} c
      LEFT JOIN course_files cf ON c.id = cf.course_id
      WHERE c.id = ?
      GROUP BY c.id
    `;
    
    try {
      const [rows] = await pool.execute(query, [id]);
      if (rows[0]) {
        // Parse the JSON array of files
        const course = rows[0];
        course.files = course.files ? JSON.parse(course.files) : [];
        // Filter out null files (when there are no files)
        course.files = course.files.filter(file => file.id !== null);
        return course;
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update course
   */
  async update(id, courseData) {
    const pool = getPool();
    const allowedFields = ['name', 'description', 'image'];
    const updates = [];
    const values = [];
    
    for (const [key, value] of Object.entries(courseData)) {
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
   * Delete course
   */
  async delete(id) {
    const pool = getPool();
    
    try {
      // Start transaction
      await pool.query('START TRANSACTION');
      
      // Delete related course files first
      await pool.execute('DELETE FROM course_files WHERE course_id = ?', [id]);
      
      // Delete related subscriptions
      await pool.execute('DELETE FROM subscriptions WHERE course_id = ?', [id]);
      
      // Delete the course
      const [result] = await pool.execute(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
      
      // Commit transaction
      await pool.query('COMMIT');
      
      return result.affectedRows > 0;
    } catch (error) {
      // Rollback on error
      await pool.query('ROLLBACK');
      throw error;
    }
  }

  /**
   * Find all courses
   */
  async findAll(filters = {}) {
    const pool = getPool();
    let query = `SELECT * FROM ${this.tableName}`;
    const conditions = [];
    const values = [];
    
    if (filters.search) {
      conditions.push('(name LIKE ? OR description LIKE ?)');
      const searchTerm = `%${filters.search}%`;
      values.push(searchTerm, searchTerm);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY created_at DESC';
    
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
   * Find all courses with subscriber count
   */
  async findAllWithSubscriberCount() {
    const pool = getPool();
    const query = `
      SELECT 
        c.*,
        COUNT(DISTINCT s.id) as subscriber_count
      FROM ${this.tableName} c
      LEFT JOIN subscriptions s ON c.id = s.course_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `;
    
    try {
      const [rows] = await pool.execute(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Count courses
   */
  async count(filters = {}) {
    const pool = getPool();
    let query = `SELECT COUNT(*) as count FROM ${this.tableName}`;
    const conditions = [];
    const values = [];
    
    if (filters.search) {
      conditions.push('(name LIKE ? OR description LIKE ?)');
      const searchTerm = `%${filters.search}%`;
      values.push(searchTerm, searchTerm);
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
}

export default new CourseModel();

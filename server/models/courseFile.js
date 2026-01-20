import { getPool } from '../config/database.js';

class CourseFileModel {
  constructor() {
    this.tableName = 'course_files';
  }

  /**
   * Create the course_files table if it doesn't exist
   */
  async createTable() {
    const pool = getPool();
    const query = `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id INT PRIMARY KEY AUTO_INCREMENT,
        course_id INT NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        INDEX idx_course_id (course_id)
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
   * Create a new course file
   */
  async create(fileData) {
    const pool = getPool();
    const { course_id, file_name, file_path } = fileData;
    
    try {
      const query = `
        INSERT INTO ${this.tableName} 
        (course_id, file_name, file_path)
        VALUES (?, ?, ?)
      `;
      
      const [result] = await pool.execute(query, [
        course_id,
        file_name,
        file_path
      ]);
      
      return {
        id: result.insertId,
        course_id,
        file_name,
        file_path
      };
    } catch (error) {
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new Error('Course not found');
      }
      throw error;
    }
  }

  /**
   * Create multiple course files at once
   */
  async createMany(courseId, filesData) {
    const pool = getPool();
    
    if (!Array.isArray(filesData) || filesData.length === 0) {
      throw new Error('filesData must be a non-empty array');
    }
    
    try {
      const values = filesData.map(file => [courseId, file.file_name, file.file_path]);
      const placeholders = filesData.map(() => '(?, ?, ?)').join(', ');
      const query = `
        INSERT INTO ${this.tableName} 
        (course_id, file_name, file_path)
        VALUES ${placeholders}
      `;
      
      const [result] = await pool.execute(query, values.flat());
      return result.affectedRows;
    } catch (error) {
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new Error('Course not found');
      }
      throw error;
    }
  }

  /**
   * Find file by ID
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
   * Find all files for a specific course
   */
  async findByCourseId(courseId) {
    const pool = getPool();
    const query = `
      SELECT * FROM ${this.tableName} 
      WHERE course_id = ?
      ORDER BY created_at ASC
    `;
    
    try {
      const [rows] = await pool.execute(query, [courseId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update course file
   */
  async update(id, fileData) {
    const pool = getPool();
    const allowedFields = ['file_name', 'file_path'];
    const updates = [];
    const values = [];
    
    for (const [key, value] of Object.entries(fileData)) {
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
   * Delete course file
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
   * Delete all files for a course
   */
  async deleteByCourseId(courseId) {
    const pool = getPool();
    const query = `DELETE FROM ${this.tableName} WHERE course_id = ?`;
    
    try {
      const [result] = await pool.execute(query, [courseId]);
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Count files for a course
   */
  async countByCourseId(courseId) {
    const pool = getPool();
    const query = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE course_id = ?`;
    
    try {
      const [rows] = await pool.execute(query, [courseId]);
      return rows[0].count;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find all files
   */
  async findAll() {
    const pool = getPool();
    const query = `
      SELECT 
        cf.*,
        c.name as course_name
      FROM ${this.tableName} cf
      INNER JOIN courses c ON cf.course_id = c.id
      ORDER BY cf.created_at DESC
    `;
    
    try {
      const [rows] = await pool.execute(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

export default new CourseFileModel();

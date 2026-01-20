import { getPool, initDatabase } from './config/database.js';

async function addLabelColumn() {
  try {
    await initDatabase();
    const pool = getPool();
    
    // Check if column exists
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'courses' 
      AND COLUMN_NAME = 'label'
    `);
    
    if (columns.length === 0) {
      // Add the label column after name
      await pool.execute(`
        ALTER TABLE courses 
        ADD COLUMN label VARCHAR(255) AFTER name
      `);
      console.log('✅ Label column added successfully');
    } else {
      console.log('ℹ️ Label column already exists');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addLabelColumn();

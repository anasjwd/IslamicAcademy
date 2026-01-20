import { initDatabase, getPool } from './config/database.js';

async function checkConstraints() {
  try {
    await initDatabase();
    const pool = getPool();
    
    // Check foreign keys on courses table
    const [fks] = await pool.query(`
      SELECT 
        CONSTRAINT_NAME,
        TABLE_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = 'islamic_academy'
        AND REFERENCED_TABLE_NAME = 'courses'
    `);
    
    console.log('\nForeign keys referencing courses table:');
    console.table(fks);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkConstraints();

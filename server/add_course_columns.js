import { initDatabase, getPool } from './config/database.js';

async function addColumns() {
  try {
    await initDatabase();
    const pool = getPool();
    
    console.log('Adding duration and price columns to courses table...');
    
    // Check if columns already exist
    const [columns] = await pool.query("SHOW COLUMNS FROM courses LIKE 'duration'");
    
    if (columns.length === 0) {
      await pool.query('ALTER TABLE courses ADD COLUMN duration VARCHAR(100) AFTER image');
      console.log('✅ Added duration column');
    } else {
      console.log('ℹ️  duration column already exists');
    }
    
    const [priceColumns] = await pool.query("SHOW COLUMNS FROM courses LIKE 'price'");
    
    if (priceColumns.length === 0) {
      await pool.query('ALTER TABLE courses ADD COLUMN price DECIMAL(10, 2) AFTER duration');
      console.log('✅ Added price column');
    } else {
      console.log('ℹ️  price column already exists');
    }
    
    console.log('\n✅ Database schema updated successfully!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

addColumns();

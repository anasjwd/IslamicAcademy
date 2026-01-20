import { initDatabase, getPool } from './config/database.js';

async function fixEmailColumn() {
  try {
    await initDatabase();
    const pool = getPool();
    
    console.log('Making email column nullable in subscriptions table...');
    
    await pool.query('ALTER TABLE subscriptions MODIFY COLUMN email VARCHAR(255) NULL');
    
    console.log('✅ Email column is now nullable\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixEmailColumn();

import { initDatabase, getPool } from './config/database.js';

async function checkUsers() {
  try {
    await initDatabase();
    const pool = getPool();
    const [users] = await pool.query('SELECT id, first_name, last_name, email, role FROM users');
    
    console.log('\n📊 Current users in database:');
    if (users.length === 0) {
      console.log('❌ No users found in database\n');
    } else {
      console.table(users);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkUsers();

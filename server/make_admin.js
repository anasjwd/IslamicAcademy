import { initDatabase, getPool } from './config/database.js';

async function makeAdmin() {
  try {
    await initDatabase();
    const pool = getPool();
    
    // Update user with id 1 to admin
    await pool.query('UPDATE users SET role = ? WHERE id = ?', ['admin', 1]);
    
    const [users] = await pool.query('SELECT id, first_name, last_name, email, role FROM users WHERE id = 1');
    
    console.log('\n✅ User updated successfully!');
    console.table(users);
    console.log('You can now log in as admin with: anasjawad@gmail.com\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

makeAdmin();

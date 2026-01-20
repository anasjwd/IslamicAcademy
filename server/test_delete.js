import { initDatabase, getPool } from './config/database.js';
import CourseModel from './models/course.js';

async function testDelete() {
  try {
    await initDatabase();
    
    // First, let's see what courses exist
    const pool = getPool();
    const [courses] = await pool.query('SELECT id, name FROM courses LIMIT 5');
    console.log('\nAvailable courses:');
    console.table(courses);
    
    if (courses.length > 0) {
      const courseId = courses[0].id;
      console.log(`\nTrying to delete course ID: ${courseId}`);
      
      const result = await CourseModel.delete(courseId);
      console.log('Delete result:', result);
      
      if (result) {
        console.log('✅ Course deleted successfully');
      } else {
        console.log('❌ Course not found');
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testDelete();

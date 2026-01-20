import { initDatabase, closeDatabase } from '../config/database.js';
import UserModel from '../models/user.js';
import CourseModel from '../models/course.js';
import CourseFileModel from '../models/courseFile.js';
import SubscriptionModel from '../models/subscription.js';
import RefreshTokenModel from '../models/refreshToken.js';
import bcrypt from 'bcrypt';

/**
 * Initialize database and create all tables
 */
async function initializeTables() {
  try {
    console.log('🚀 Starting database initialization...\n');
    
    // Initialize database connection
    await initDatabase();
    
    // Create tables in order (respecting foreign key constraints)
    console.log('📦 Creating tables...\n');
    
    await UserModel.createTable();
    await CourseModel.createTable();
    await CourseFileModel.createTable();
    await SubscriptionModel.createTable();
    await RefreshTokenModel.createTable();
    
    // Create view
    console.log('\n📊 Creating views...\n');
    await SubscriptionModel.createView();
    
    console.log('\n✅ Database initialization completed successfully!\n');
    
  } catch (error) {
    console.error('\n❌ Database initialization failed:', error.message);
    throw error;
  }
}

/**
 * Seed database with sample data
 */
async function seedDatabase() {
  try {
    console.log('🌱 Seeding database with sample data...\n');
    
    // Check if admin credentials are set
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminEmail || !adminPassword) {
      console.log('⚠️  ADMIN_EMAIL and ADMIN_PASSWORD not set in .env file');
      console.log('   Skipping admin user creation.');
      console.log('   Add ADMIN_EMAIL and ADMIN_PASSWORD to .env and run again.\n');
    } else {
      // Check if admin already exists
      const existingAdmin = await UserModel.findByEmail(adminEmail);
      
      if (!existingAdmin) {
        // Create admin user
        console.log('👤 Creating admin user...');
        const admin = await UserModel.create({
          first_name: 'Admin',
          last_name: 'User',
          email: adminEmail,
          password: adminPassword,
          role: 'admin',
          whatsapp_number: '+212600000000'
        });
        console.log('✅ Admin user created with ID:', admin.id);
        console.log('   Email:', adminEmail);
      } else {
        console.log('ℹ️  Admin user already exists');
      }
    }
    
    // Create sample courses
    console.log('\n📚 Creating sample courses...');
    const course1 = await CourseModel.create({
      name: 'Introduction to Web Development',
      description: 'Learn HTML, CSS, and JavaScript basics',
      image: '/images/web-dev.jpg'
    });
    console.log('✅ Course created:', course1.name);
    
    const course2 = await CourseModel.create({
      name: 'Advanced Node.js',
      description: 'Master backend development with Node.js',
      image: '/images/nodejs.jpg'
    });
    console.log('✅ Course created:', course2.name);
    
    // Create course files
    console.log('\n📄 Creating course files...');
    await CourseFileModel.create({
      course_id: course1.id,
      file_name: 'Lesson 1 - HTML Basics.pdf',
      file_path: '/uploads/courses/1/lesson1.pdf'
    });
    
    await CourseFileModel.create({
      course_id: course1.id,
      file_name: 'Lesson 2 - CSS Fundamentals.pdf',
      file_path: '/uploads/courses/1/lesson2.pdf'
    });
    
    await CourseFileModel.create({
      course_id: course2.id,
      file_name: 'Node.js Introduction.pdf',
      file_path: '/uploads/courses/2/intro.pdf'
    });
    console.log('✅ Course files created');
    
    // Create sample subscriptions
    console.log('\n📝 Creating sample subscriptions...');
    
    // Guest subscription
    await SubscriptionModel.createForGuest({
      course_id: course1.id,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      whatsapp_number: '+212611111111',
      age: 25,
      is_employed: true
    });
    console.log('✅ Guest subscription created');
    
    // Logged-in user subscription (if admin exists)
    if (existingAdmin) {
      try {
        await SubscriptionModel.createForUser(existingAdmin.id, course2.id);
        console.log('✅ User subscription created');
      } catch (error) {
        console.log('ℹ️  User subscription already exists');
      }
    }
    
    console.log('\n✅ Database seeded successfully!\n');
    
  } catch (error) {
    console.error('\n❌ Database seeding failed:', error.message);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    await initializeTables();
    
    // Ask if user wants to seed
    console.log('Do you want to seed the database with sample data? (yes/no)');
    console.log('You can run this script with --seed flag to automatically seed\n');
    
    const shouldSeed = process.argv.includes('--seed');
    
    if (shouldSeed) {
      await seedDatabase();
    } else {
      console.log('Skipping database seeding. Run with --seed flag to seed data.\n');
    }
    
    console.log('🎉 All done! Database is ready to use.\n');
    
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await closeDatabase();
    process.exit(0);
  }
}

// Run the script
main();

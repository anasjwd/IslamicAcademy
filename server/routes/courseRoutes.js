import courseController from '../Controllers/courseController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { courseValidation } from '../middleware/validation.js';

export default async function courseRoutes(app, options) {
  // Public routes - anyone can view courses and files
  app.get('/courses', courseController.getAllCourses);
  app.get('/courses/stats', courseController.getCoursesWithStats);
  app.get('/courses/:id', courseController.getCourseById);
  app.get('/courses/:id/files', courseController.getCourseFiles);
  
  // Admin routes - require authentication
  app.post('/courses', { preHandler: [authenticate, requireAdmin, courseValidation] }, courseController.createCourse);
  app.put('/courses/:id', { preHandler: [authenticate, requireAdmin] }, courseController.updateCourse);
  app.delete('/courses/:id', { preHandler: [authenticate, requireAdmin] }, courseController.deleteCourse);
  
  // File management - admin only
  app.post('/courses/:id/files', { preHandler: [authenticate, requireAdmin] }, courseController.addCourseFiles);
  app.delete('/courses/files/:fileId', { preHandler: [authenticate, requireAdmin] }, courseController.deleteCourseFile);
  
  // Subscriber management - admin only
  app.get('/courses/:id/subscribers', { preHandler: [authenticate, requireAdmin] }, courseController.getCourseSubscribers);
}

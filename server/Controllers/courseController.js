import CourseModel from '../models/course.js';
import CourseFileModel from '../models/courseFile.js';
import SubscriptionModel from '../models/subscription.js';
import { promises as fs } from 'fs';
import path from 'path';

export class CourseController {
  /**
   * Get all courses
   */
  getAllCourses = async (request, reply) => {
    try {
      const { search, limit, offset } = request.query;
      
      const courses = await CourseModel.findAll({ search, limit, offset });
      const total = await CourseModel.count({ search });
      
      return reply.code(200).send({
        success: true,
        data: courses,
        pagination: {
          total,
          limit: limit ? parseInt(limit) : null,
          offset: offset ? parseInt(offset) : 0
        }
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to fetch courses',
        error: error.message
      });
    }
  }

  /**
   * Get all courses with subscriber counts
   */
  getCoursesWithStats = async (request, reply) => {
    try {
      const courses = await CourseModel.findAllWithSubscriberCount();
      
      return reply.code(200).send({
        success: true,
        data: courses
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to fetch courses with stats',
        error: error.message
      });
    }
  }

  /**
   * Get a single course by ID
   */
  getCourseById = async (request, reply) => {
    try {
      const { id } = request.params;
      
      const course = await CourseModel.findByIdWithFiles(id);
      if (!course) {
        return reply.code(404).send({
          success: false,
          message: 'Course not found'
        });
      }
      
      // Get subscriber count
      const subscriberCount = await SubscriptionModel.countByCourseId(id);
      course.subscriber_count = subscriberCount;
      
      return reply.code(200).send({
        success: true,
        data: course
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to fetch course',
        error: error.message
      });
    }
  }

  /**
   * Create a new course (admin only)
   */
  createCourse = async (request, reply) => {
    try {
      const { name, label, description, image, duration, price } = request.body;
      
      if (!name) {
        return reply.code(400).send({
          success: false,
          message: 'Course name is required'
        });
      }
      
      // Admin authorization is handled by middleware
      
      const course = await CourseModel.create({ name, label, description, image, duration, price });
      
      return reply.code(201).send({
        success: true,
        message: 'Course created successfully',
        data: course
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to create course',
        error: error.message
      });
    }
  }

  /**
   * Update a course (admin only)
   */
  updateCourse = async (request, reply) => {
    try {
      const { id } = request.params;
      const updates = request.body;
      
      // Admin authorization is handled by middleware
      
      const success = await CourseModel.update(id, updates);
      if (!success) {
        return reply.code(404).send({
          success: false,
          message: 'Course not found'
        });
      }
      
      const course = await CourseModel.findById(id);
      
      return reply.code(200).send({
        success: true,
        message: 'Course updated successfully',
        data: course
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to update course',
        error: error.message
      });
    }
  }

  /**
   * Delete a course (admin only)
   */
  deleteCourse = async (request, reply) => {
    try {
      const { id } = request.params;
      
      // Admin authorization is handled by middleware
      
      const success = await CourseModel.delete(id);
      if (!success) {
        return reply.code(404).send({
          success: false,
          message: 'Course not found'
        });
      }
      
      return reply.code(200).send({
        success: true,
        message: 'Course deleted successfully'
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to delete course',
        error: error.message
      });
    }
  }

  /**
   * Add files to a course (admin only)
   * Handles PDF file uploads via multipart/form-data
   * Requires @fastify/multipart plugin
   */
  addCourseFiles = async (request, reply) => {
    try {
      const { id } = request.params;
      
      // Admin authorization is handled by middleware
      
      // Verify course exists
      const course = await CourseModel.findById(id);
      if (!course) {
        return reply.code(404).send({
          success: false,
          message: 'Course not found'
        });
      }
      
      // Get uploaded files from multipart form data
      const parts = request.parts();
      const uploadedFiles = [];
      
      // Create upload directory if it doesn't exist
      const uploadDir = `./uploads/courses/${id}`;
      await fs.mkdir(uploadDir, { recursive: true });
      
      // Process each uploaded file
      for await (const part of parts) {
        if (part.type === 'file') {
          // Validate file type (PDF only)
          const mimeType = part.mimetype;
          if (mimeType !== 'application/pdf') {
            return reply.code(400).send({
              success: false,
              message: 'Only PDF files are allowed'
            });
          }
          
          // Generate unique filename
          const timestamp = Date.now();
          const sanitizedFilename = part.filename.replace(/[^a-zA-Z0-9.-]/g, '_');
          const filename = `${timestamp}_${sanitizedFilename}`;
          const filePath = path.join(uploadDir, filename);
          
          // Save file to disk
          const buffer = await part.toBuffer();
          await fs.writeFile(filePath, buffer);
          
          // Store file info for database
          uploadedFiles.push({
            file_name: part.filename,
            file_path: `/uploads/courses/${id}/${filename}`
          });
        }
      }
      
      if (uploadedFiles.length === 0) {
        return reply.code(400).send({
          success: false,
          message: 'No files uploaded'
        });
      }
      
      // Save file records to database
      const count = await CourseFileModel.createMany(id, uploadedFiles);
      
      return reply.code(201).send({
        success: true,
        message: `${count} file(s) uploaded successfully`,
        data: uploadedFiles
      });
      
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to upload course files',
        error: error.message
      });
    }
  }

  /**
   * Get all files for a course
   */
  getCourseFiles = async (request, reply) => {
    try {
      const { id } = request.params;
      
      const files = await CourseFileModel.findByCourseId(id);
      
      return reply.code(200).send({
        success: true,
        data: files
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to fetch course files',
        error: error.message
      });
    }
  }

  /**
   * Delete a course file (admin only)
   * Also removes the physical file from disk
   */
  deleteCourseFile = async (request, reply) => {
    try {
      const { fileId } = request.params;
      
      // Admin authorization is handled by middleware
      
      // Get file info before deleting
      const file = await CourseFileModel.findById(fileId);
      if (!file) {
        return reply.code(404).send({
          success: false,
          message: 'File not found'
        });
      }
      
      // Delete from database
      const success = await CourseFileModel.delete(fileId);
      if (!success) {
        return reply.code(500).send({
          success: false,
          message: 'Failed to delete file from database'
        });
      }
      
      // Delete physical file from disk
      try {
        const filePath = path.join('.', file.file_path);
        await fs.unlink(filePath);
        request.log.info(`Deleted file from disk: ${filePath}`);
      } catch (fsError) {
        // Log error but don't fail the request (file might already be deleted)
        request.log.warn(`Could not delete file from disk: ${fsError.message}`);
      }
      
      return reply.code(200).send({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to delete file',
        error: error.message
      });
    }
  }

  /**
   * Get subscribers for a course (admin only)
   */
  getCourseSubscribers = async (request, reply) => {
    try {
      const { id } = request.params;
      const { is_guest } = request.query;
      
      // Admin authorization is handled by middleware
      
      const filters = { is_guest: is_guest !== undefined ? is_guest === 'true' : undefined };
      const subscribers = await SubscriptionModel.findByCourseId(id, filters);
      
      return reply.code(200).send({
        success: true,
        data: subscribers
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to fetch course subscribers',
        error: error.message
      });
    }
  }
}

export default new CourseController();

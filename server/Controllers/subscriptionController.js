import SubscriptionModel from '../models/subscription.js';
import UserModel from '../models/user.js';
import CourseModel from '../models/course.js';

export class SubscriptionController {
  /**
   * Subscribe to a course (logged-in user)
   */
  subscribeUser = async (request, reply) => {
    try {
      const { courseId } = request.params;
      const userId = request.user.id; // Get from JWT token
      

      // Check if course exists
      const course = await CourseModel.findById(courseId);
      if (!course) {
        return reply.code(404).send({
          success: false,
          message: 'Course not found'
        });
      }
      
      // Check if already subscribed
      const isSubscribed = await SubscriptionModel.isUserSubscribed(userId, courseId);
      if (isSubscribed) {
        return reply.code(409).send({
          success: false,
          message: 'Already subscribed to this course'
        });
      }
      
      const subscription = await SubscriptionModel.createForUser(userId, courseId);
      
      return reply.code(201).send({
        success: true,
        message: 'Successfully subscribed to course',
        data: subscription
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to subscribe to course',
        error: error.message
      });
    }
  }

  /**
   * Subscribe to a course (guest user)
   */
  subscribeGuest = async (request, reply) => {
    try {
      const { courseId } = request.params;
      const { first_name, last_name, whatsapp_number, age, is_employed } = request.body;
      
      // Validate required fields
      if (!first_name || !last_name) {
        return reply.code(400).send({
          success: false,
          message: 'First name and last name are required'
        });
      }
      
      // Check if course exists
      const course = await CourseModel.findById(courseId);
      if (!course) {
        return reply.code(404).send({
          success: false,
          message: 'Course not found'
        });
      }
      
      const subscription = await SubscriptionModel.createForGuest({
        course_id: courseId,
        first_name,
        last_name,
        whatsapp_number,
        age,
        is_employed
      });
      
      return reply.code(201).send({
        success: true,
        message: 'Successfully subscribed to course',
        data: subscription
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to subscribe to course',
        error: error.message
      });
    }
  }

  /**
   * Unsubscribe from a course
   */
  unsubscribe = async (request, reply) => {
    try {
      const { courseId } = request.params;
      const userId = request.user.id; // Get from JWT token
      
      const success = await SubscriptionModel.deleteUserSubscription(userId, courseId);
      if (!success) {
        return reply.code(404).send({
          success: false,
          message: 'Subscription not found'
        });
      }
      
      return reply.code(200).send({
        success: true,
        message: 'Successfully unsubscribed from course'
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to unsubscribe from course',
        error: error.message
      });
    }
  }

  /**
   * Get user's subscriptions
   */
  getUserSubscriptions = async (request, reply) => {
    try {
      const { userId } = request.params;
      // Authorization is handled by middleware
      
      const subscriptions = await SubscriptionModel.findByUserId(userId);
      
      return reply.code(200).send({
        success: true,
        data: subscriptions
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to fetch subscriptions',
        error: error.message
      });
    }
  }

  /**
   * Get all subscriptions (admin only)
   */
  getAllSubscriptions = async (request, reply) => {
    try {
      const { is_guest, course_id, limit, offset } = request.query;
      
      // Admin authorization is handled by middleware
      
      const filters = {
        is_guest: is_guest !== undefined ? is_guest === 'true' : undefined,
        course_id: course_id ? parseInt(course_id) : undefined,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined
      };
      
      const subscriptions = await SubscriptionModel.findAll(filters);
      const total = await SubscriptionModel.count(filters);
      
      return reply.code(200).send({
        success: true,
        data: subscriptions,
        pagination: {
          total,
          limit: filters.limit || null,
          offset: filters.offset || 0
        }
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to fetch subscriptions',
        error: error.message
      });
    }
  }

  /**
   * Get subscription statistics (admin only)
   */
  getStats = async (request, reply) => {
    try {
      // Admin authorization is handled by middleware
      
      const stats = await SubscriptionModel.getStats();
      
      return reply.code(200).send({
        success: true,
        data: stats
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to fetch statistics',
        error: error.message
      });
    }
  }

  /**
   * Delete a subscription (admin only)
   */
  deleteSubscription = async (request, reply) => {
    try {
      const { id } = request.params;
      
      // Admin authorization is handled by middleware
      
      const success = await SubscriptionModel.delete(id);
      if (!success) {
        return reply.code(404).send({
          success: false,
          message: 'Subscription not found'
        });
      }
      
      return reply.code(200).send({
        success: true,
        message: 'Subscription deleted successfully'
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to delete subscription',
        error: error.message
      });
    }
  }
}

export default new SubscriptionController();

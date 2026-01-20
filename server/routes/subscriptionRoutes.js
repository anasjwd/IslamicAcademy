import subscriptionController from '../Controllers/subscriptionController.js';
import { authenticate, requireAdmin, requireOwnerOrAdmin } from '../middleware/auth.js';
import { guestSubscriptionValidation } from '../middleware/validation.js';

export default async function subscriptionRoutes(app, options) {
  // User subscription routes (require user authentication)
  app.post('/courses/:courseId/subscribe', { preHandler: [authenticate] }, subscriptionController.subscribeUser);
  app.post('/courses/:courseId/unsubscribe', { preHandler: [authenticate] }, subscriptionController.unsubscribe);
  app.get('/users/:userId/subscriptions', { preHandler: [authenticate, requireOwnerOrAdmin] }, subscriptionController.getUserSubscriptions);
  
  // Guest subscription routes (public)
  app.post('/courses/:courseId/subscribe/guest', { preHandler: [guestSubscriptionValidation] }, subscriptionController.subscribeGuest);
  
  // Admin routes (require admin authentication)
  app.get('/subscriptions', { preHandler: [authenticate, requireAdmin] }, subscriptionController.getAllSubscriptions);
  app.get('/subscriptions/stats', { preHandler: [authenticate, requireAdmin] }, subscriptionController.getStats);
  app.delete('/subscriptions/:id', { preHandler: [authenticate, requireAdmin] }, subscriptionController.deleteSubscription);
}

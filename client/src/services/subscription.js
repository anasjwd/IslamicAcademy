import api from './api';

class SubscriptionService {
  async subscribeUser(courseId) {
    const response = await api.post(`/api/courses/${courseId}/subscribe`);
    return response;
  }

  async subscribeGuest(courseId, guestData) {
    const response = await api.post(`/api/courses/${courseId}/subscribe/guest`, guestData);
    return response;
  }

  async unsubscribe(courseId) {
    const response = await api.post(`/api/courses/${courseId}/unsubscribe`);
    return response;
  }

  async getUserSubscriptions(userId) {
    const response = await api.get(`/api/users/${userId}/subscriptions`);
    return response;
  }
}

export default new SubscriptionService();

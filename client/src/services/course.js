import api from './api';

class CourseService {
  async getAllCourses(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.offset) queryParams.append('offset', params.offset);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/courses?${queryString}` : '/api/courses';
    
    const response = await api.get(endpoint);
    return response;
  }

  async getCoursesWithStats() {
    const response = await api.get('/api/courses/stats');
    return response;
  }

  async getCourseById(courseId) {
    const response = await api.get(`/api/courses/${courseId}`);
    return response;
  }

  async getCourseFiles(courseId) {
    const response = await api.get(`/api/courses/${courseId}/files`);
    return response;
  }

  async createCourse(courseData) {
    const response = await api.post('/api/courses', courseData);
    return response;
  }

  async deleteCourse(courseId) {
    const response = await api.delete(`/api/courses/${courseId}`);
    return response;
  }

  async addCourseFiles(courseId, files) {
    const formData = new FormData();
    for (let file of files) {
      formData.append('files', file);
    }
    
    const response = await api.uploadFiles(`/api/courses/${courseId}/files`, formData);
    return response;
  }

  async deleteCourseFile(fileId) {
    const response = await api.delete(`/api/courses/files/${fileId}`);
    return response;
  }

  async getCourseSubscribers(courseId) {
    const response = await api.get(`/api/courses/${courseId}/subscribers`);
    return response;
  }
}

export default new CourseService();

import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import courseService from '../../services/course';
import { useAuth } from '../../hooks/useAuth';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilesModal, setShowFilesModal] = useState(false);
  const [showSubscribersModal, setShowSubscribersModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseFiles, setCourseFiles] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [courseData, setCourseData] = useState({
    name: '',
    label: '',
    description: '',
    duration: '',
    price: '',
    image: ''
  });

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchCourses();
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      const response = await courseService.getCoursesWithStats();
      if (response.success) {
        setCourses(response.data);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  const handleInputChange = (e) => {
    setCourseData({
      ...courseData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validation
    if (!courseData.name || !courseData.description) {
      setError('العنوان والوصف مطلوبان');
      setLoading(false);
      return;
    }

    try {
      const response = await courseService.createCourse(courseData);
      if (response.success) {
        setSuccess('تم إضافة البرنامج بنجاح!');
        setCourseData({
          name: '',
          label: '',
          description: '',
          duration: '',
          price: '',
          image: ''
        });
        fetchCourses();
        setTimeout(() => {
          setShowAddModal(false);
          setSuccess('');
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'فشل إضافة البرنامج');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا البرنامج؟')) {
      return;
    }

    try {
      const response = await courseService.deleteCourse(courseId);
      console.log('Delete response:', response);
      
      if (response.success) {
        setSuccess('تم حذف البرنامج بنجاح');
        fetchCourses();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || 'فشل حذف البرنامج');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.message || 'فشل حذف البرنامج');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleManageFiles = async (course) => {
    setSelectedCourse(course);
    setShowFilesModal(true);
    try {
      const response = await courseService.getCourseFiles(course.id);
      if (response.success) {
        setCourseFiles(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching files:', err);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setLoading(true);
    setError('');
    
    try {
      const response = await courseService.addCourseFiles(selectedCourse.id, files);
      if (response.success) {
        setSuccess('تم رفع الملفات بنجاح');
        // Refresh files list
        const filesResponse = await courseService.getCourseFiles(selectedCourse.id);
        if (filesResponse.success) {
          setCourseFiles(filesResponse.data || []);
        }
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'فشل رفع الملفات');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الملف؟')) {
      return;
    }

    try {
      const response = await courseService.deleteCourseFile(fileId);
      if (response.success) {
        setSuccess('تم حذف الملف بنجاح');
        // Refresh files list
        const filesResponse = await courseService.getCourseFiles(selectedCourse.id);
        if (filesResponse.success) {
          setCourseFiles(filesResponse.data || []);
        }
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('فشل حذف الملف');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleViewSubscribers = async (course) => {
    setSelectedCourse(course);
    setShowSubscribersModal(true);
    setLoading(true);
    try {
      const response = await courseService.getCourseSubscribers(course.id);
      if (response.success) {
        setSubscribers(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching subscribers:', err);
      setError('فشل تحميل المشتركين');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="admin-dashboard">
        <div className="access-denied">
          <h2>غير مصرح لك بالوصول</h2>
          <p>هذه الصفحة متاحة للمشرفين فقط</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>لوحة التحكم - إدارة البرامج</h1>
        <button className="add-course-btn" onClick={() => setShowAddModal(true)}>
          + إضافة برنامج جديد
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="courses-table">
        <table>
          <thead>
            <tr>
              <th>الرقم</th>
              <th>العنوان</th>
              <th>المدة</th>
              <th>السعر</th>
              <th>عدد الطلاب</th>
              <th>المشتركون</th>
              <th>الملفات</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course, index) => (
              <tr key={course.id}>
                <td>{index + 1}</td>
                <td>{course.name}</td>
                <td>{course.duration || 'غير محدد'}</td>
                <td>{course.price ? `${course.price} د.م.` : 'مجاني'}</td>
                <td>{course.subscriber_count || 0}</td>
                <td>
                  <button 
                    className="btn-subscribers"
                    onClick={() => handleViewSubscribers(course)}
                  >
                    عرض المشتركين
                  </button>
                </td>
                <td>
                  <button 
                    className="btn-files"
                    onClick={() => handleManageFiles(course)}
                  >
                    إدارة الملفات
                  </button>
                </td>
                <td>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDelete(course.id)}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>إضافة برنامج جديد</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="course-form">
              <div className="form-group">
                <label>عنوان البرنامج *</label>
                <input
                  type="text"
                  name="name"
                  value={courseData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="مثال: تَفْسِيرُ الْقُرْآنِ الْكَرِيمِ"
                />
              </div>

              <div className="form-group">
                <label>التصنيف (Label)</label>
                <input
                  type="text"
                  name="label"
                  value={courseData.label}
                  onChange={handleInputChange}
                  placeholder="مثال: علوم القرآن، الفقه الإسلامي، اللغة العربية"
                />
              </div>

              <div className="form-group">
                <label>الوصف *</label>
                <textarea
                  name="description"
                  value={courseData.description}
                  onChange={handleInputChange}
                  required
                  rows="5"
                  placeholder="وصف تفصيلي للبرنامج..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>المدة</label>
                  <input
                    type="text"
                    name="duration"
                    value={courseData.duration}
                    onChange={handleInputChange}
                    placeholder="مثال: 12 أسبوع"
                  />
                </div>

                <div className="form-group">
                  <label>السعر (درهم)</label>
                  <input
                    type="number"
                    name="price"
                    value={courseData.price}
                    onChange={handleInputChange}
                    placeholder="299"
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>رابط الصورة</label>
                <input
                  type="text"
                  name="image"
                  value={courseData.image}
                  onChange={handleInputChange}
                  placeholder="رابط الصورة (اختياري)"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? 'جاري الإضافة...' : 'إضافة البرنامج'}
                </button>
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => setShowAddModal(false)}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showFilesModal && selectedCourse && (
        <div className="modal-overlay" onClick={() => setShowFilesModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>إدارة ملفات: {selectedCourse.name}</h2>
              <button className="close-btn" onClick={() => setShowFilesModal(false)}>×</button>
            </div>

            <div className="files-management">
              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <div className="upload-section">
                <label htmlFor="file-upload" className="upload-label">
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={handleFileUpload}
                    disabled={loading}
                    style={{ display: 'none' }}
                  />
                  <span className="upload-btn">
                    {loading ? 'جاري الرفع...' : '+ رفع ملفات PDF'}
                  </span>
                </label>
              </div>

              <div className="files-list">
                <h3>الملفات الحالية ({courseFiles.length})</h3>
                {courseFiles.length === 0 ? (
                  <p className="no-files">لا توجد ملفات مرفقة</p>
                ) : (
                  <ul>
                    {courseFiles.map((file) => (
                      <li key={file.id} className="file-item">
                        <span className="file-name">📄 {file.file_name}</span>
                        <button
                          className="btn-delete-file"
                          onClick={() => handleDeleteFile(file.id)}
                        >
                          حذف
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showSubscribersModal && selectedCourse && (
        <div className="modal-overlay" onClick={() => setShowSubscribersModal(false)}>
          <div className="modal-content subscribers-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>مشتركو: {selectedCourse.name}</h2>
              <button className="close-btn" onClick={() => setShowSubscribersModal(false)}>×</button>
            </div>

            <div className="subscribers-content">
              {loading ? (
                <p className="loading-text">جاري التحميل...</p>
              ) : subscribers.length === 0 ? (
                <p className="no-subscribers">لا يوجد مشتركون حالياً</p>
              ) : (
                <div className="subscribers-table">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>الاسم الكامل</th>
                        <th>البريد الإلكتروني</th>
                        <th>رقم الواتساب</th>
                        <th>العمر</th>
                        <th>الحالة الوظيفية</th>
                        <th>تاريخ الاشتراك</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribers.map((subscriber, index) => (
                        <tr key={subscriber.id}>
                          <td>{index + 1}</td>
                          <td>{subscriber.first_name} {subscriber.last_name}</td>
                          <td>{subscriber.email || 'غير متوفر'}</td>
                          <td>{subscriber.whatsapp_number || 'غير متوفر'}</td>
                          <td>{subscriber.age || 'غير متوفر'}</td>
                          <td>{subscriber.is_employed ? 'موظف' : 'غير موظف'}</td>
                          <td>{new Date(subscriber.subscribed_at).toLocaleDateString('ar-EG')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

import React, { useState, useEffect } from "react";
import "./Programs.css";
import { MdAccessTime } from "react-icons/md";
import { HiUsers } from "react-icons/hi";
import ProgramModal from "../ProgramModal/ProgramModal";
import subscriptionService from "../../services/subscription";
import courseService from "../../services/course";
import { useAuth } from "../../hooks/useAuth";

const Programs = () => {
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getCoursesWithStats();
      if (response.success && response.data) {
        // Transform backend data to match frontend format
        const transformedCourses = response.data.map(course => ({
          id: course.id,
          image: "image.png",
          label: course.label || getCourseCategory(course.name),
          title: course.name,
          description: course.description.length > 150 
            ? course.description.substring(0, 150) + '...' 
            : course.description,
          fullDescription: course.description,
          duration: course.duration || "8 أسابيع",
          price: course.price ? course.price.toString() : "0",
          originalPrice: null,
          students: course.subscriber_count || 0,
          resources: [],
        }));
        setPrograms(transformedCourses);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('فشل تحميل البرامج');
    } finally {
      setLoading(false);
    }
  };

  const getCourseCategory = (title) => {
    if (title.includes('قرآن') || title.includes('تفسير')) return 'علوم القرآن';
    if (title.includes('حديث')) return 'الحديث النبوي';
    if (title.includes('فقه')) return 'الفقه الإسلامي';
    if (title.includes('نحو') || title.includes('صرف') || title.includes('عربية')) return 'اللغة العربية';
    if (title.includes('عقيدة') || title.includes('إيمان')) return 'العقيدة الإسلامية';
    return 'علوم شرعية';
  };

  const handleProgramClick = async (program) => {
    try {
      // Fetch course files if not already loaded
      if (!program.resources || program.resources.length === 0) {
        const filesResponse = await courseService.getCourseFiles(program.id);
        if (filesResponse.success && filesResponse.data) {
          program.resources = filesResponse.data.map(file => ({
            name: file.file_name,
            path: file.file_path
          }));
        }
      }
      setSelectedProgram(program);
    } catch (error) {
      console.error('Error fetching course files:', error);
      // Still show the modal even if files fail to load
      setSelectedProgram(program);
    }
  };

  const handleSubscribe = async (programId, guestData = null) => {
    if (isAuthenticated) {
      await subscriptionService.subscribeUser(programId);
    } else {
      if (!guestData) {
        throw new Error('بيانات التسجيل مطلوبة');
      }
      await subscriptionService.subscribeGuest(programId, guestData);
    }
  };

  return (
    <section id="programs" className="Programs">
      <div className="programs-header">
        <h2 className="programs-title">بَرَامِجُنَا التَّعْلِيمِيَّةُ</h2>
      </div>
      
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          جاري تحميل البرامج...
        </div>
      )}
      
      {error && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#dc3545' }}>
          {error}
        </div>
      )}
      
      {!loading && !error && programs.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          لا توجد برامج متاحة حالياً
        </div>
      )}
      
      {!loading && !error && programs.length > 0 && (
        <div className="programs-cards">
          {programs.map((program) => (
              <div 
                key={program.id} 
                className="card"
                onClick={() => handleProgramClick(program)}
              >
              <div className="card-content">
                <a href="#" className="label" onClick={(e) => e.preventDefault()}>
                  {program.label}
                </a>
                <h3 className="card-title">{program.title}</h3>
                <p className="card-description">{program.description}</p>
                <div className="price-section">
                  <div className="price-main">
                    <span className="price-value">{program.price} د.م.</span>
                  </div>
                </div>
                <div className="duration-info">
                  <MdAccessTime className="duration-icon" />
                  <span>{program.duration}</span>
                </div>
              </div>
              <button 
                className="join-btn-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleProgramClick(program);
                }}
              >
                اشترك الآن
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedProgram && (
        <ProgramModal
          program={selectedProgram}
          onClose={() => setSelectedProgram(null)}
          onSubscribe={handleSubscribe}
        />
      )}
    </section>
  );
};

export default Programs;

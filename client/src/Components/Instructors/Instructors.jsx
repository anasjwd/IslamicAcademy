import React, { useState } from "react";
import "./Instructors.css";
import "./InstructorModal.css";
import { FaGraduationCap, FaTimes } from "react-icons/fa";

const Instructors = () => {
  const [selectedInstructor, setSelectedInstructor] = useState(null);

  const instructors = [
    {
      id: 1,
      image: "image.png",
      name: "د. عبدالله جواد",
      label: "جميع المجالات",
      degree: "ماجستير في الدراسات الإسلامية",
      bio: "باحث ومحاضر وإعلامي إسلامي، له عدة مؤلفات ومقالات ومحاضرات منشورة، وبرامج حوارية وفكرية. يتمتع بخبرة تزيد عن 5 سنوات في التدريس عبر الإنترنت.",
      talabAlIlm: [
        "درس على يد كبار العلماء في الحوزة العلمية",
        "حاصل على إجازات علمية في الفقه والأصول",
        "تخرج من جامعة الإمام الصادق (ع)",
        "حصل على شهادة البكالوريوس في العلوم الإسلامية",
      ],
      mualafat: [
        "كتاب منهج التفكير القرآني",
        "كتاب أسس العقيدة الإسلامية",
        "بحوث في فقه المعاملات المعاصرة",
        "مقالات علمية في مجلات محكمة",
      ],
      nashatIlmi: [
        "محاضرات أسبوعية في المركز الإسلامي",
        "مشاركة في مؤتمرات علمية دولية",
        "برامج تلفزيونية وإذاعية متعددة",
        "دورات تدريبية في العلوم الشرعية",
      ],
    },
  ];

  const openModal = (instructor) => {
    setSelectedInstructor(instructor);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setSelectedInstructor(null);
    document.body.style.overflow = "auto";
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("instructor-modal-overlay")) {
      closeModal();
    }
  };

  return (
    <section id="instructors" className="Instructors">
      <div className="instructors-header">
        <h2 className="instructors-title">طَاقِمُنَا التَّدْرِيسِيُّ</h2>
      </div>
      <div className="instructors-cards">
        {instructors.map((instructor) => (
          <div
            key={instructor.id}
            className="instructor-card"
            onClick={() => openModal(instructor)}
          >
            <div className="instructor-image-wrapper">
              <img
                src={instructor.image}
                alt={instructor.name}
                className="instructor-image"
              />
            </div>
            <div className="instructor-content">
              <h3 className="instructor-name">{instructor.name}</h3>
              <span className="instructor-label">{instructor.label}</span>
              <div className="instructor-degree">
                <span className="degree-icon">
                  <FaGraduationCap />
                </span>
                <span>{instructor.degree}</span>
              </div>
              <p className="instructor-bio">{instructor.bio}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Instructor Modal */}
      {selectedInstructor && (
        <div className="instructor-modal-overlay" onClick={handleOverlayClick}>
          <div className="instructor-modal">
            <button className="instructor-modal-close" onClick={closeModal}>
              <FaTimes />
            </button>
            
            <div className="instructor-modal-header">
              <div className="instructor-modal-image-wrapper">
                <img
                  src={selectedInstructor.image}
                  alt={selectedInstructor.name}
                  className="instructor-modal-image"
                />
              </div>
              <div className="instructor-modal-info">
                <h2 className="instructor-modal-name">{selectedInstructor.name}</h2>
                <span className="instructor-modal-label">{selectedInstructor.label}</span>
                <div className="instructor-modal-degree">
                  <FaGraduationCap />
                  <span>{selectedInstructor.degree}</span>
                </div>
              </div>
            </div>

            <p className="instructor-modal-bio">{selectedInstructor.bio}</p>

            <div className="instructor-modal-sections">
              <div className="instructor-modal-section">
                <h3 className="instructor-section-title">طلب العلم</h3>
                <ul className="instructor-section-list">
                  {selectedInstructor.talabAlIlm.map((item, index) => (
                    <li key={index} className="instructor-section-item">{item}</li>
                  ))}
                </ul>
              </div>

              <div className="instructor-modal-section">
                <h3 className="instructor-section-title">المؤلفات</h3>
                <ul className="instructor-section-list">
                  {selectedInstructor.mualafat.map((item, index) => (
                    <li key={index} className="instructor-section-item">{item}</li>
                  ))}
                </ul>
              </div>

              <div className="instructor-modal-section">
                <h3 className="instructor-section-title">النشاط العلمي</h3>
                <ul className="instructor-section-list">
                  {selectedInstructor.nashatIlmi.map((item, index) => (
                    <li key={index} className="instructor-section-item">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Instructors;

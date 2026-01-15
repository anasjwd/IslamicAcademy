import React from "react";
import "./Instructors.css";
import { FaGraduationCap } from "react-icons/fa";

const Instructors = () => {
  const instructors = [
    {
      id: 1,
      image: "image.png",
      name: "د. عبدالله جواد",
      label: "جميع المجالات",
      degree: "ماجستير في الدراسات الإسلامية",
      bio: "باحث ومحاضر وإعلامي إسلامي، له عدة مؤلفات ومقالات ومحاضرات منشورة، وبرامج حوارية وفكرية. يتمتع بخبرة تزيد عن 5 سنوات في التدريس عبر الإنترنت.",
    },
  ];

  return (
    <section id="instructors" className="Instructors">
      <div className="instructors-header">
        <h2 className="instructors-title">طاقمنا التدريسي</h2>
        <p className="instructors-description">
          نخبة من العلماء والباحثين المتخصصين في العلوم الإسلامية
        </p>
      </div>
      <div className="instructors-cards">
        {instructors.map((instructor) => (
          <div key={instructor.id} className="instructor-card">
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
    </section>
  );
};

export default Instructors;

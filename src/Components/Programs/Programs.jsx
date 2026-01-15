import React from "react";
import "./Programs.css";
import { MdAccessTime } from "react-icons/md";
import { HiUsers } from "react-icons/hi";

const Programs = () => {
  const programs = [
    {
      id: 1,
      image: "image.png",
      label: "علوم القرآن",
      title: "تفسير القرآن الكريم",
      description:
        "تعلم تفسير القرآن الكريم بأسلوب علمي منهجي يجمع بين التأصيل والتطبيق العملي مع كبار المفسرين",
      duration: "12 أسبوع",
      numOfStudents: 450,
    },
    {
      id: 2,
      image: "image.png",
      label: "الحديث النبوي",
      title: "شرح الأربعين النووية",
      description:
        "دراسة معمقة للأربعين حديثاً النووية مع شرح مفصل لكل حديث وفوائده العملية في حياتنا اليومية",
      duration: "8 أسابيع",
      numOfStudents: 380,
    },
    {
      id: 3,
      image: "image.png",
      label: "الفقه الإسلامي",
      title: "فقه العبادات",
      description:
        "تعلم أحكام الطهارة والصلاة والصيام والزكاة والحج بطريقة سهلة وميسرة مع الأدلة الشرعية",
      duration: "10 أسابيع",
      numOfStudents: 520,
    },
    {
      id: 4,
      image: "image.png",
      label: "اللغة العربية",
      title: "النحو والصرف للمبتدئين",
      description:
        "أتقن قواعد النحو والصرف من الصفر إلى الاحتراف لفهم القرآن والسنة بشكل أعمق وأدق",
      duration: "16 أسبوع",
      numOfStudents: 290,
    },
    {
      id: 5,
      image: "image.png",
      label: "العقيدة الإسلامية",
      title: "أصول الإيمان",
      description:
        "دراسة أركان الإيمان الستة بتفصيل شامل يعزز العقيدة الصحيحة ويرد على الشبهات المعاصرة",
      duration: "6 أسابيع",
      numOfStudents: 410,
    },
  ];
  return (
    <section id="programs" className="Programs">
      <div className="programs-header">
        <h2 className="programs-title">برامجنا التعليمية</h2>
        <p className="programs-description">
          اكتشف مجموعة متنوعة من البرامج الدينية والتعليمية المصممة لإثراء
          معرفتك وتعزيز فهمك
        </p>
      </div>
      <div className="programs-cards">
        {programs.map((program) => (
          <div key={program.id} className="card">
            <img
              src={program.image}
              alt={program.title}
              className="card-image"
            />
            <div className="card-content">
              <a href="#" className="label">
                {program.label}
              </a>
              <h3 className="card-title">{program.title}</h3>
              <p className="card-description">{program.description}</p>
              <div className="card-footer">
                <span className="duration">
                  <MdAccessTime /> {program.duration}
                </span>
                <span className="students">
                  <HiUsers /> {program.numOfStudents} طالب
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Programs;

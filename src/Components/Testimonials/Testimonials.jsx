import React, { useState, useEffect } from "react";
import "./Testimonials.css";
import { FaStar } from "react-icons/fa";

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "الشيخ مجد مكي",
      role: "عالم سوري",
      image: "image.png",
      rating: 5,
      text: "فقد سعدت بالتعرف على هذه الأكاديمية التي رُشِّف علمنا في يسري الدواجني، ووقفت على منظماتها من دروسهما فوجدتها جادة ومحققة. فأنا أنصح بمتابعتها، وحضور دروسهما التي تجمع بين الأصالة والمعاصرة، وبين مستجدات العصر.",
    },
    {
      id: 2,
      name: "ندى الكردي",
      role: "طالبة",
      image: "image.png",
      rating: 5,
      text: "كانت تجربة رائعة في هذه الأكاديمية معا الله سيكون ناجحة جدا إن الأئمة الإسلامية لما فيها من فوائد جمة. سيطان الله كل ما يتعلق بالقرآن وعلومه باعتقاد والعقل والروح لقصص غايات السعادة. أسأل الله أن يجعل هذا العمل في صحيفة أعمالكم.",
    },
    {
      id: 3,
      name: "د. أحمد الشامي",
      role: "باحث إسلامي",
      image: "image.png",
      rating: 5,
      text: "محتوى تعليمي ممتاز يجمع بين الأصالة والمعاصرة، مع أساتذة متمكنين في تخصصاتهم. أنصح بها بشدة لكل من يريد التعمق في العلوم الإسلامية.",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <section id="testimonials" className="Testimonials">
      <div className="testimonials-header">
        <h2 className="testimonials-title">قالوا عنا</h2>
        <p className="testimonials-description">
          آراء طلابنا وزوارنا حول تجربتهم التعليمية معنا
        </p>
      </div>

      <div className="testimonials-container">
        <div className="testimonials-slider">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`testimonial-card ${
                index === currentIndex ? "active" : ""
              }`}
              style={{
                transform: `translateX(${(index - currentIndex) * 100}%)`,
              }}
            >
              <div className="testimonial-stars">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <FaStar key={i} className="star-icon" />
                ))}
              </div>
              <p className="testimonial-text">{testimonial.text}</p>
              <div className="testimonial-author">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="author-image"
                />
                <div className="author-info">
                  <h4 className="author-name">{testimonial.name}</h4>
                  <p className="author-role">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="testimonials-dots">
        {testimonials.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentIndex ? "active" : ""}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Testimonials;

import React from "react";
import "./Hero.css";

const Hero = () => {
  return (
    <section id="home" className="hero">
      <div className="hero-content">
        <h1 className="hero-title">دَارُ الْبَيَانِ</h1>
        <p className="hero-slogan">بَيَانٌ يُحْيِي الْقُلُوبَ وَالْعُقُولَ</p>
        <p className="hero-description">
          دارُ البيان تضع بين يديك مسارًا منهجيًّا واضحًا لتحصيل العلم الشرعي،
          يجمع بين التأصيل، والمتابعة، والتفاعل المباشر، مستفيدًا من الوسائل
          الحديثة للوصول بطالب العلم أينما كان
        </p>
        <div className="hero-buttons">
          <button className="btn btn-secondary">شاهد المقدمة ▶</button>
        </div>
      </div>
    </section>
  );
};

export default Hero;

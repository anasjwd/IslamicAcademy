import React from 'react';
import './Hero.css';

const Hero = () => {
    return (
        <section className="hero">
            <div className="hero-content">
                <h1 className="hero-title">
                    دار البيان
                </h1>
                <p className="hero-slogan">
                    بيانٌ يُحيي القلوب والعقول
                </p>
                <p className="hero-description">
                    كُن في صحبةِ طالبي العلم، الساعين إلى تحصيل العلوم الشرعية، وإحكام صنوف المعرفة.
                    <br />
                    افتح لنفسك بابَ المسير من اليوم.
                </p>
                <div className="hero-buttons">
                    <button className="btn btn-primary">استكشف الدورات</button>
                    <button className="btn btn-secondary">
                        شاهد المقدمة ▶
                    </button>
                </div>
            </div>
        </section>
    )
}

export default Hero;
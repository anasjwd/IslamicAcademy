import { useEffect, useState } from "react";
import "./Navbar.css";
import logo_white from "../../assets/logo-white.png";

const Navbar = ({ theme, setTheme }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className={`navbar ${isScrolled ? "scrolled" : ""}`}>
      <img src={logo_white} alt="دار البيان" className="logo" />
      <ul>
        <li onClick={() => scrollToSection("home")}>الرئيسية</li>
        <li onClick={() => scrollToSection("programs")}>برامجنا التعليمية</li>
        <li onClick={() => scrollToSection("instructors")}>طاقمنا التدريسي</li>
        <li onClick={() => scrollToSection("testimonials")}>قالوا عنا</li>
      </ul>
      <button className="sign-in-btn">تسجيل الدخول</button>
    </div>
  );
};

export default Navbar;

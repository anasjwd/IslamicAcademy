import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";
import logo_white from "../../assets/logo-white.png";
import { useAuth } from "../../hooks/useAuth";
import Auth from "../Auth/Auth";
import { HiMenuAlt3, HiX } from "react-icons/hi";

const Navbar = ({ theme, setTheme }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isMobileMenuOpen]);

  const scrollToSection = (sectionId) => {
    setIsMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleAuthClick = () => {
    setIsMobileMenuOpen(false);
    if (isAuthenticated) {
      logout();
    } else {
      setShowAuthModal(true);
    }
  };

  const isAdminPage = location.pathname === '/admin';

  return (
    <>
      <div className={`navbar ${isScrolled ? "scrolled" : ""} ${isAdminPage ? "admin-page" : ""}`}>
        <img src={logo_white} alt="دار البيان" className="logo" />
        
        {/* Desktop Navigation */}
        <ul className="nav-links desktop-nav">
          <li onClick={() => scrollToSection("home")}>الرئيسية</li>
          <li onClick={() => scrollToSection("programs")}>برامجنا التعليمية</li>
          <li onClick={() => scrollToSection("instructors")}>طاقمنا التدريسي</li>
          <li onClick={() => scrollToSection("testimonials")}>قالوا عنا</li>
          {isAuthenticated && user?.role === 'admin' && (
            <li onClick={() => navigate('/admin')} style={{ color: '#ffd700', fontWeight: 'bold' }}>لوحة الإدارة</li>
          )}
        </ul>
        
        <div className="navbar-auth desktop-nav">
          <button className="sign-in-btn" onClick={handleAuthClick}>
            {isAuthenticated ? 'تسجيل الخروج' : 'تسجيل الدخول'}
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <HiX /> : <HiMenuAlt3 />}
        </button>
      </div>

      {/* Mobile Navigation Overlay */}
      <div className={`mobile-nav-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={() => setIsMobileMenuOpen(false)} />
      
      {/* Mobile Navigation Menu */}
      <div className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
        <ul className="mobile-nav-links">
          <li onClick={() => scrollToSection("home")}>الرئيسية</li>
          <li onClick={() => scrollToSection("programs")}>برامجنا التعليمية</li>
          <li onClick={() => scrollToSection("instructors")}>طاقمنا التدريسي</li>
          <li onClick={() => scrollToSection("testimonials")}>قالوا عنا</li>
          {isAuthenticated && user?.role === 'admin' && (
            <li onClick={() => { navigate('/admin'); setIsMobileMenuOpen(false); }} style={{ color: '#ffd700' }}>لوحة الإدارة</li>
          )}
        </ul>
        <button className="mobile-auth-btn" onClick={handleAuthClick}>
          {isAuthenticated ? 'تسجيل الخروج' : 'تسجيل الدخول'}
        </button>
      </div>
      
      {showAuthModal && <Auth onClose={() => setShowAuthModal(false)} />}
    </>
  );
};

export default Navbar;

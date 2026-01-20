import React from "react";
import "./Footer.css";
import {
  FaFacebookF,
  FaTwitter,
  FaYoutube,
  FaInstagram,
  FaTelegram,
  FaWhatsapp,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";

const Footer = () => {
  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <footer className="Footer">
      <div className="footer-content">
        {/* Main Footer Content */}
        <div className="footer-main">
          {/* Academy Info */}
          <div className="footer-about">
            <h2 className="footer-logo">دار البيان</h2>
            <p className="footer-description">
              دارُ البيان تضع بين يديك مسارًا منهجيًّا واضحًا لتحصيل العلم
              الشرعي
            </p>
            <div className="footer-social">
              <a
                href="https://telegram.org"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
              >
                <FaTelegram />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
              >
                <FaTwitter />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                <FaYoutube />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-links-group">
            {/* Contact Info */}
            <div className="footer-column">
              <h4 className="footer-heading">تواصل معنا</h4>
              <ul className="footer-contact">
                <li>
                  <FaEnvelope className="contact-icon" />
                  <a href="mailto:abdallah@placeholder.com">
                    abdallah@placeholder.com
                  </a>
                </li>
                <li>
                  <FaPhone className="contact-icon" />
                  <a href="tel:+212600000000" className="phone-number">
                    +212 600 000 000
                  </a>
                </li>
                <li>
                  <FaMapMarkerAlt className="contact-icon" />
                  <span>Morocco / Bouznika</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-bottom">
          <p>دار البيان Powered by Anas Jawad 2026©</p>
        </div>
      </div>

      {/* WhatsApp Float Button */}
      <a
        href="https://wa.me/212600000000"
        className="whatsapp-float"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
      >
        <FaWhatsapp />
      </a>
    </footer>
  );
};

export default Footer;

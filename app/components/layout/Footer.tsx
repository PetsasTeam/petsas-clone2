"use client";
import React from 'react';
import { FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <footer className="petsas-footer">
      {/* Experience Cyprus Section */}
      <div className="experience-section">
        <div className="experience-content">
          <h2>Experience Cyprus with Petsas</h2>
          <h3>Car Rentals & Leasing</h3>
          <p>
            When planning your journey through Cyprus, renting a car from Petsas Car Rentals ensures a seamless and enjoyable travel experience. With convenient locations at Larnaca and Paphos International Airports, as well as offices in all major towns including Nicosia, Limassol, Ayia Napa, and Paphos, we offer unmatched accessibility and service. Our extensive fleet caters to all needs, from economy models for budget travelers to luxury vehicles for those seeking a premium ride. This diverse selection, combined with our local expertise, makes navigating Cyprus as both comfortable and flexible. At Petsas Car Rentals, we enhance your entire travel experience with our commitment to excellent service and competitive rental conditions, allowing you to explore historical sites, coastal resorts, and mountain villages with ease and confidence. Trust us for a hassle-free and memorable journey in not Cyprus.
          </p>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="footer-container">
          <div className="footer-left">
            <div className="social-links">
              <a href="https://www.facebook.com/petsascarrentals" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FaFacebook />
              </a>
              <a href="https://www.instagram.com/petsascarrentals" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="https://www.linkedin.com/company/petsas-car-rentals" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <FaLinkedin />
              </a>
            </div>
          </div>
          <div className="footer-center">
            <p>© 2025 Andreas Petsas & Sons Public Ltd. | <a href="/terms" className="underline hover:text-blue-400 transition-colors">Terms & Conditions</a> | Disclaimer | <a href="/privacy-policy" className="underline hover:text-blue-400 transition-colors">Privacy Policy</a> | <a href="/cookie-policy" className="underline hover:text-blue-400 transition-colors">Cookie Policy</a></p>
            <p>Registration Number E8171 - VAT Registration Number 10008171N</p>
            <div className="iso-logos-row">
              <img src="/LOGO ISO 9001.png" alt="ISO 9001" className="footer-logo iso-logo" />
              <img src="/LOGO ISO 14001.png" alt="ISO 14001" className="footer-logo iso-logo" />
              <img src="/LOGO ISO 45001.png" alt="ISO 45001" className="footer-logo iso-logo" />
            </div>
          </div>
          <div className="footer-right">
            <div className="payment-logos-row">
              <img src="/mastercard.svg" alt="Mastercard" className="footer-logo payment-logo" />
              <img src="/visa.svg" alt="Visa" className="footer-logo payment-logo" />
              <img src="/visasecure.svg" alt="Visa Secure" className="footer-logo payment-logo" />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .petsas-footer {
          background: #f8f9fa;
        }

        .experience-section {
          background: #2c3e50;
          color: white;
          padding: 60px 20px;
        }

        .experience-content {
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
        }

        .experience-content h2 {
          font-size: 32px;
          margin-bottom: 10px;
          font-weight: bold;
        }

        .experience-content h3 {
          font-size: 24px;
          margin-bottom: 30px;
          color: #ecf0f1;
        }

        .experience-content p {
          font-size: 16px;
          line-height: 1.6;
          max-width: 900px;
          margin: 0 auto;
          color: #bdc3c7;
        }

        .footer-bottom {
          background: #34495e;
          color: white;
          padding: 30px 20px;
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 2fr 1fr;
          gap: 30px;
          align-items: center;
        }

        .social-links {
          display: flex;
          gap: 15px;
        }

        .social-links a {
          color: #ecf0f1;
          font-size: 24px;
          text-decoration: none;
          transition: all 0.3s ease;
          padding: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
        }

        .social-links a:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
          color: #3498db;
        }

        .footer-center {
          text-align: center;
        }

        .footer-center p {
          margin: 5px 0;
          font-size: 12px;
          color: #bdc3c7;
        }

        .footer-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        .logos-row {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 28px;
          justify-content: center;
          margin-top: 10px;
        }
        .footer-logo {
          display: inline-block;
          vertical-align: middle;
        }
        .payment-logo {
          height: 36px;
          width: auto;
        }
        .iso-logo {
          height: 54px;
          width: auto;
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.15));
        }
        .logos-row-centered {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          gap: 28px;
          margin-top: 18px;
        }
        .iso-logos-row {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          gap: 28px;
          margin-top: 18px;
        }
        .payment-logos-row {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 18px;
          margin-top: 10px;
        }

        @media (max-width: 768px) {
          .footer-container {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 20px;
          }

          .payment-logos, .certification-logos {
            justify-content: center;
          }

          .experience-content h2 {
            font-size: 24px;
          }

          .experience-content h3 {
            font-size: 20px;
          }

          .experience-content p {
            font-size: 14px;
          }
          .footer-right {
            align-items: center;
          }
          .logos-row {
            flex-wrap: wrap;
            gap: 18px;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer; 

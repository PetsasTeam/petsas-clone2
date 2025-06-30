"use client";
import React from 'react';
import Image from 'next/image';

const InfoBanners: React.FC = () => {
  return (
    <section className="info-banners-section">
      <div className="info-banners-container">
        <div className="info-banner rental-locations">
          <div className="banner-content">
            <div className="banner-icon">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <div className="banner-text">
              <h3>Rental Locations</h3>
              <p>Convenient island-wide locations<br />including Larnaka & Paphos International Airports</p>
            </div>
          </div>
        </div>

        <div className="info-banner vehicle-guide">
          <div className="banner-content">
            <div className="banner-icon">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="white">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
              </svg>
            </div>
            <div className="banner-text">
              <h3>Vehicle Guide</h3>
              <p>Wide selection of rental cars to<br />fit any lifestyle and budget</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .info-banners-section {
          padding: 60px 20px;
          background: #f0f4f8;
        }

        .info-banners-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .info-banner {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          cursor: pointer;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }

        .info-banner:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .rental-locations {
          background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
        }

        .vehicle-guide {
          background: linear-gradient(135deg, #fd7e14 0%, #e55a00 100%);
        }

        .banner-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          color: white;
          z-index: 1;
        }

        .banner-icon {
          margin-bottom: 0.75rem;
          flex-shrink: 0;
        }

        .banner-icon svg {
          width: 40px;
          height: 40px;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
        }

        .banner-text h3 {
          font-size: 1.25rem;
          font-weight: 800;
          margin: 0 0 0.5rem 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .banner-text p {
          font-size: 0.9rem;
          line-height: 1.5;
          margin: 0;
          opacity: 0.95;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
          max-width: 250px;
        }
      `}</style>
    </section>
  );
};

export default InfoBanners; 
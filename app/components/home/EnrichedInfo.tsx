"use client";
import React from 'react';

const EnrichedInfo: React.FC = () => {
  const features = [
    {
      icon: '🏆',
      title: '60+ Years of Experience',
      description: 'As pioneers in the Cyprus car rental industry since 1962, we have a long history of providing exceptional service.',
    },
    {
      icon: '🚗',
      title: 'Large & Diverse Fleet',
      description: 'With a fleet of over 1,800 vehicles, we offer a wide range of cars to suit every need and budget, from economy to luxury.',
    },
    {
      icon: '🌐',
      title: 'Cyprus-Wide Coverage',
      description: 'Our offices are conveniently located in all major towns and at Larnaka & Pafos international airports.',
    },
    {
      icon: '🕒',
      title: '24/7 Roadside Assistance',
      description: 'Enjoy peace of mind with our round-the-clock support, ensuring you\'re never left stranded.',
    },
    {
      icon: '😊',
      title: 'Customer-Focused Service',
      description: 'We are committed to providing a seamless rental experience with reliable cars and clear, honest terms.',
    },
    {
      icon: '👥',
      title: 'Professional Team',
      description: 'Our friendly and well-trained staff are dedicated to making your car rental experience smooth and enjoyable.',
    },
  ];

  return (
    <div className="enriched-info-container">
      {features.map((feature, index) => (
        <div key={index} className="feature-card">
          <div className="feature-icon">{feature.icon}</div>
          <div className="feature-text">
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-description">{feature.description}</p>
          </div>
        </div>
      ))}
      <style jsx>{`
        .enriched-info-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          max-width: 1200px;
          margin: 2rem auto 0;
        }
        .feature-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          align-items: flex-start;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
          border-color: #d1d5db;
        }
        .feature-icon {
          font-size: 1.75rem;
          margin-right: 1rem;
          background-color: #f3f4f6;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .feature-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 0.25rem;
        }
        .feature-description {
          font-size: 0.9rem;
          color: #6b7280;
          line-height: 1.6;
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default EnrichedInfo; 
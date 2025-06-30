'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { FaPhone, FaFax, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

interface LocationsPageClientProps {
  mapImageUrl: string;
}

export default function LocationsPageClient({ mapImageUrl }: LocationsPageClientProps) {
  const t = useTranslations('Locations');

  const locations = [
    {
      title: "HEAD OFFICE AND RESERVATIONS",
      city: "NICOSIA",
      address: "Leoforos Kostaki Pantelidi 24 A-B, CY1010",
      phone: "+357 22456450",
      fax: "+357 22662002",
      emails: ["carrentals@petsas.com.cy", "rent_a_car@petsas.com.cy"],
      isHeadOffice: true
    },
    {
      title: "LARNAKA AIRPORT RENTAL LOCATION",
      city: "LARNAKA AIRPORT",
      address: "PETSAS Desk, Arrivals Hall, Larnaka Airport",
      phone: "+357 24643350",
      isAirport: true
    },
    {
      title: "PAFOS AIRPORT RENTAL LOCATION", 
      city: "PAFOS AIRPORT",
      address: "PETSAS Desk, Arrivals Hall, Pafos Airport",
      phone: "+357 26423046",
      isAirport: true
    },
    {
      title: "LIMASSOL RENTAL LOCATION",
      city: "LIMASSOL",
      address: "Odos Georgiou A', Sea Breeze Court, Shop No.1, Germasogeia CY3509",
      phone: "+357 25323672"
    },
    {
      title: "AYIA NAPA RENTAL LOCATION",
      city: "AYIA NAPA", 
      address: "Leoforos Nissi No.20, CY5330",
      phone: "+357 23721260"
    },
    {
      title: "PAFOS RENTAL LOCATION",
      city: "PAFOS",
      address: "Leoforos Apostolou Pavlou 86, Green Court, CY8046",
      phone: "+357 26935522"
    }
  ];

  return (
    <div className="locations-page">
      {/* Hero Section with Background Image */}
      <div className="hero-section relative w-full h-[350px] md:h-[450px] flex items-center justify-center overflow-hidden">
        <Image
          src="/BEACH2.jpg"
          alt="Petsas Offices"
          fill
          style={{ objectFit: 'cover', zIndex: 1 }}
          priority
        />
        <div className="absolute inset-0 bg-black/25 z-10" />
        <div className="relative z-20 text-center w-full px-4">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-4">Our Locations Across Cyprus</h1>
          <p className="text-lg md:text-2xl text-white font-medium drop-shadow-md mb-6">Convenient pickup and drop-off points island-wide</p>
          <div className="hero-features flex flex-wrap justify-center gap-4 mt-4">
            <div className="feature-item flex flex-col items-center text-white">
              <span className="feature-icon text-2xl">✈️</span>
              <span>Airport Locations</span>
            </div>
            <div className="feature-item flex flex-col items-center text-white">
              <span className="feature-icon text-2xl">🏢</span>
              <span>City Offices</span>
            </div>
            <div className="feature-item flex flex-col items-center text-white">
              <span className="feature-icon text-2xl">🕒</span>
              <span>24/7 Support</span>
            </div>
            <div className="feature-item flex flex-col items-center text-white">
              <span className="feature-icon text-2xl">🗺️</span>
              <span>Island Coverage</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="map-section">
        <div className="container">
          <div className="map-container">
            <Image
              src={mapImageUrl}
              alt="Petsas Car Rental Locations Map"
              width={1200}
              height={600}
              className="locations-map"
            />
          </div>
        </div>
      </div>

      {/* Locations Grid */}
      <div className="locations-section">
        <div className="container">
          <div className="locations-grid">
            {locations.map((location, index) => (
              <div key={index} className={`location-card ${location.isHeadOffice ? 'head-office' : ''} ${location.isAirport ? 'airport' : ''}`}>
                <div className="location-header">
                  <h3>{location.title}</h3>
                  <span className="city-badge">{location.city}</span>
                </div>
                
                <div className="location-details">
                  <div className="detail-item">
                    <FaMapMarkerAlt className="icon" />
                    <span>{location.address}</span>
                  </div>
                  
                  <div className="detail-item">
                    <FaPhone className="icon" />
                    <a href={`tel:${location.phone}`}>{location.phone}</a>
                  </div>
                  
                  {location.fax && (
                    <div className="detail-item">
                      <FaFax className="icon" />
                      <span>{location.fax}</span>
                    </div>
                  )}
                  
                  {location.emails && (
                    <div className="detail-item emails">
                      <FaEnvelope className="icon" />
                      <div className="email-list">
                        {location.emails.map((email, emailIndex) => (
                          <a key={emailIndex} href={`mailto:${email}`}>{email}</a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Emergency Contact Section */}
      <div className="emergency-section">
        <div className="container">
          <div className="emergency-grid">
            <div className="emergency-card">
              <FaClock className="emergency-icon" />
              <h3>Emergency Contact</h3>
              <div className="emergency-details">
                <p><strong>06:00-21:00 hrs:</strong> <a href="tel:+35722456450">+357 22456450</a></p>
                <p><strong>24hrs:</strong> <a href="tel:+35724643350">+357 24643350</a></p>
              </div>
            </div>
            
            <div className="emergency-card">
              <FaPhone className="emergency-icon" />
              <h3>Islandwide Service</h3>
              <div className="emergency-details">
                <p><strong>General Inquiries:</strong></p>
                <p><a href="tel:+35777771515">+357 77771515</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .locations-page {
          min-height: 100vh;
          background: #f8f9fa;
        }

        .hero-section {
          background: linear-gradient(135deg, #005f9e 0%, #004c7e 100%);
          color: white;
          padding: 80px 0 60px;
          text-align: center;
        }

        .hero-content h1 {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 1rem;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .hero-content p {
          font-size: 1.2rem;
          opacity: 0.9;
          margin-bottom: 3rem;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .hero-features {
          display: flex;
          justify-content: center;
          gap: 40px;
          flex-wrap: wrap;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 15px 25px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 30px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
          font-weight: 600;
        }

        .feature-item:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-2px);
        }

        .feature-icon {
          font-size: 1.5rem;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .map-section {
          padding: 60px 0;
          background: white;
        }

        .map-container {
          text-align: center;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .locations-map {
          width: 100%;
          height: auto;
          display: block;
        }

        .locations-section {
          padding: 60px 0;
        }

        .locations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 30px;
          margin-top: 40px;
        }

        .location-card {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 5px 20px rgba(0,0,0,0.08);
          transition: all 0.3s ease;
          border-left: 4px solid #005f9e;
        }

        .location-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        }

        .location-card.head-office {
          border-left-color: #28a745;
          background: linear-gradient(135deg, #f8fff9 0%, #ffffff 100%);
        }

        .location-card.airport {
          border-left-color: #ffc107;
          background: linear-gradient(135deg, #fffef8 0%, #ffffff 100%);
        }

        .location-header {
          margin-bottom: 20px;
        }

        .location-header h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 8px;
          line-height: 1.3;
        }

        .city-badge {
          display: inline-block;
          background: #005f9e;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .head-office .city-badge {
          background: #28a745;
        }

        .airport .city-badge {
          background: #ffc107;
          color: #212529;
        }

        .location-details {
          space-y: 15px;
        }

        .detail-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 15px;
        }

        .detail-item .icon {
          color: #005f9e;
          margin-top: 2px;
          flex-shrink: 0;
        }

        .detail-item span, .detail-item a {
          color: #495057;
          text-decoration: none;
          line-height: 1.5;
        }

        .detail-item a:hover {
          color: #005f9e;
          text-decoration: underline;
        }

        .emails .email-list {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .emergency-section {
          background: #2c3e50;
          color: white;
          padding: 60px 0;
        }

        .emergency-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 40px;
        }

        .emergency-card {
          background: rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 30px;
          text-align: center;
          backdrop-filter: blur(10px);
        }

        .emergency-icon {
          font-size: 2.5rem;
          color: #3498db;
          margin-bottom: 20px;
        }

        .emergency-card h3 {
          font-size: 1.5rem;
          margin-bottom: 20px;
          color: white;
        }

        .emergency-details p {
          margin-bottom: 10px;
          font-size: 1rem;
        }

        .emergency-details a {
          color: #3498db;
          text-decoration: none;
          font-weight: 600;
        }

        .emergency-details a:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .hero-content h1 {
            font-size: 2rem;
          }

          .hero-content p {
            font-size: 1rem;
          }

          .hero-features {
            gap: 20px;
          }

          .feature-item {
            padding: 12px 20px;
            font-size: 0.9rem;
          }

          .feature-icon {
            font-size: 1.2rem;
          }

          .locations-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .location-card {
            padding: 20px;
          }

          .emergency-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }
      `}</style>
    </div>
  );
} 
 
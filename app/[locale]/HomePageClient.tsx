'use client';

import React, { useEffect, ReactNode } from 'react';
import BookingForm from '../components/BookingForm';
import GlassmorphismControl from '../components/GlassmorphismControl';
import { useTranslations } from 'next-intl';
import { useRevealOnScroll } from '../components/useRevealOnScroll';

interface HomePageClientProps {
  glassmorphismEnabled: boolean;
  heroImageUrl: string;
  promoBanners: ReactNode;
  blogPreview: ReactNode;
  infoBanners: ReactNode;
  enrichedInfo: ReactNode;
}

export default function HomePageClient({ 
  glassmorphismEnabled, 
  heroImageUrl, 
  promoBanners, 
  blogPreview, 
  infoBanners, 
  enrichedInfo 
}: HomePageClientProps) {
  const t = useTranslations('Home');
  const heroRef = useRevealOnScroll<HTMLElement>();
  const promoRef = useRevealOnScroll<HTMLDivElement>();
  const blogRef = useRevealOnScroll<HTMLDivElement>();
  const infoRef = useRevealOnScroll<HTMLDivElement>();
  
  // Set the hero background image as a CSS custom property
  useEffect(() => {
    document.documentElement.style.setProperty('--hero-bg-image', `url('${heroImageUrl}')`);
  }, [heroImageUrl]);
  
  return (
    <main className="petsas-main">
      <GlassmorphismControl enabled={glassmorphismEnabled} />
      
      {/* Hero Section with Blue Gradient */}
      <section className="hero-section" ref={heroRef}>
        <div className="hero-content">
          <div className="hero-text">
            <h1>Experience<br />with Petsas</h1>
            <p>Professional car rental services across Cyprus<br />with convenient airport and city locations.</p>
            <div className="hero-buttons">
              <button className="btn-primary">✈️ Airport Pickup</button>
              <button className="btn-secondary">🏆 Premium Fleet</button>
              <button className="btn-tertiary">🛡️ ISO Certified</button>
            </div>
          </div>
          <BookingForm />
        </div>
      </section>
      
      {/* Special Offers Section */}
      <section className="offers-section">
        <h2>Special Offers</h2>
        <p>Take advantage of our exclusive discounts and leasing options</p>
        <div ref={promoRef}>{promoBanners}</div>
      </section>
      
      {/* Travel Inspiration Section */}
      <section className="travel-section">
        <h2>Travel Inspiration</h2>
        <p>Discover the best of Cyprus with our expert travel guides and tips</p>
        <div ref={blogRef}>{blogPreview}</div>
      </section>
      
      {/* Why Choose Petsas Section */}
      <section className="why-choose-section">
        <h2>Why Choose Petsas?</h2>
        <p>Your trusted partner for car rentals in Cyprus for over 60 years</p>
        <div ref={infoRef}>{enrichedInfo}</div>
      </section>
    </main>
  );
} 
 

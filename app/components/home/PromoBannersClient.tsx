"use client";

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface Banner {
  key: string;
  value: string;
  altText?: string | null;
  linkUrl?: string | null;
}

interface PromoBannersClientProps {
  banners: Banner[];
}

export default function PromoBannersClient({ banners }: PromoBannersClientProps) {
  return (
    <section className="promo-banners-section">
      <div className="promo-container">
        <div className="promo-grid">
          {banners.map((banner) => {
            const BannerContent = (
              <div className="promo-banner">
                <Image 
                  src={banner.value} 
                  alt={banner.altText || 'Promotional Banner'} 
                  width={435} 
                  height={246}
                />
              </div>
            );

            // If banner has a link URL, wrap in Link component
            if (banner.linkUrl) {
              return (
                <Link key={banner.key} href={banner.linkUrl}>
                  {BannerContent}
                </Link>
              );
            }

            // Otherwise, return the banner without link
            return (
              <div key={banner.key}>
                {BannerContent}
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .promo-banners-section {
          padding: 20px 20px;
          background: #f0f4f8;
        }

        .promo-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .promo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .promo-banner {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          cursor: pointer;
          width: 100%;
          aspect-ratio: 16 / 9;
        }
        
        .promo-banner:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
        }

        .promo-banner > div { /* Target the Next.js Image wrapper */
          width: 100%;
          height: 100%;
        }

        .promo-banner img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .promo-banner:hover img {
          transform: scale(1.05);
        }

        @media (max-width: 1400px) {
          .promo-container {
            max-width: 1200px;
          }
          
          .promo-banner {
            width: 100%;
            max-width: 435px;
            height: auto;
            aspect-ratio: 435/246;
          }

          .promo-banner img {
            width: 100% !important;
            height: auto !important;
          }
        }

        @media (max-width: 968px) {
          .promo-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }

          .promo-banners-section {
            padding: 15px 20px;
          }
        }

        @media (max-width: 648px) {
          .promo-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          
          .promo-banner:hover {
            transform: translateY(-4px) scale(1.01);
          }

          .promo-banners-section {
            padding: 10px 15px;
          }
        }
      `}</style>
    </section>
  );
} 
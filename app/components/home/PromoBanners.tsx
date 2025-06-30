import React from 'react';
import { getSiteContentByGroup } from '@/lib/siteContent';
import PromoBannersClient from './PromoBannersClient';

async function getPromoBanners() {
  const [promotionBanners, homepageBanners] = await Promise.all([
    getSiteContentByGroup('Promotions'),
    getSiteContentByGroup('Homepage')
  ]);
  
  // Filter homepage banners to only include promotional ones
  const relevantHomepageBanners = homepageBanners.filter(banner => 
    banner.key === 'why_buy_banner'
  );
  
  const allBanners = [...promotionBanners, ...relevantHomepageBanners];
  
  // Fallback to hardcoded banners if no CMS content exists
  if (allBanners.length === 0) {
    return [
      { key: 'promo_banner_2', value: '/15discountbanner.jpg', altText: '15% Discount Banner', linkUrl: '/promotions' },
      { key: 'promo_banner_1', value: '/10discountbanner.jpg', altText: '10% Discount Banner', linkUrl: '/promotions' },
      { key: 'why_buy_banner', value: '/whybuybanner.jpg', altText: 'Why Choose Petsas Banner', linkUrl: '/about' },
    ];
  }
  return allBanners;
}

export default async function PromoBanners() {
  const banners = await getPromoBanners();
  return <PromoBannersClient banners={banners} />;
} 
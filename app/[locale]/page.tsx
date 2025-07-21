import React from 'react';
import { prisma } from '@/lib/prisma';
import { getSiteContent } from '@/lib/siteContent';
import { getLocale } from 'next-intl/server';
import { unstable_cache } from 'next/cache';
import HomePageClient from './HomePageClient';
import PromoBanners from '../components/home/PromoBanners';
import BlogPreview from '../components/home/BlogPreview';
import InfoBanners from '../components/home/InfoBanners';
import EnrichedInfo from '../components/home/EnrichedInfo';

async function getGlassmorphismSetting() {
  const settings = await prisma.generalSetting.findFirst();
  return settings?.glassmorphismEnabled ?? true; // Default to enabled
}

async function getHeroImage() {
  const heroImage = await getSiteContent('home_hero_image');
  return heroImage || '/hero-bg.jpg'; // Fallback to default
}

const getLocations = unstable_cache(
  async () => {
    const locations = await prisma.location.findMany({
      where: { 
        visible: true 
      },
      orderBy: { displayOrder: 'asc' },
      select: {
        id: true,
        name: true,
        type: true,
        visible: true,
        isPickupPoint: true,
        isDropoffPoint: true,
      }
    });
    
    return locations;
  },
  ['homepage-locations'],
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ['locations']
  }
);

export default async function HomePage() {
  const [glassmorphismEnabled, heroImageUrl, locations] = await Promise.all([
    getGlassmorphismSetting(),
    getHeroImage(),
    getLocations(),
  ]);
  
  return (
    <HomePageClient 
      glassmorphismEnabled={glassmorphismEnabled} 
      heroImageUrl={heroImageUrl}
      locations={locations}
      promoBanners={<PromoBanners />}
      blogPreview={<BlogPreview />}
      infoBanners={<InfoBanners />}
      enrichedInfo={<EnrichedInfo />}
    />
  );
} 
import React from 'react';
import { prisma } from '@/lib/prisma';
import { getSiteContent } from '@/lib/siteContent';
import { getLocale } from 'next-intl/server';
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

export default async function HomePage() {
  const [glassmorphismEnabled, heroImageUrl] = await Promise.all([
    getGlassmorphismSetting(),
    getHeroImage(),
  ]);
  
  return (
    <HomePageClient 
      glassmorphismEnabled={glassmorphismEnabled} 
      heroImageUrl={heroImageUrl}
      promoBanners={<PromoBanners />}
      blogPreview={<BlogPreview />}
      infoBanners={<InfoBanners />}
      enrichedInfo={<EnrichedInfo />}
    />
  );
} 
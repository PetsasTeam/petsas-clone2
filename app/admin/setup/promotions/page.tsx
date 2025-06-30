import React from 'react';
import PromotionsClient from './PromotionsClient';
import { prisma } from '../../../../lib/prisma';

async function getPromotions() {
  const promotions = await prisma.promotion.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
  return promotions;
}

async function getPromotionStats() {
  const totalPromotions = await prisma.promotion.count();
  const activePromotions = await prisma.promotion.count({
    where: { visible: true },
  });
  const expiredPromotions = await prisma.promotion.count({
    where: { endDate: { lt: new Date() } },
  });
  const upcomingPromotions = await prisma.promotion.count({
    where: { startDate: { gt: new Date() } },
  });

  return {
    total: totalPromotions,
    active: activePromotions,
    expired: expiredPromotions,
    upcoming: upcomingPromotions,
  };
}

export default async function PromotionsPage() {
  const promotions = await getPromotions();
  const stats = await getPromotionStats();

  return <PromotionsClient promotions={promotions} stats={stats} />;
} 
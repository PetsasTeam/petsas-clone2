import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { seasonId } = await req.json();
    if (typeof seasonId !== 'string') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    const pricings = await prisma.seasonalPricing.findMany({ where: { seasonId } });
    let updatedCount = 0;
    for (const pricing of pricings) {
      if (
        pricing.basePrice3to6Days != null &&
        pricing.basePrice7to14Days != null &&
        pricing.basePrice15PlusDays != null
      ) {
        await prisma.seasonalPricing.update({
          where: { id: pricing.id },
          data: {
            price3to6Days: pricing.basePrice3to6Days,
            price7to14Days: pricing.basePrice7to14Days,
            price15PlusDays: pricing.basePrice15PlusDays,
          },
        });
        updatedCount++;
      }
    }
    return NextResponse.json({ updated: updatedCount });
  } catch (error) {
    const err = error as any;
    console.error('Error resetting rates to base:', err, err?.stack || '');
    return NextResponse.json({ error: err?.message || 'Internal server error', stack: err?.stack }, { status: 500 });
  }
} 
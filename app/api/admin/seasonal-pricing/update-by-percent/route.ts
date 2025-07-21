import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { seasonId, percent } = await req.json();
    console.log('Received update-by-percent request:', { seasonId, percent });
    if (typeof seasonId !== 'string' || typeof percent !== 'number') {
      console.error('Invalid input:', { seasonId, percent });
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    const multiplier = 1 + percent / 100;
    console.log('Multiplier:', multiplier);
    const updated = await prisma.seasonalPricing.updateMany({
      where: { seasonId },
      data: {
        price3to6Days: { multiply: multiplier },
        price7to14Days: { multiply: multiplier },
        price15PlusDays: { multiply: multiplier },
      },
    });
    console.log('updateMany result:', updated);
    // Now round to 2 decimal places (Prisma updateMany does not support rounding, so fetch and update individually)
    const pricings = await prisma.seasonalPricing.findMany({ where: { seasonId } });
    console.log('Fetched pricings:', pricings.length);
    let roundedCount = 0;
    for (const pricing of pricings) {
      const p3 = Math.round(pricing.price3to6Days * 100) / 100;
      const p7 = Math.round(pricing.price7to14Days * 100) / 100;
      const p15 = Math.round(pricing.price15PlusDays * 100) / 100;
      if (p3 !== pricing.price3to6Days || p7 !== pricing.price7to14Days || p15 !== pricing.price15PlusDays) {
        console.log('Updating pricing:', pricing.id, { p3, p7, p15 });
        await prisma.seasonalPricing.update({
          where: { id: pricing.id },
          data: {
            price3to6Days: p3,
            price7to14Days: p7,
            price15PlusDays: p15,
          },
        });
        roundedCount++;
      }
    }
    console.log('Rounded count:', roundedCount);
    return NextResponse.json({ updated: updated.count, rounded: roundedCount });
  } catch (error) {
    const err = error as any;
    console.error('Error updating prices by percent:', err, err?.stack || '');
    return NextResponse.json({ error: err?.message || 'Internal server error', stack: err?.stack }, { status: 500 });
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const seasonId = req.nextUrl.searchParams.get('seasonId');
  if (!seasonId) {
    return NextResponse.json({ error: 'seasonId is required' }, { status: 400 });
  }
  try {
    const pricings = await prisma.seasonalPricing.findMany({
      where: { seasonId },
    });
    return NextResponse.json(pricings);
  } catch (error) {
    console.error('Error fetching pricings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
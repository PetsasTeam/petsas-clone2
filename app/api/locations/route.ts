import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
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
        displayOrder: true
      }
    });

    const response = NextResponse.json(locations);
    
    // Add aggressive cache headers since locations rarely change
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
    response.headers.set('CDN-Cache-Control', 'public, max-age=3600');
    
    return response;
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
  }
} 
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

const BulkDeleteSchema = z.object({
  bookingIds: z.array(z.string().min(1, 'Booking ID is required')),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedFields = BulkDeleteSchema.safeParse(body);
    
    if (!validatedFields.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed',
          errors: validatedFields.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { bookingIds } = validatedFields.data;

    if (bookingIds.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'No booking IDs provided' 
        },
        { status: 400 }
      );
    }

    // Check how many bookings exist
    const existingBookings = await prisma.booking.findMany({
      where: {
        id: {
          in: bookingIds,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingBookings.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'No valid bookings found to delete' 
        },
        { status: 404 }
      );
    }

    // Delete the bookings
    const deleteResult = await prisma.booking.deleteMany({
      where: {
        id: {
          in: bookingIds,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deleteResult.count} booking(s)`,
      deletedCount: deleteResult.count,
      requestedCount: bookingIds.length,
    });

  } catch (error) {
    console.error('Bulk delete bookings error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
} 
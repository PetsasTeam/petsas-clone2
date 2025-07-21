import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { bookingId, status, paymentStatus } = await request.json();

    if (!bookingId || !status || !paymentStatus) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: bookingId, status, paymentStatus' 
        },
        { status: 400 }
      );
    }

    // Verify booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Booking not found' 
        },
        { status: 404 }
      );
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status,
        paymentStatus,
      },
    });

    console.log(`📝 Updated booking ${bookingId} status to '${status}' and payment status to '${paymentStatus}'`);

    return NextResponse.json({
      success: true,
      message: 'Booking status updated successfully',
      booking: {
        id: updatedBooking.id,
        status: updatedBooking.status,
        paymentStatus: updatedBooking.paymentStatus,
      },
    });

  } catch (error) {
    console.error('Update booking status error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
} 
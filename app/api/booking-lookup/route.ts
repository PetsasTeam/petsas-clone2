import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { z } from 'zod';

// Validation schema
const BookingLookupSchema = z.object({
  invoiceNo: z.string().min(1, 'Invoice number is required'),
  email: z.string().email('Valid email address is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedFields = BookingLookupSchema.safeParse(body);
    
    if (!validatedFields.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid input data',
          errors: validatedFields.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { invoiceNo, email } = validatedFields.data;

    // Find booking by invoice number and customer email
    const booking = await prisma.booking.findFirst({
      where: {
        invoiceNo: invoiceNo,
        customer: {
          email: email
        }
      },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          }
        },
        vehicle: {
          select: {
            name: true,
            code: true,
          }
        }
      }
    });

    if (!booking) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Booking not found with the provided invoice number and email address.' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Booking found successfully',
      booking: {
        id: booking.id,
        invoiceNo: booking.invoiceNo,
        orderNumber: booking.orderNumber || 'N/A', // Handle null order numbers for failed payments
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        totalPrice: booking.totalPrice,
        startDate: booking.startDate.toISOString(),
        endDate: booking.endDate.toISOString(),
        customer: booking.customer,
        vehicle: booking.vehicle,
      }
    });

  } catch (error) {
    console.error('Booking lookup error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
} 
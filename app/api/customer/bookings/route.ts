'use server';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Customer ID is required' 
        },
        { status: 400 }
      );
    }

    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Customer not found' 
        },
        { status: 404 }
      );
    }

    // Fetch customer bookings with vehicle and category details
    const bookings = await prisma.booking.findMany({
      where: { customerId },
      include: {
        vehicle: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      bookings: bookings.map(booking => ({
        id: booking.id,
        invoiceNo: booking.invoiceNo,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        paymentType: booking.paymentType,
        startDate: booking.startDate,
        endDate: booking.endDate,
        totalPrice: booking.totalPrice,
        createdAt: booking.createdAt,
        vehicle: {
          id: booking.vehicle.id,
          name: booking.vehicle.name,
          code: booking.vehicle.code,
          image: booking.vehicle.image,
          category: booking.vehicle.category.name,
          seats: booking.vehicle.seats,
          doors: booking.vehicle.doors,
          transmission: booking.vehicle.transmission,
        },
      })),
    });

  } catch (error) {
    console.error('Fetch bookings error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
} 
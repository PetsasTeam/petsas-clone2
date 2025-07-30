'use server';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { z } from 'zod';
import { sendMail } from '../../../../lib/mail';
import { generateBookingConfirmationEmail } from '../../../../lib/email-templates';
import path from 'path';

const BookingSchema = z.object({
  customerId: z.string().nullable().optional(),
  vehicleId: z.string().min(1, 'Vehicle ID is required'),
  pickupDate: z.string().min(1, 'Pickup date is required'),
  dropoffDate: z.string().min(1, 'Dropoff date is required'),
  pickupLocation: z.string().min(1, 'Pickup location is required'),
  dropoffLocation: z.string().min(1, 'Dropoff location is required'),
  pickupTime: z.string().min(1, 'Pickup time is required'),
  dropoffTime: z.string().min(1, 'Dropoff time is required'),
  totalPrice: z.number().min(0, 'Total price must be positive'),
  paymentType: z.enum(['online', 'arrival'], { 
    errorMap: () => ({ message: 'Invalid payment type' })
  }),
  selectedExtras: z.array(z.object({
    id: z.string(),
    name: z.string(),
    quantity: z.number(),
    price: z.number(),
  })).optional(),
  flightInfo: z.object({
    flightNo: z.string().optional(),
    airline: z.string().optional(),
    arrivalTime: z.string().optional(),
  }).optional(),
  comments: z.string().optional(),
  promotionCode: z.string().optional(),
});

// Helper function to send booking confirmation email using new template
async function sendBookingConfirmationEmailNew(booking: any, bookingDetails: any) {
  const emailData = {
    booking: {
      id: booking.id,
      invoiceNo: booking.invoiceNo,
      orderNumber: booking.orderNumber || 'N/A',
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      paymentType: booking.paymentType,
      totalPrice: booking.totalPrice,
      startDate: booking.startDate,
      endDate: booking.endDate,
      customer: booking.customer,
      vehicle: booking.vehicle,
    },
    bookingDetails,
  };

  const { html, text } = generateBookingConfirmationEmail(emailData);

  await sendMail({
    to: booking.customer.email,
    subject: `Booking Confirmation #${booking.orderNumber || booking.invoiceNo} - Petsas Car Rentals`,
    text,
    html,
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== BOOKING API: POST REQUEST RECEIVED ===');
    
    const body = await request.json();
    
    // Log the incoming request body for debugging
    console.log('📝 Booking creation request body:', JSON.stringify(body, null, 2));
    
    // Validate input
    console.log('🔍 Starting validation...');
    const validatedFields = BookingSchema.safeParse(body);
    
    if (!validatedFields.success) {
      console.log('❌ VALIDATION FAILED');
      console.log('Validation errors:', JSON.stringify(validatedFields.error.flatten(), null, 2));
      console.log('Received data keys:', Object.keys(body));
      console.log('Received data types:', Object.fromEntries(
        Object.entries(body).map(([key, value]) => [key, typeof value])
      ));
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed',
          errors: validatedFields.error.flatten().fieldErrors,
          receivedData: body
        },
        { status: 400 }
      );
    }
    
    console.log('✅ Validation passed');

    const {
      customerId,
      vehicleId,
      pickupDate,
      dropoffDate,
      pickupLocation,
      dropoffLocation,
      pickupTime,
      dropoffTime,
      totalPrice,
      paymentType,
      selectedExtras,
      flightInfo,
      comments,
      promotionCode,
    } = validatedFields.data;

    console.log('🔍 Processing customer...');
    // Handle customer - either find existing or we'll get the ID from the frontend
    let actualCustomerId = customerId;
    console.log('Customer ID received:', actualCustomerId);
    
    if (!actualCustomerId) {
      console.log('❌ No customer ID provided');
      return NextResponse.json(
        { 
          success: false, 
          message: 'Customer ID is required' 
        },
        { status: 400 }
      );
    }

    // Verify customer exists
    console.log('🔍 Looking up customer in database...');
    const customer = await prisma.customer.findUnique({
      where: { id: actualCustomerId },
    });

    if (!customer) {
      console.log('❌ Customer not found with ID:', actualCustomerId);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Customer not found' 
        },
        { status: 404 }
      );
    }
    
    console.log('✅ Customer found:', { id: customer.id, email: customer.email });

    // Verify vehicle exists and is available
    console.log('🔍 Looking up vehicle in database...');
    console.log('Vehicle ID:', vehicleId);
    
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      console.log('❌ Vehicle not found with ID:', vehicleId);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Vehicle not found' 
        },
        { status: 404 }
      );
    }
    
    if (!vehicle.visible) {
      console.log('❌ Vehicle not visible/available:', vehicleId);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Vehicle not available' 
        },
        { status: 404 }
      );
    }

    console.log('✅ Vehicle found and available:', { id: vehicle.id, name: vehicle.name });

    console.log('🔍 Invoice numbers will be assigned after successful payment...');

    // Generate order number for ALL bookings (both arrival and online)
    console.log('📋 Generating order number for booking...');
    
    // Get current order counter from settings to ensure it exists
    const generalSettings = await prisma.generalSetting.findFirst();
    if (!generalSettings) {
      console.error('❌ No general settings found for order number generation');
      return NextResponse.json(
        { 
          success: false, 
          error: 'System configuration error' 
        },
        { status: 500 }
      );
    }
    
    // Use atomic increment transaction to prevent race conditions
    const orderNumberResult = await prisma.$transaction(async (tx) => {
      // Get current counter value with SELECT FOR UPDATE to lock the row
      const currentSettings = await tx.generalSetting.findFirst({
        select: { id: true, nextOrderNumber: true }
      });
      
      if (!currentSettings) {
        throw new Error('General settings not found');
      }
      
      // Get the next number to use (ensure it starts at 1, not 0)
      const nextNumber = parseInt(currentSettings.nextOrderNumber || '1');
      const actualNumber = nextNumber < 1 ? 1 : nextNumber;
      
      // Increment counter atomically within the transaction
      await tx.generalSetting.update({
        where: { id: currentSettings.id },
        data: {
          nextOrderNumber: (actualNumber + 1).toString(),
        },
      });
      
      return actualNumber;
    });
    
    const orderNumber = `K${orderNumberResult.toString().padStart(6, '0')}`; // Format: K000001
    
    console.log(`📋 Generated order number: ${orderNumber}`);
    console.log(`🔢 Order counter incremented: ${orderNumberResult} → ${orderNumberResult + 1}`);

    console.log('📝 Creating booking in database...');
    console.log('Booking data to create:', {
      customerId: actualCustomerId,
      vehicleId,
      startDate: new Date(pickupDate),
      endDate: new Date(dropoffDate),
      totalPrice,
      status: paymentType === 'online' ? 'Pending' : 'Confirmed', // Online payments start as Pending
      paymentStatus: paymentType === 'online' ? 'Pending' : 'Pay on Arrival',
      paymentType: paymentType === 'online' ? 'Online' : 'On Arrival',
      orderNumber: orderNumber, // Assign order number for pay on arrival
      // invoiceNo will be assigned after successful payment (online payments only)
    });

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        customerId: actualCustomerId,
        vehicleId,
        startDate: new Date(pickupDate),
        endDate: new Date(dropoffDate),
        totalPrice,
        status: paymentType === 'online' ? 'Pending' : 'Confirmed', // Online payments start as Pending
        paymentStatus: paymentType === 'online' ? 'Pending' : 'Pay on Arrival',
        paymentType: paymentType === 'online' ? 'Online' : 'On Arrival',
        orderNumber: orderNumber, // Assign order number for pay on arrival
        // invoiceNo will be assigned after successful payment (online payments only)
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            name: true,
            code: true,
            image: true,
          },
        },
      },
    });
    
    console.log('✅ Booking created successfully:', { id: booking.id, status: booking.status, orderNumber: booking.orderNumber });

    // Note: Invoice numbers will be assigned after successful payment

    // Log additional booking details for now
    console.log('Booking created with additional details:', {
      bookingId: booking.id,
      pickupLocation,
      dropoffLocation,
      pickupTime,
      dropoffTime,
      selectedExtras,
      flightInfo,
      comments,
      promotionCode,
    });

    // Send booking confirmation email (for pay on arrival bookings)
    if (paymentType === 'arrival') {
      try {
        const emailData = {
          booking: {
            id: booking.id,
            invoiceNo: booking.invoiceNo || 'N/A',
            orderNumber: booking.orderNumber || 'N/A',
            status: booking.status,
            paymentStatus: booking.paymentStatus,
            paymentType: booking.paymentType,
            totalPrice: booking.totalPrice,
            startDate: booking.startDate.toISOString(),
            endDate: booking.endDate.toISOString(),
            customer: {
              firstName: booking.customer.firstName,
              lastName: booking.customer.lastName,
              email: booking.customer.email,
              phone: booking.customer.phone,
            },
            vehicle: {
              name: booking.vehicle.name,
              code: booking.vehicle.code,
              image: booking.vehicle.image,
            },
          },
          bookingDetails: {
            pickupLocation,
            dropoffLocation,
            pickupTime,
            dropoffTime,
            selectedExtras: selectedExtras || [],
            flightInfo,
            comments,
          },
        };

        const { html, text } = generateBookingConfirmationEmail(emailData);

        await sendMail({
          to: booking.customer.email,
          subject: `Booking Confirmation #${booking.orderNumber || 'N/A'} - Petsas Car Rentals`,
          text,
          html,
          attachments: [
            {
              filename: 'logo.png',
              path: path.join(process.cwd(), 'public', 'logo.png'),
              cid: 'logo'
            }
          ]
        });
        console.log(`Booking confirmation email sent to ${booking.customer.email}`);
      } catch (emailError) {
        console.error('Failed to send booking confirmation email:', emailError);
        // Don't fail the booking for email errors
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Booking created successfully',
      booking: {
        id: booking.id,
        invoiceNo: booking.invoiceNo,
        orderNumber: booking.orderNumber,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        paymentType: booking.paymentType,
        totalPrice: booking.totalPrice,
        startDate: booking.startDate,
        endDate: booking.endDate,
        customer: booking.customer,
        vehicle: booking.vehicle,
      },
    });

  } catch (error) {
    console.error('❌ BOOKING CREATION ERROR');
    console.error('Error type:', typeof error);
    console.error('Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Full error object:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    
    // Check if it's a Prisma error
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('Prisma error code:', (error as any).code);
      console.error('Prisma error meta:', (error as any).meta);
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 
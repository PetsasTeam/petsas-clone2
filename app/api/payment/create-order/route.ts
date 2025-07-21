import { NextRequest, NextResponse } from 'next/server';
import { createJCCPaymentOrder, formatAmountForJCC } from '../../../../lib/jcc-payment';
import { prisma } from '../../../../lib/prisma';

// Helper function to get client IP address
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');
  const cloudflare = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (real) {
    return real;
  }
  if (cloudflare) {
    return cloudflare;
  }
  
  return 'unknown';
}

// Helper function to log payment attempts
async function logPaymentAttempt(data: {
  bookingId?: string;
  orderId?: string;
  orderNumber?: string;
  amount: number;
  currency?: string;
  customerEmail?: string;
  customerFirstName?: string;
  customerLastName?: string;
  customerPhone?: string;
  paymentType: string;
  status: string;
  jccOrderId?: string;
  jccStatus?: string;
  jccErrorCode?: string;
  jccErrorMessage?: string;
  jccFormUrl?: string;
  attemptNumber?: number;
  processingTime?: number;
  userAgent?: string;
  ipAddress?: string;
  rawJccResponse?: string;
  errorDetails?: string;
}) {
  try {
    await prisma.paymentLog.create({
      data: {
        bookingId: data.bookingId,
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        amount: data.amount,
        currency: data.currency || 'EUR',
        customerEmail: data.customerEmail,
        customerFirstName: data.customerFirstName,
        customerLastName: data.customerLastName,
        customerPhone: data.customerPhone ? data.customerPhone : undefined,
        paymentType: data.paymentType,
        status: data.status,
        jccOrderId: data.jccOrderId,
        jccStatus: data.jccStatus,
        jccErrorCode: data.jccErrorCode,
        jccErrorMessage: data.jccErrorMessage,
        jccFormUrl: data.jccFormUrl,
        attemptNumber: data.attemptNumber || 1,
        processingTime: data.processingTime,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        rawJccResponse: data.rawJccResponse,
        errorDetails: data.errorDetails,
      },
    });
    console.log('✅ Payment attempt logged successfully');
  } catch (error) {
    console.error('❌ Failed to log payment attempt:', error);
    // Don't throw - logging failures shouldn't break payment processing
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const ipAddress = getClientIP(request);

  try {
    const body = await request.json();
    const { 
      bookingId, 
      amount, 
      currency = 'EUR',
      customerEmail,
      customerPhone,
      customerFirstName,
      customerLastName,
    } = body;

    if (!bookingId || !amount) {
      // Log missing parameters attempt
      await logPaymentAttempt({
        bookingId,
        amount: amount || 0,
        currency,
        customerEmail,
        customerFirstName,
        customerLastName,
        customerPhone: customerPhone ? customerPhone : undefined,
        paymentType: 'create_order',
        status: 'failed',
        processingTime: Date.now() - startTime,
        userAgent,
        ipAddress,
        errorDetails: 'Missing required fields: bookingId, amount',
      });

      return NextResponse.json(
        { success: false, error: 'Missing required fields: bookingId, amount' },
        { status: 400 }
      );
    }

    // Verify booking exists and get details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
        vehicle: true,
      },
    });

    if (!booking) {
      // Log booking not found attempt
      await logPaymentAttempt({
        bookingId,
        amount,
        currency,
        customerEmail,
        customerFirstName,
        customerLastName,
        customerPhone: customerPhone ? customerPhone : undefined,
        paymentType: 'create_order',
        status: 'failed',
        processingTime: Date.now() - startTime,
        userAgent,
        ipAddress,
        errorDetails: 'Booking not found',
      });

      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if booking is already paid
    if (booking.paymentStatus === 'Paid') {
      // Log already paid attempt
      await logPaymentAttempt({
        bookingId: booking.id,
        amount,
        currency,
        customerEmail: customerEmail || booking.customer.email,
        customerFirstName: customerFirstName || booking.customer.firstName,
        customerLastName: customerLastName || booking.customer.lastName,
        customerPhone: (customerPhone || booking.customer.phone) ? (customerPhone || booking.customer.phone) : undefined,
        paymentType: 'create_order',
        status: 'failed',
        processingTime: Date.now() - startTime,
        userAgent,
        ipAddress,
        errorDetails: 'Booking is already paid',
      });

      return NextResponse.json(
        { success: false, error: 'Booking is already paid' },
        { status: 400 }
      );
    }

    // Generate a temporary order reference for JCC (not our final order number)
    const tempOrderReference = `TEMP-${booking.id.substring(0, 8)}-${Date.now()}`;
    
    console.log(`📋 Generated temporary order reference: ${tempOrderReference}`);

    // Prepare JCC order data
    const jccOrderData = {
      amount: formatAmountForJCC(amount), // Convert to cents
      currency,
      orderNumber: tempOrderReference, // Use temporary reference for JCC
      description: `Car Rental - ${booking.vehicle.name} - Booking #${booking.id.substring(0, 8)}`,
      returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/booking-confirmation?bookingId=${bookingId}`,
      failUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/failure?bookingId=${bookingId}`,
      customerDetails: {
        email: customerEmail || booking.customer.email,
        phone: customerPhone || booking.customer.phone,
        firstName: customerFirstName || booking.customer.firstName,
        lastName: customerLastName || booking.customer.lastName,
      },
      jsonParams: {
        bookingId: booking.id,
        vehicleName: booking.vehicle.name,
      },
    };

    // Create payment order with JCC
    const jccResponse = await createJCCPaymentOrder(jccOrderData);

    if (!jccResponse.success) {
      // Log JCC order creation failure
      await logPaymentAttempt({
        bookingId: booking.id,
        orderNumber: tempOrderReference,
        amount,
        currency,
        customerEmail: customerEmail || booking.customer.email,
        customerFirstName: customerFirstName || booking.customer.firstName,
        customerLastName: customerLastName || booking.customer.lastName,
        customerPhone: (customerPhone || booking.customer.phone) ? (customerPhone || booking.customer.phone) : undefined,
        paymentType: 'create_order',
        status: 'failed',
        jccErrorMessage: jccResponse.error,
        processingTime: Date.now() - startTime,
        userAgent,
        ipAddress,
        rawJccResponse: JSON.stringify(jccResponse),
        errorDetails: `JCC order creation failed: ${jccResponse.error}`,
      });

      return NextResponse.json(
        { success: false, error: jccResponse.error },
        { status: 500 }
      );
    }

    // Update booking with JCC order ID and set payment status to Pending
    // DO NOT set order number yet - it will be generated only upon successful payment
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: 'Pending',
        // Note: orderNumber will be set during payment verification success
        // Note: transactionId will be set to JCC orderId after payment verification
      },
    });

    // Log successful payment order creation
    await logPaymentAttempt({
      bookingId: booking.id,
      orderId: jccResponse.orderId,
      orderNumber: tempOrderReference,
      amount,
      currency,
      customerEmail: customerEmail || booking.customer.email,
      customerFirstName: customerFirstName || booking.customer.firstName,
      customerLastName: customerLastName || booking.customer.lastName,
      customerPhone: (customerPhone || booking.customer.phone) ? (customerPhone || booking.customer.phone) : undefined,
      paymentType: 'create_order',
      status: 'success',
      jccOrderId: jccResponse.orderId,
      jccFormUrl: jccResponse.formUrl,
      processingTime: Date.now() - startTime,
      userAgent,
      ipAddress,
      rawJccResponse: JSON.stringify(jccResponse),
    });

    // Log payment initiation
    console.log('Payment order created successfully:', {
      bookingId,
      invoiceNo: booking.invoiceNo,
      jccOrderId: jccResponse.orderId,
      tempOrderReference,
      amount,
      currency,
    });

    return NextResponse.json({
      success: true,
      paymentUrl: jccResponse.formUrl,
      orderId: jccResponse.orderId,
      tempOrderReference,
    });

  } catch (error) {
    console.error('Payment order creation error:', error);
    
    // Log unexpected error
    await logPaymentAttempt({
      amount: 0,
      paymentType: 'create_order',
      status: 'failed',
      processingTime: Date.now() - startTime,
      userAgent,
      ipAddress,
      errorDetails: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
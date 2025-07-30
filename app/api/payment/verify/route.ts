import { NextRequest, NextResponse } from 'next/server';
import { verifyJCCPayment } from '../../../../lib/jcc-payment';
import { prisma } from '../../../../lib/prisma';
import { sendMail } from '../../../../lib/mail';
import { generatePaymentConfirmationEmail } from '../../../../lib/email-templates';
import path from 'path';

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
        customerPhone: data.customerPhone,
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

  } catch (error) {
    console.error('❌ Failed to log payment attempt:', error);
    // Don't throw - logging failures shouldn't break payment processing
  }
}

// Helper function to send booking confirmation email after payment using new template
async function sendPaymentConfirmationEmailNew(booking: any) {
  const emailData = {
    booking: {
      id: booking.id,
      invoiceNo: booking.invoiceNo || 'N/A',
      orderNumber: booking.orderNumber || 'N/A', // Use actual orderNumber, fallback to N/A
      status: booking.status,
      paymentStatus: 'Paid',
      paymentType: booking.paymentType === 'On Arrival' ? 'Pay on Arrival' : 'Online Payment',
      totalPrice: booking.totalPrice,
      startDate: booking.startDate.toISOString(),
      endDate: booking.endDate.toISOString(),
      customer: {
        firstName: booking.customer.firstName,
        lastName: booking.customer.lastName,
        email: booking.customer.email,
        phone: booking.customer.phone ?? '',
      },
      vehicle: {
        name: booking.vehicle.name,
        code: booking.vehicle.code ?? '',
        image: booking.vehicle.image,
      },
    },
    bookingDetails: {
      pickupLocation: 'Larnaca Airport', // TODO: Get from booking data
      dropoffLocation: 'Larnaca Airport', // TODO: Get from booking data  
      pickupTime: '09:00',
      dropoffTime: '09:00',
      selectedExtras: [], // TODO: Get from booking data
      flightInfo: {
        flightNo: '',
        airline: '',
        arrivalTime: '',
      },
      comments: '',
    },
  };

  const { html, text } = generatePaymentConfirmationEmail(emailData);

  await sendMail({
    to: booking.customer.email,
    subject: `Payment Confirmed #${booking.orderNumber || booking.invoiceNo} - Petsas Car Rentals`,
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
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const ipAddress = getClientIP(request);

  try {
    const body = await request.json();
    const { orderId, bookingId } = body;
    
    // Check if this JCC order has already been processed
    const existingPayment = await prisma.paymentLog.findFirst({
      where: {
        jccOrderId: orderId,
        status: 'success',
        paymentType: 'verify_payment'
      }
    });

    if (existingPayment) {

      return NextResponse.json({
        success: true,
        message: 'Payment already processed',
        paymentStatus: 'Paid',
        existingPayment: true
      });
    }

    if (!orderId || !bookingId) {
      // Log missing parameters attempt
      await logPaymentAttempt({
        orderId,
        bookingId,
        amount: 0,
        paymentType: 'verify_payment',
        status: 'failed',
        processingTime: Date.now() - startTime,
        userAgent,
        ipAddress,
        errorDetails: 'Missing required fields: orderId, bookingId',
      });

      return NextResponse.json(
        { success: false, error: 'Missing required fields: orderId, bookingId' },
        { status: 400 }
      );
    }

    // Get booking details first
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
        orderId,
        bookingId,
        amount: 0,
        paymentType: 'verify_payment',
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

    // Verify payment with JCC
    const jccVerification = await verifyJCCPayment(orderId);

    if (!jccVerification.success) {
      console.error('JCC verification failed:', jccVerification.error);
      
      // Log JCC verification failure
      await logPaymentAttempt({
        bookingId: booking.id,
        orderId,
        orderNumber: booking.orderNumber || undefined,
        amount: booking.totalPrice,
        customerEmail: booking.customer.email,
        customerFirstName: booking.customer.firstName,
        customerLastName: booking.customer.lastName,
        customerPhone: booking.customer.phone || undefined,
        paymentType: 'verify_payment',
        status: 'failed',
        jccOrderId: orderId,
        jccErrorMessage: jccVerification.error,
        processingTime: Date.now() - startTime,
        userAgent,
        ipAddress,
        rawJccResponse: JSON.stringify(jccVerification),
        errorDetails: `JCC verification failed: ${jccVerification.error}`,
      });
      
      // JCC verification failed - this means the payment actually failed
      // We should NOT assume success even in test mode unless we're sure it's an API connectivity issue
      const isTestMode = process.env.NODE_ENV === 'development' || process.env.JCC_TEST_MODE === 'true';
      
      // Only use fallback for API connectivity issues, NOT for actual payment failures
      if (isTestMode && (
        jccVerification.error?.includes('credentials not configured') ||
        jccVerification.error?.includes('Network error') ||
        jccVerification.error?.includes('non-JSON response')
      )) {
        console.log('⚠️ JCC API connectivity issue in test mode - this is likely a configuration problem, not a real payment failure');
        console.log('⚠️ For real payment testing, this should be treated as FAILED unless you are testing API connectivity');
        
        // In test mode, if it's clearly an API issue (not a payment failure), we can proceed with caution
        // But we should make it very clear this is a fallback
        console.log('🚨 WARNING: Using test mode fallback - this should NOT happen with real payments!');
        
        const fallbackVerification = {
          success: true,
          status: '2', // Assume paid ONLY for API connectivity testing
          amount: booking.totalPrice * 100,
          currency: 'EUR',
        };
        
        jccVerification.success = true;
        jccVerification.status = fallbackVerification.status;
        jccVerification.amount = fallbackVerification.amount;
        jccVerification.currency = fallbackVerification.currency;
        
        // Log the fallback verification with clear warning
        await logPaymentAttempt({
          bookingId: booking.id,
          orderId,
          orderNumber: booking.orderNumber || undefined,
          amount: booking.totalPrice,
          customerEmail: booking.customer.email,
          customerFirstName: booking.customer.firstName,
          customerLastName: booking.customer.lastName,
          customerPhone: booking.customer.phone || undefined,
          paymentType: 'verify_payment',
          status: 'success',
          jccOrderId: orderId,
          jccStatus: '2',
          processingTime: Date.now() - startTime,
          userAgent,
          ipAddress,
          rawJccResponse: JSON.stringify(fallbackVerification),
          errorDetails: '🚨 TEST MODE FALLBACK: API connectivity issue, not real payment verification',
        });
      } else {
        // This is a real payment failure or we're in production mode
        console.error('❌ JCC verification failed - payment was not successful:', jccVerification.error);
        
        // Update booking status to Failed when payment verification fails
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            paymentStatus: 'Failed',
            status: 'Failed',
          },
        });
        
        console.log(`📝 Updated booking ${bookingId} status to 'Failed' due to payment verification failure`);
        
        return NextResponse.json(
          { 
            success: false, 
            error: `Payment verification failed: ${jccVerification.error}`,
            isTestMode,
            jccError: jccVerification.error
          },
          { status: 500 }
        );
      }
    }

    // Update booking based on payment status
    let paymentStatus = 'Failed'; // Default to failed for security
    let bookingStatus = 'Failed'; // Default to failed for security

    // Convert status to string to handle both number and string responses
    const statusString = String(jccVerification.status);
    
    switch (statusString) {
      case '2': // Paid
        paymentStatus = 'Paid';
        bookingStatus = 'Confirmed';
        break;
      case '1': // Pre-authorized
        paymentStatus = 'Paid'; // Treat pre-auth as paid for simplicity
        bookingStatus = 'Confirmed';
        break;
      case '0': // Not paid
      default: // Any other status including undefined
        paymentStatus = 'Failed';
        bookingStatus = 'Failed';
        break;
    }

    // Generate invoice number for successful payments (order number already exists from booking creation)
    let invoiceNo = null;
    if (paymentStatus === 'Paid') {
      console.log('🧾 Generating invoice number for successful payment...');
      
      // Get current counters from settings to ensure it exists
      const generalSettings = await prisma.generalSetting.findFirst();
      if (!generalSettings) {
        console.error('❌ No general settings found for number generation');
        return NextResponse.json(
          { 
            success: false, 
            error: 'System configuration error' 
          },
          { status: 500 }
        );
      }
      
      // Use atomic increment transaction to prevent race conditions
      const invoiceNumberResult = await prisma.$transaction(async (tx) => {
        // Get current counter value
        const currentSettings = await tx.generalSetting.findFirst({
          select: { id: true, nextInvoiceNumber: true }
        });
        
        if (!currentSettings) {
          throw new Error('General settings not found');
        }
        
        // Get the next number to use (ensure it starts at 1, not 0)
        const nextNumber = parseInt(currentSettings.nextInvoiceNumber || '1');
        const actualNumber = nextNumber < 1 ? 1 : nextNumber;
        
        // Increment counter atomically within the transaction
        await tx.generalSetting.update({
          where: { id: currentSettings.id },
          data: {
            nextInvoiceNumber: (actualNumber + 1).toString(),
          },
        });
        
        return actualNumber;
      });
      
      invoiceNo = `P${invoiceNumberResult.toString().padStart(6, '0')}`; // Format: P000001
      
      console.log(`📄 Generated invoice number: ${invoiceNo}`);
      console.log(`📋 Order number already exists from booking creation: ${booking.orderNumber}`);
      console.log(`🔢 Invoice counter incremented: ${invoiceNumberResult} → ${invoiceNumberResult + 1}`);
    }

    // Update booking in database
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus,
        status: bookingStatus,
        transactionId: orderId, // Store JCC order ID as transaction ID
        invoiceNo: invoiceNo || undefined, // Assign invoice number only for successful payments
        // orderNumber already exists from booking creation, no need to update
      },
    });

    // Log payment verification FIRST to prevent race conditions
    await logPaymentAttempt({
      bookingId: booking.id,
      orderId,
      orderNumber: updatedBooking.orderNumber || undefined,
      amount: booking.totalPrice,
      customerEmail: booking.customer.email,
      customerFirstName: booking.customer.firstName,
      customerLastName: booking.customer.lastName,
      customerPhone: booking.customer.phone ? booking.customer.phone : undefined,
      paymentType: 'verify_payment',
      status: paymentStatus === 'Paid' ? 'success' : 'failed',
      jccOrderId: orderId,
      jccStatus: String(jccVerification.status),
      processingTime: Date.now() - startTime,
      userAgent,
      ipAddress,
      rawJccResponse: JSON.stringify(jccVerification),
      errorDetails: paymentStatus === 'Failed' ? `Payment failed with JCC status: ${jccVerification.status}` : undefined,
    });

    // Send confirmation email for successful payments
    if (paymentStatus === 'Paid') {
      try {
        console.log('📧 Attempting to send payment confirmation email...');
        console.log('📧 Email configuration check:', {
          SMTP_HOST: process.env.SMTP_HOST ? 'Set' : 'Missing',
          SMTP_PORT: process.env.SMTP_PORT ? 'Set' : 'Missing', 
          SMTP_USER: process.env.SMTP_USER ? 'Set' : 'Missing',
          SMTP_PASS: process.env.SMTP_PASS ? 'Set' : 'Missing',
          SMTP_FROM: process.env.SMTP_FROM ? 'Set' : 'Missing',
        });
        console.log('📧 Recipient email:', booking.customer.email);
        console.log('📧 Invoice number:', updatedBooking.invoiceNo);
        console.log('📧 Order number:', updatedBooking.orderNumber);
        
        // Create updated booking object with customer and vehicle info for email
        const bookingForEmail = {
          ...updatedBooking,
          customer: booking.customer,
          vehicle: booking.vehicle,
          startDate: booking.startDate,
          endDate: booking.endDate,
          totalPrice: booking.totalPrice,
          paymentType: booking.paymentType,
        };
        
        await sendPaymentConfirmationEmailNew(bookingForEmail);
        console.log(`✅ Payment confirmation email sent successfully to ${booking.customer.email}`);
      } catch (emailError) {
        console.error('❌ Failed to send payment confirmation email:', emailError);
        console.error('❌ Email error details:', {
          message: (emailError as Error).message,
          code: (emailError as any).code,
          command: (emailError as any).command,
        });
        // Don't fail the payment verification for email errors
      }
    } else {
      console.log(`❌ No email sent - payment status: ${paymentStatus}`);
    }

    // Log payment verification
    console.log('Payment verification completed:', {
      bookingId,
      invoiceNo: updatedBooking.invoiceNo,
      orderNumber: updatedBooking.orderNumber,
      jccOrderId: orderId,
      paymentStatus,
      jccStatus: jccVerification.status,
      amount: jccVerification.amount,
    });

    return NextResponse.json({
      success: true,
      paymentStatus,
      bookingStatus,
      jccStatus: jccVerification.status,
      amount: jccVerification.amount,
      currency: jccVerification.currency,
      booking: {
        id: updatedBooking.id,
        invoiceNo: updatedBooking.invoiceNo,
        orderNumber: updatedBooking.orderNumber,
        status: updatedBooking.status,
        paymentStatus: updatedBooking.paymentStatus,
        totalPrice: booking.totalPrice,
        startDate: booking.startDate,
        endDate: booking.endDate,
        customer: {
          firstName: booking.customer.firstName,
          lastName: booking.customer.lastName,
          email: booking.customer.email,
        },
        vehicle: {
          name: booking.vehicle.name,
        },
      },
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle GET requests for webhook/callback verification
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const bookingId = searchParams.get('bookingId');

    if (!orderId || !bookingId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Return a simple success response without processing payment again
    return NextResponse.json({
      success: true,
      message: 'GET request acknowledged - use POST for payment verification'
    });

  } catch (error) {
    console.error('Payment verification GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
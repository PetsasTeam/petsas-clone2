import React from 'react';
import { prisma } from '@/lib/prisma';
import BookingConfirmationClient from './BookingConfirmationClient';
import { verifyJCCPayment } from '@/lib/jcc-payment';
import { sendMail } from '@/lib/mail';
import { generatePaymentConfirmationEmail } from '@/lib/email-templates';
import path from 'path';

async function getGlassmorphismSetting() {
  const settings = await prisma.generalSetting.findFirst();
  return settings?.glassmorphismEnabled ?? true;
}

async function verifyPaymentAndUpdateBooking(bookingId: string, orderId: string) {
  try {
    console.log('🔍 Verifying payment for booking:', bookingId, 'orderId:', orderId);
    
    // Check if payment is already verified
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { paymentStatus: true },
    });
    
    if (booking?.paymentStatus === 'Paid') {
      console.log('✅ Payment already verified for booking:', bookingId);
      return true;
    }
    
    // Verify payment with JCC
    const jccVerification = await verifyJCCPayment(orderId);
    
    if (!jccVerification.success) {
      console.error('❌ JCC verification failed:', jccVerification.error);
      return false;
    }
    
    // Update booking based on payment status
    let paymentStatus = 'Failed';
    let bookingStatus = 'Failed';
    
    const statusString = String(jccVerification.status);
    switch (statusString) {
      case '2': // Paid
      case '1': // Pre-authorized
        paymentStatus = 'Paid';
        bookingStatus = 'Confirmed';
        break;
      default:
        paymentStatus = 'Failed';
        bookingStatus = 'Failed';
        break;
    }
    
    // Generate invoice number for successful payments
    let invoiceNo = null;
    if (paymentStatus === 'Paid') {
      const generalSettings = await prisma.generalSetting.findFirst();
      if (generalSettings) {
        // Use atomic increment transaction to prevent race conditions
        const invoiceNumberResult = await prisma.$transaction(async (tx) => {
          const currentSettings = await tx.generalSetting.findFirst({
            select: { id: true, nextInvoiceNumber: true }
          });
          
          if (!currentSettings) {
            throw new Error('General settings not found');
          }
          
          const currentCounter = parseInt(currentSettings.nextInvoiceNumber || '1');
          
          await tx.generalSetting.update({
            where: { id: currentSettings.id },
            data: {
              nextInvoiceNumber: (currentCounter + 1).toString(),
            },
          });
          
          return currentCounter;
        });
        
        invoiceNo = `P${invoiceNumberResult.toString().padStart(6, '0')}`;
        console.log('📄 Generated invoice number:', invoiceNo);
      }
    }
    
    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus,
        status: bookingStatus,
        transactionId: orderId,
        invoiceNo: invoiceNo || undefined,
      },
    });
    
    console.log('✅ Payment verification and booking update completed:', {
      bookingId,
      paymentStatus,
      bookingStatus,
      invoiceNo,
    });
    
    // Send confirmation email for successful payments
    if (paymentStatus === 'Paid') {
      try {
        console.log('📧 Attempting to send payment confirmation email...');
        
        // Get full booking details with customer and vehicle info for email
        const fullBooking = await prisma.booking.findUnique({
          where: { id: bookingId },
          include: {
            customer: true,
            vehicle: true,
          },
        });
        
        if (fullBooking) {
          console.log('📧 Email configuration check:', {
            SMTP_HOST: process.env.SMTP_HOST ? 'Set' : 'Missing',
            SMTP_PORT: process.env.SMTP_PORT ? 'Set' : 'Missing', 
            SMTP_USER: process.env.SMTP_USER ? 'Set' : 'Missing',
            SMTP_PASS: process.env.SMTP_PASS ? 'Set' : 'Missing',
            SMTP_FROM: process.env.SMTP_FROM ? 'Set' : 'Missing',
          });
          console.log('📧 Recipient email:', fullBooking.customer.email);
          console.log('📧 Invoice number:', updatedBooking.invoiceNo);
          console.log('📧 Order number:', updatedBooking.orderNumber);
          
          // Create booking object for email
          const bookingForEmail = {
            ...updatedBooking,
            customer: fullBooking.customer,
            vehicle: fullBooking.vehicle,
            startDate: fullBooking.startDate,
            endDate: fullBooking.endDate,
            totalPrice: fullBooking.totalPrice,
            paymentType: fullBooking.paymentType,
          };
          
          // Prepare email data
          const emailData = {
            booking: {
              id: bookingForEmail.id,
              invoiceNo: bookingForEmail.invoiceNo || 'N/A',
              orderNumber: bookingForEmail.orderNumber || 'N/A',
              status: bookingForEmail.status,
              paymentStatus: 'Paid',
              paymentType: bookingForEmail.paymentType === 'On Arrival' ? 'Pay on Arrival' : 'Online Payment',
              totalPrice: bookingForEmail.totalPrice,
              startDate: bookingForEmail.startDate.toISOString(),
              endDate: bookingForEmail.endDate.toISOString(),
              customer: {
                firstName: bookingForEmail.customer.firstName,
                lastName: bookingForEmail.customer.lastName,
                email: bookingForEmail.customer.email,
                phone: bookingForEmail.customer.phone ?? '',
              },
              vehicle: {
                name: bookingForEmail.vehicle.name,
                code: bookingForEmail.vehicle.code ?? '',
                image: bookingForEmail.vehicle.image,
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
            to: bookingForEmail.customer.email,
            subject: `Payment Confirmed #${bookingForEmail.orderNumber || bookingForEmail.invoiceNo} - Petsas Car Rentals`,
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
          
          console.log(`✅ Payment confirmation email sent successfully to ${bookingForEmail.customer.email}`);
        }
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
    
    return paymentStatus === 'Paid';
    
  } catch (error) {
    console.error('❌ Payment verification error:', error);
    return false;
  }
}

async function getBookingDetails(bookingId: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
        vehicle: {
          include: {
            category: true,
          },
        },
      },
    });
    
    if (!booking) return null;
    
    // Transform customer data to match expected interface
    return {
      ...booking,
      customer: {
        ...booking.customer,
        dob: booking.customer.dateOfBirth,
      },
    };
  } catch (error) {
    console.error('Error fetching booking:', error);
    return null;
  }
}

interface BookingConfirmationPageProps {
  searchParams: {
    bookingId?: string;
    orderId?: string;
    [key: string]: string | string[] | undefined;
  };
}

export default async function BookingConfirmationPage({
  searchParams,
}: BookingConfirmationPageProps) {
  const glassmorphismEnabled = await getGlassmorphismSetting();
  
  // Check if this is a JCC redirect (has orderId parameter)
  const isJCCRedirect = searchParams.orderId && searchParams.bookingId;
  
  if (isJCCRedirect) {
    console.log('🔄 JCC redirect detected, verifying payment first...');
    
    // Verify payment from JCC redirect
    const paymentVerified = await verifyPaymentAndUpdateBooking(
      searchParams.bookingId!,
      searchParams.orderId!
    );
    
    if (!paymentVerified) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-900 mb-4">Payment Verification Failed</h1>
            <p className="text-red-600 mb-6">There was an issue verifying your payment. Please contact support.</p>
            <a
              href="/en/contact"
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      );
    }
  }
  
  const booking = searchParams.bookingId ? await getBookingDetails(searchParams.bookingId) : null;

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h1>
          <p className="text-gray-600 mb-6">The booking you're looking for could not be found.</p>
          <a
            href="/en"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Homepage
          </a>
        </div>
      </div>
    );
  }

  return (
    <BookingConfirmationClient
      glassmorphismEnabled={glassmorphismEnabled}
      booking={booking}
    />
  );
} 
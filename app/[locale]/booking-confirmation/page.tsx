import React from 'react';
import { prisma } from '@/lib/prisma';
import BookingConfirmationClient from './BookingConfirmationClient';
import { verifyJCCPayment } from '@/lib/jcc-payment';

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
    await prisma.booking.update({
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
            href="/en/search"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Make a New Booking
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
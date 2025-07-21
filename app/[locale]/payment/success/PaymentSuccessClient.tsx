'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from 'lucide-react';

interface PaymentSuccessClientProps {
  bookingId?: string;
  orderId?: string;
}

interface BookingDetails {
  id: string;
  invoiceNo: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalPrice: number;
  startDate: string;
  endDate: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
  };
  vehicle: {
    name: string;
  };
}

export default function PaymentSuccessClient({ bookingId, orderId }: PaymentSuccessClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'pending' | 'failed'>('pending');
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [error, setError] = useState<string>('');
  const [redirected, setRedirected] = useState(false);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!bookingId || !orderId) {
      setError('Missing payment information');
      setLoading(false);
      return;
    }

    verifyPayment();
  }, [bookingId, orderId]);

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  const verifyPayment = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          orderId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setBooking(data.booking);
        
        // Determine payment status based on JCC response
        // Handle both string and number values from JCC
        const jccStatusString = String(data.jccStatus);
        switch (jccStatusString) {
          case '2': // Paid
          case '1': // Pre-authorized (treat as success)
            setPaymentStatus('success');
            // Redirect to booking confirmation page for successful payments (prevent duplicate redirects)
            if (!redirected) {
              setRedirected(true);
              console.log('🔄 Setting up redirect to booking confirmation page in 2 seconds...');
              
              // Clear any existing timeout
              if (redirectTimeoutRef.current) {
                clearTimeout(redirectTimeoutRef.current);
              }
              
              // Set up new timeout
              redirectTimeoutRef.current = setTimeout(() => {
                console.log('🔄 Redirecting to booking confirmation page...');
                router.push(`/en/booking-confirmation?bookingId=${bookingId}`);
              }, 2000); // Show success message for 2 seconds then redirect
            } else {
              console.log('🔄 Redirect already set up, skipping duplicate redirect');
            }
            break;
          case '0': // Not paid
          default: // Any other status
            setPaymentStatus('failed');
            break;
        }
      } else {
        setError(data.error || 'Failed to verify payment');
        setPaymentStatus('failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setError('Network error during payment verification');
      setPaymentStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'success':
        return <CheckCircleIcon className="w-16 h-16 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="w-16 h-16 text-red-500" />;
      default:
        return <ClockIcon className="w-16 h-16 text-yellow-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'success':
        return {
          title: 'Payment Successful!',
          message: 'Your booking has been confirmed and payment processed successfully.',
          color: 'text-green-700',
        };
      case 'failed':
        return {
          title: 'Payment Failed',
          message: 'There was an issue processing your payment. Please try again or contact support.',
          color: 'text-red-700',
        };
      default:
        return {
          title: 'Payment Pending',
          message: 'Your payment is being processed. Please wait while we verify the transaction.',
          color: 'text-yellow-700',
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Status Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              {getStatusIcon()}
            </div>
            <h1 className={`text-3xl font-bold mb-2 ${statusInfo.color}`}>
              {statusInfo.title}
            </h1>
            <p className="text-gray-600 text-lg">
              {statusInfo.message}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Booking Details */}
          {booking && (
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Order Number</label>
                    <p className="text-lg font-semibold text-gray-900">#{booking.invoiceNo}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Customer</label>
                    <p className="text-lg text-gray-900">
                      {booking.customer.firstName} {booking.customer.lastName}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-lg text-gray-900">{booking.customer.email}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Vehicle</label>
                    <p className="text-lg text-gray-900">{booking.vehicle.name}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Booking Status</label>
                    <p className="text-lg text-gray-900">{booking.status}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Payment Status</label>
                    <p className="text-lg text-gray-900">{booking.paymentStatus}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Rental Period</label>
                    <p className="text-lg text-gray-900">
                      {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Total Amount</label>
                    <p className="text-2xl font-bold text-gray-900">€{booking.totalPrice.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
            {paymentStatus === 'success' && (
              <>
                <button
                  onClick={() => {
                    // Check if user is authenticated
                    const customerData = localStorage.getItem('customer');
                    if (customerData) {
                      // User is logged in - go to dashboard
                      router.push('/en/dashboard');
                    } else {
                      // Guest user - ensure we have booking data for lookup
                      if (booking && booking.invoiceNo && booking.customer.email) {
                        // Store booking info for guest lookup
                        localStorage.setItem('guestBooking', JSON.stringify({
                          invoiceNo: booking.invoiceNo,
                          orderNumber: booking.orderNumber,
                          email: booking.customer.email,
                          bookingId: booking.id,
                        }));
                        // Redirect to guest booking lookup page
                        router.push(`/en/booking-lookup?invoice=${booking.invoiceNo}&email=${encodeURIComponent(booking.customer.email)}`);
                      } else {
                        // If we don't have booking data, show a user-friendly message
                        alert('Your booking details are being processed. You can look up your booking using your invoice number and email on our booking lookup page.');
                        router.push('/en/booking-lookup');
                      }
                    }
                  }}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  View My Bookings
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Print Confirmation
                </button>
              </>
            )}
            
            {paymentStatus === 'failed' && (
              <>
                <button
                  onClick={() => router.push('/en/review-and-pay')}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => router.push('/en/contact')}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Contact Support
                </button>
              </>
            )}
            
            {paymentStatus === 'pending' && (
              <button
                onClick={verifyPayment}
                className="flex-1 bg-yellow-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
              >
                Check Payment Status
              </button>
            )}
            
            <button
              onClick={() => router.push('/en')}
              className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Return to Homepage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
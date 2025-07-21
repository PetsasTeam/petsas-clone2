'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { XCircleIcon, CreditCardIcon, PhoneIcon } from 'lucide-react';

export default function PaymentFailurePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const orderId = searchParams.get('orderId');
  const [statusUpdated, setStatusUpdated] = useState(false);

  useEffect(() => {
    // Update booking status to Failed when payment fails
    if (bookingId && orderId && !statusUpdated) {
      updateBookingStatus();
    }
  }, [bookingId, orderId, statusUpdated]);

  const updateBookingStatus = async () => {
    try {
      if (orderId) {
        // Try to verify payment with JCC first
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
        console.log('Payment verification response:', data);
      } else {
        // If no orderId, directly update booking status to Failed
        const response = await fetch('/api/payment/update-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookingId,
            status: 'Failed',
            paymentStatus: 'Failed',
          }),
        });

        const data = await response.json();
        console.log('Direct status update response:', data);
      }
      setStatusUpdated(true);
    } catch (error) {
      console.error('Error updating booking status:', error);
      setStatusUpdated(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Status Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <XCircleIcon className="w-16 h-16 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold mb-2 text-red-700">
              Payment Failed
            </h1>
            <p className="text-gray-600 text-lg">
              We were unable to process your payment. Your booking has not been confirmed.
            </p>
          </div>

          {/* Common Reasons */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Common reasons for payment failure:</h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Insufficient funds in your account
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Incorrect card details (number, expiry date, or CVV)
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Card declined by your bank
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Payment limit exceeded
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Card not authorized for online transactions
              </li>
            </ul>
          </div>

          {/* What to do next */}
          <div className="border-t border-gray-200 pt-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What would you like to do?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                <CreditCardIcon className="w-8 h-8 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Try Different Payment Method</h3>
                <p className="text-gray-600 mb-4">
                  Use a different credit card or payment method to complete your booking.
                </p>
                <button
                  onClick={() => {
                    if (bookingId) {
                      // Redirect back to payment with the same booking
                      router.push(`/en/review-and-pay?bookingId=${bookingId}&retry=true`);
                    } else {
                      // Redirect to general payment page
                      router.push('/en/review-and-pay');
                    }
                  }}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Try Different Card
                </button>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 hover:border-green-300 transition-colors">
                <PhoneIcon className="w-8 h-8 text-green-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact Support</h3>
                <p className="text-gray-600 mb-4">
                  Our support team can help you complete your booking over the phone.
                </p>
                <button
                  onClick={() => router.push('/en/contact')}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Contact Support
                </button>
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={() => router.push('/en/search')}
              className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Start New Search
            </button>
            
            <button
              onClick={() => router.push('/en')}
              className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Return to Homepage
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Need immediate assistance?</strong> Call us at{' '}
              <a href="tel:+35724633344" className="font-semibold underline">
                +357 24 633 344
              </a>{' '}
              and our team will help you complete your booking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 
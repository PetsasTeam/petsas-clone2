'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircleIcon, ClockIcon, CreditCardIcon, CalendarIcon, CarIcon } from 'lucide-react';

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
    phone: string;
  };
  vehicle: {
    name: string;
    code: string;
  };
}

export default function BookingLookupClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [invoiceNo, setInvoiceNo] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if we have guest booking data from localStorage
    const guestBookingData = localStorage.getItem('guestBooking');
    if (guestBookingData) {
      try {
        const guestBooking = JSON.parse(guestBookingData);
        setInvoiceNo(guestBooking.invoiceNo || '');
        setEmail(guestBooking.email || '');
        
        // Auto-lookup if we have the data
        if (guestBooking.invoiceNo && guestBooking.email) {
          lookupBooking(guestBooking.invoiceNo, guestBooking.email);
        }
      } catch (error) {
        console.error('Error parsing guest booking data:', error);
      }
    }

    // Check URL parameters
    const urlInvoice = searchParams.get('invoice');
    const urlEmail = searchParams.get('email');
    if (urlInvoice) {
      setInvoiceNo(urlInvoice);
    }
    if (urlEmail) {
      setEmail(decodeURIComponent(urlEmail));
    }
    
    // Auto-lookup if we have both parameters from URL
    if (urlInvoice && urlEmail && !guestBookingData) {
      lookupBooking(urlInvoice, decodeURIComponent(urlEmail));
    }
  }, [searchParams]);

  const lookupBooking = async (invoice: string, emailAddress: string) => {
    if (!invoice || !emailAddress) {
      setError('Please provide both invoice number and email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/booking-lookup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceNo: invoice,
          email: emailAddress,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setBooking(data.booking);
        // Clear the guest booking data since we found it
        localStorage.removeItem('guestBooking');
      } else {
        setError(data.message || 'Booking not found');
      }
    } catch (error) {
      console.error('Booking lookup error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    lookupBooking(invoiceNo, email);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (booking) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <CheckCircleIcon className="w-16 h-16 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Booking Found!
            </h1>
            <p className="text-gray-600">
              Here are your booking details
            </p>
          </div>

          {/* Booking Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CreditCardIcon className="w-5 h-5 mr-2" />
                  Payment Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">Order Number:</span>
                    <p className="font-semibold text-gray-900">{booking.invoiceNo}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Booking Reference:</span>
                    <p className="font-semibold text-gray-900">{booking.orderNumber}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Payment Status:</span>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getPaymentStatusColor(booking.paymentStatus)}`}>
                      {booking.paymentStatus}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Total Amount:</span>
                    <p className="text-2xl font-bold text-gray-900">€{booking.totalPrice.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  Booking Status
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Rental Period:</span>
                    <p className="font-semibold text-gray-900">
                      {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CarIcon className="w-5 h-5 mr-2" />
                  Vehicle Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">Vehicle:</span>
                    <p className="font-semibold text-gray-900">{booking.vehicle.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Code:</span>
                    <p className="font-semibold text-gray-900">{booking.vehicle.code}</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Customer Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">Name:</span>
                    <p className="font-semibold text-gray-900">
                      {booking.customer.firstName} {booking.customer.lastName}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Email:</span>
                    <p className="font-semibold text-gray-900">{booking.customer.email}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Phone:</span>
                    <p className="font-semibold text-gray-900">{booking.customer.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => window.print()}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Print Details
            </button>
            <button
              onClick={() => router.push('/en/contact')}
              className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Contact Support
            </button>
            <button
              onClick={() => router.push('/en')}
              className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Return to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Find Your Booking
        </h2>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="invoiceNo" className="block text-sm font-medium text-gray-700 mb-2">
              Order Number
            </label>
            <input
              type="text"
              id="invoiceNo"
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
              placeholder="P000001"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
          >
            {loading ? 'Searching...' : 'Find My Booking'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Have an account?
          </p>
          <button
            onClick={() => router.push('/en/login')}
            className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
          >
            Sign in to view all your bookings
          </button>
        </div>
      </div>
    </div>
  );
} 
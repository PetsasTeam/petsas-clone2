'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import GlassmorphismControl from '../../components/GlassmorphismControl';
import { CheckCircle, MapPin, Calendar, Clock, User, Car, CreditCard, Phone, Mail, Home } from 'lucide-react';

interface BookingConfirmationClientProps {
  glassmorphismEnabled: boolean;
  booking: {
    id: string;
    orderNumber: string | null;
    invoiceNo: string | null;
    status: string;
    paymentStatus: string;
    paymentType: string;
    totalPrice: number;
    startDate: Date;
    endDate: Date;
    createdAt: Date;
    customer: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string | null;
      dob: Date | null;
      address: string | null;
    };
    vehicle: {
      name: string;
      image: string | null;
      code: string | null;
      group: string;
      category: {
        name: string;
      };
    };
  };
}

export default function BookingConfirmationClient({
  glassmorphismEnabled,
  booking,
}: BookingConfirmationClientProps) {
  const router = useRouter();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDays = () => {
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const days = calculateDays();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <GlassmorphismControl enabled={glassmorphismEnabled} />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-lg text-gray-600">
            Your reservation has been successfully created
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="glass-card p-8 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Booking Reference */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">Booking Reference</h3>
              <p className="text-2xl font-bold text-green-900">
                {booking.orderNumber || booking.invoiceNo || 'N/A'}
              </p>
              <p className="text-sm text-green-700 mt-1">
                Please keep this reference number for your records
              </p>
            </div>

            {/* Payment Status */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Payment Status</h3>
              <p className="text-xl font-bold text-blue-900">{booking.paymentStatus}</p>
              <p className="text-sm text-blue-700 mt-1">
                {booking.paymentType === 'On Arrival' 
                  ? 'Payment will be collected upon vehicle pickup'
                  : 'Payment has been processed successfully'
                }
              </p>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="border-b border-gray-200 pb-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Car className="w-5 h-5 mr-2 text-blue-600" />
              Vehicle Details
            </h3>
            <div className="flex items-center space-x-4">
              <Image
                src={booking.vehicle.image || '/vehicles/vehicle-placeholder.jpg'}
                alt={booking.vehicle.name}
                width={200}
                height={150}
                className="object-contain bg-gray-50 rounded-lg"
              />
              <div>
                <h4 className="text-lg font-bold text-gray-900">{booking.vehicle.name}</h4>
                <p className="text-gray-600">or similar</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                    Group {booking.vehicle.group}
                  </span>
                  {booking.vehicle.code && (
                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                      Code: {booking.vehicle.code}
                    </span>
                  )}
                  <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded">
                    {booking.vehicle.category.name}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Rental Period */}
          <div className="border-b border-gray-200 pb-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Rental Period
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Pick-up</p>
                  <p className="text-gray-600">Larnaca Airport</p>
                  <p className="text-gray-600">{formatDate(booking.startDate)}</p>
                  <p className="text-gray-600 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    09:00
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Drop-off</p>
                  <p className="text-gray-600">Larnaca Airport</p>
                  <p className="text-gray-600">{formatDate(booking.endDate)}</p>
                  <p className="text-gray-600 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    09:00
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Total rental period: <span className="font-semibold">{days} day{days > 1 ? 's' : ''}</span>
              </p>
            </div>
          </div>

          {/* Customer Information */}
          <div className="border-b border-gray-200 pb-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Full Name</p>
                <p className="font-semibold text-gray-900">
                  {booking.customer.firstName} {booking.customer.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="font-semibold text-gray-900 flex items-center">
                  <Mail className="w-4 h-4 mr-1 text-blue-600" />
                  {booking.customer.email}
                </p>
              </div>
              {booking.customer.phone && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Phone</p>
                  <p className="font-semibold text-gray-900 flex items-center">
                    <Phone className="w-4 h-4 mr-1 text-blue-600" />
                    {booking.customer.phone}
                  </p>
                </div>
              )}
              {booking.customer.address && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Address</p>
                  <p className="font-semibold text-gray-900 flex items-center">
                    <Home className="w-4 h-4 mr-1 text-blue-600" />
                    {booking.customer.address}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Information */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
              Pricing Information
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                <span className="text-2xl font-bold text-green-600">€{booking.totalPrice.toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {booking.paymentType === 'On Arrival' 
                  ? 'Amount to be paid upon vehicle pickup'
                  : 'Amount has been charged to your payment method'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Important Information */}
        <div className="glass-card p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Important Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What to Bring</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Valid driving license</li>
                <li>• Passport or ID card</li>
                <li>• Credit card (for security deposit)</li>
                <li>• Booking confirmation (this page)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Pickup Instructions</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Arrive 15 minutes before pickup time</li>
                <li>• Follow airport car rental signs</li>
                <li>• Look for Petsas Car Rental desk</li>
                <li>• Present your booking reference</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button
            onClick={() => {
              // Check if user is authenticated
              const customerData = localStorage.getItem('customer');
              if (customerData) {
                // User is logged in - go to dashboard
                router.push('/en/dashboard');
              } else {
                // Guest user - redirect to booking lookup with current booking info
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
                  // Fallback to booking lookup page
                  router.push('/en/booking-lookup');
                }
              }
            }}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            View My Bookings
          </button>
          <button
            onClick={() => router.push('/en')}
            className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
          >
            Make Another Booking
          </button>
          <button
            onClick={() => window.print()}
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            Print Confirmation
          </button>
        </div>
      </div>

      <style jsx>{`
        .glass-card {
          background: var(--glass-bg-main, rgba(255, 255, 255, 0.9)) !important;
          backdrop-filter: blur(20px) !important;
          -webkit-backdrop-filter: blur(20px) !important;
          border-radius: 16px;
          box-shadow: 
            0 15px 35px -10px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(255, 255, 255, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        @media print {
          .glass-card {
            background: white !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
          }
        }
      `}</style>
    </div>
  );
} 
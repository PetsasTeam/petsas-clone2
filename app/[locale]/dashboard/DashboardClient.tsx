'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import GlassmorphismControl from '../../components/GlassmorphismControl';
import { Calendar, Car, CreditCard, User, LogOut, MapPin, Clock } from 'lucide-react';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  address?: string;
  createdAt: string;
}

interface Booking {
  id: string;
  invoiceNo: string;
  status: string;
  paymentStatus: string;
  paymentType: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  createdAt: string;
  vehicle: {
    id: string;
    name: string;
    code: string;
    image: string;
    category: string;
    seats: number;
    doors: number;
    transmission: string;
  };
}

interface DashboardClientProps {
  glassmorphismEnabled: boolean;
}

export default function DashboardClient({ glassmorphismEnabled }: DashboardClientProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const customerData = localStorage.getItem('customer');
    if (!customerData) {
      router.push('/en/login?returnUrl=/en/dashboard');
      return;
    }

    try {
      const parsedCustomer = JSON.parse(customerData);
      setCustomer(parsedCustomer);
      fetchBookings(parsedCustomer.id);
    } catch (error) {
      console.error('Error parsing customer data:', error);
      router.push('/en/login');
    }
  }, [router]);

  const fetchBookings = async (customerId: string) => {
    try {
      const response = await fetch(`/api/customer/bookings?customerId=${customerId}`);
      const data = await response.json();

      if (data.success) {
        setBookings(data.bookings);
      } else {
        setError(data.message || 'Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('customer');
    localStorage.removeItem('latestBooking');
    router.push('/en');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'pay on arrival':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <GlassmorphismControl enabled={glassmorphismEnabled} />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/en" className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={120}
                  height={40}
                  className="h-10 w-auto"
                />
              </Link>
              <div className="hidden md:block h-6 w-px bg-gray-300"></div>
              <h1 className="hidden md:block text-xl font-semibold text-gray-900">
                Customer Dashboard
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Customer Profile Sidebar */}
          <div className="lg:col-span-1">
            <div className={`${glassmorphismEnabled ? 'glass-card' : 'bg-white'} rounded-xl shadow-lg p-6`}>
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {customer.firstName} {customer.lastName}
                </h2>
                <p className="text-gray-600">{customer.email}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    Member since {formatDate(customer.createdAt)}
                  </span>
                </div>
                {customer.phone && (
                  <div className="flex items-center space-x-3 text-sm">
                    <span className="w-4 h-4 text-gray-400">📞</span>
                    <span className="text-gray-600">{customer.phone}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-center space-x-3 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{customer.address}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{bookings.length}</div>
                  <div className="text-sm text-gray-600">Total Bookings</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bookings List */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Bookings</h2>
              <p className="text-gray-600">View your rental history and booking details</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {bookings.length === 0 ? (
              <div className={`${glassmorphismEnabled ? 'glass-card' : 'bg-white'} rounded-xl shadow-lg p-8 text-center`}>
                <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
                <p className="text-gray-600 mb-6">Start your car rental journey with us!</p>
                <Link
                  href="/en"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Vehicles
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className={`${glassmorphismEnabled ? 'glass-card' : 'bg-white'} rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 mb-4 lg:mb-0">
                        {/* Vehicle Image */}
                        <div className="flex-shrink-0">
                          <Image
                            src={booking.vehicle.image}
                            alt={booking.vehicle.name}
                            width={120}
                            height={80}
                            className="rounded-lg object-cover"
                          />
                        </div>

                        {/* Booking Details */}
                        <div className="flex-grow">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {booking.vehicle.name}
                            </h3>
                            <span className="text-sm text-gray-500">
                              ({booking.vehicle.code})
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <strong>Pickup:</strong> {formatDate(booking.startDate)}
                            </div>
                            <div>
                              <strong>Return:</strong> {formatDate(booking.endDate)}
                            </div>
                            <div>
                              <strong>Category:</strong> {booking.vehicle.category}
                            </div>
                            <div>
                              <strong>Transmission:</strong> {booking.vehicle.transmission}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Booking Summary */}
                      <div className="flex-shrink-0 text-right">
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          €{booking.totalPrice.toFixed(2)}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium mb-2 ${getPaymentStatusColor(booking.paymentStatus)}`}>
                          {booking.paymentStatus}
                        </div>
                        <div className="text-xs text-gray-500">
                          Invoice #{booking.invoiceNo}
                        </div>
                        <div className="text-xs text-gray-500">
                          Booked {formatDateTime(booking.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }
      `}</style>
    </div>
  );
} 
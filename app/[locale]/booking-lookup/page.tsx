import { Suspense } from 'react';
import BookingLookupClient from './BookingLookupClient';

export default function BookingLookupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            View Your Booking
          </h1>
          <p className="text-gray-600">
            Look up your booking details using your invoice number and email
          </p>
        </div>
        
        <Suspense fallback={<div>Loading...</div>}>
          <BookingLookupClient />
        </Suspense>
      </div>
    </div>
  );
} 
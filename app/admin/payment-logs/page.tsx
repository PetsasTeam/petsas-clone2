import { Suspense } from 'react';
import PaymentLogsClient from './PaymentLogsClient';

export default function PaymentLogsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Logs</h1>
        <p className="text-gray-600">
          Monitor all payment attempts, successes, and failures with detailed JCC response data.
        </p>
      </div>

      <Suspense fallback={<div className="animate-pulse">Loading payment logs...</div>}>
        <PaymentLogsClient />
      </Suspense>
    </div>
  );
} 
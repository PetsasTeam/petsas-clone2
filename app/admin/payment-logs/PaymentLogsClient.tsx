'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface PaymentLog {
  id: string;
  createdAt: string;
  bookingId?: string;
  orderId?: string;
  orderNumber?: string;
  amount: number;
  currency: string;
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
  attemptNumber: number;
  processingTime?: number;
  userAgent?: string;
  ipAddress?: string;
  rawJccResponse?: string;
  errorDetails?: string;
  booking?: {
    id: string;
    invoiceNo?: string;
    customer: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

const STATUS_COLORS = {
  success: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800',
};

const PAYMENT_TYPE_LABELS = {
  create_order: 'Order Creation',
  verify_payment: 'Payment Verification',
};

export default function PaymentLogsClient() {
  const [logs, setLogs] = useState<PaymentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLog, setSelectedLog] = useState<PaymentLog | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    paymentType: 'all',
    dateRange: '7d',
  });
  const [stats, setStats] = useState({
    total: 0,
    successful: 0,
    failed: 0,
    successRate: 0,
  });

  useEffect(() => {
    fetchPaymentLogs();
  }, [filters]);

  const fetchPaymentLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.status !== 'all') params.set('status', filters.status);
      if (filters.paymentType !== 'all') params.set('paymentType', filters.paymentType);
      if (filters.dateRange !== 'all') params.set('dateRange', filters.dateRange);
      
      const response = await fetch(`/api/admin/payment-logs?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment logs');
      }
      
      const data = await response.json();
      setLogs(data.logs);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm:ss');
  };

  const getStatusBadge = (status: string) => {
    const colorClass = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800';
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Attempts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Successful</p>
              <p className="text-2xl font-bold text-green-600">{stats.successful}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-blue-600">{stats.successRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500"
            >
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Type
            </label>
            <select
              value={filters.paymentType}
              onChange={(e) => setFilters({ ...filters, paymentType: e.target.value })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500"
            >
              <option value="all">All Types</option>
              <option value="create_order">Order Creation</option>
              <option value="verify_payment">Payment Verification</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500"
            >
              <option value="1d">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment Logs Table */}
      <div className="bg-white shadow border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Payment Logs</h3>
        </div>
        
        {logs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No payment logs found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date/Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    JCC Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Processing Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {log.customerFirstName && log.customerLastName 
                          ? `${log.customerFirstName} ${log.customerLastName}`
                          : log.booking?.customer.firstName && log.booking?.customer.lastName
                          ? `${log.booking.customer.firstName} ${log.booking.customer.lastName}`
                          : 'Unknown'
                        }
                      </div>
                      <div className="text-sm text-gray-500">
                        {log.customerEmail || log.booking?.customer.email || 'No email'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(log.amount, log.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {PAYMENT_TYPE_LABELS[log.paymentType as keyof typeof PAYMENT_TYPE_LABELS] || log.paymentType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(log.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.jccStatus || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.processingTime ? `${log.processingTime}ms` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-green-600 hover:text-green-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Payment Log Details</h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Basic Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">ID:</span> {selectedLog.id}</div>
                      <div><span className="font-medium">Date:</span> {formatDate(selectedLog.createdAt)}</div>
                      <div><span className="font-medium">Booking ID:</span> {selectedLog.bookingId || 'N/A'}</div>
                      <div><span className="font-medium">Order Number:</span> {selectedLog.orderNumber || 'N/A'}</div>
                      <div><span className="font-medium">Amount:</span> {formatCurrency(selectedLog.amount, selectedLog.currency)}</div>
                      <div><span className="font-medium">Payment Type:</span> {PAYMENT_TYPE_LABELS[selectedLog.paymentType as keyof typeof PAYMENT_TYPE_LABELS] || selectedLog.paymentType}</div>
                      <div><span className="font-medium">Status:</span> {getStatusBadge(selectedLog.status)}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Customer Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Name:</span> {selectedLog.customerFirstName} {selectedLog.customerLastName}</div>
                      <div><span className="font-medium">Email:</span> {selectedLog.customerEmail || 'N/A'}</div>
                      <div><span className="font-medium">Phone:</span> {selectedLog.customerPhone || 'N/A'}</div>
                      <div><span className="font-medium">IP Address:</span> {selectedLog.ipAddress || 'N/A'}</div>
                      <div><span className="font-medium">User Agent:</span> {selectedLog.userAgent ? selectedLog.userAgent.substring(0, 50) + '...' : 'N/A'}</div>
                    </div>
                  </div>
                </div>

                {/* JCC Information */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">JCC Payment Gateway Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div><span className="font-medium">JCC Order ID:</span> {selectedLog.jccOrderId || 'N/A'}</div>
                      <div><span className="font-medium">JCC Status:</span> {selectedLog.jccStatus || 'N/A'}</div>
                      <div><span className="font-medium">Processing Time:</span> {selectedLog.processingTime ? `${selectedLog.processingTime}ms` : 'N/A'}</div>
                    </div>
                    <div>
                      <div><span className="font-medium">JCC Error Code:</span> {selectedLog.jccErrorCode || 'N/A'}</div>
                      <div><span className="font-medium">JCC Error Message:</span> {selectedLog.jccErrorMessage || 'N/A'}</div>
                      <div><span className="font-medium">Form URL:</span> {selectedLog.jccFormUrl ? 'Available' : 'N/A'}</div>
                    </div>
                  </div>
                </div>

                {/* Error Details */}
                {selectedLog.errorDetails && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Error Details</h4>
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-sm text-red-700">{selectedLog.errorDetails}</p>
                    </div>
                  </div>
                )}

                {/* Raw JCC Response */}
                {selectedLog.rawJccResponse && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Raw JCC Response</h4>
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto">
                        {JSON.stringify(JSON.parse(selectedLog.rawJccResponse), null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
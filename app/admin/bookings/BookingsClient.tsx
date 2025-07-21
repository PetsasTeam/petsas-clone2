'use client';

import React, { useState, useEffect } from 'react';
import { FaPrint, FaEye, FaTrash, FaSearch, FaFilter, FaDownload, FaEdit, FaPhone, FaEnvelope, FaCalendarAlt } from 'react-icons/fa';
import { deleteBooking } from '../setup/vehicle-categories/actions';

// Enhanced booking type with full customer data
type BookingWithCustomer = {
  id: string;
  invoiceNo: string | null;
  orderNumber: string | null;
  transactionId: string | null;
  createdAt: Date;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  paymentType: string;
  paymentStatus: string;
  status: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string | null;
    verified: boolean;
    createdAt: Date;
  };
  vehicle: {
    id: string;
    name: string;
    code: string;
    category: {
      name: string;
    };
  };
};

interface BookingsClientProps {
  bookings: BookingWithCustomer[];
}

const BookingsClient: React.FC<BookingsClientProps> = ({ bookings: initialBookings }) => {
  const [bookings, setBookings] = useState(initialBookings);
  const [filteredBookings, setFilteredBookings] = useState(initialBookings);
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    processStatus: '',
    paymentStatus: '',
    paymentType: '',
    dateFrom: '',
    dateTo: '',
    invoiceNo: '',
    customerEmail: '',
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    applyFilters();
  }, [filters, bookings]);

  const applyFilters = () => {
    let filtered = [...bookings];

    // Search filter (searches across multiple fields)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(booking =>
        booking.customer.firstName.toLowerCase().includes(searchTerm) ||
        booking.customer.lastName.toLowerCase().includes(searchTerm) ||
        booking.customer.email.toLowerCase().includes(searchTerm) ||
        booking.vehicle.name.toLowerCase().includes(searchTerm) ||
        booking.vehicle.code.toLowerCase().includes(searchTerm) ||
        booking.invoiceNo?.toLowerCase().includes(searchTerm) ||
        booking.orderNumber?.toLowerCase().includes(searchTerm) ||
        booking.id.toLowerCase().includes(searchTerm)
      );
    }

    // Status filters
    if (filters.processStatus) {
      filtered = filtered.filter(booking => booking.status === filters.processStatus);
    }

    if (filters.paymentStatus) {
      filtered = filtered.filter(booking => booking.paymentStatus === filters.paymentStatus);
    }

    if (filters.paymentType) {
      filtered = filtered.filter(booking => booking.paymentType === filters.paymentType);
    }

    // Date filters
    if (filters.dateFrom) {
      filtered = filtered.filter(booking => 
        new Date(booking.createdAt) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(booking => 
        new Date(booking.createdAt) <= new Date(filters.dateTo)
      );
    }

    // Invoice number filter
    if (filters.invoiceNo) {
      filtered = filtered.filter(booking => 
        booking.invoiceNo?.toLowerCase().includes(filters.invoiceNo.toLowerCase())
      );
    }

    // Customer email filter
    if (filters.customerEmail) {
      filtered = filtered.filter(booking => 
        booking.customer.email.toLowerCase().includes(filters.customerEmail.toLowerCase())
      );
    }

    setFilteredBookings(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      processStatus: '',
      paymentStatus: '',
      paymentType: '',
      dateFrom: '',
      dateTo: '',
      invoiceNo: '',
      customerEmail: '',
    });
  };

  const handleSelectBooking = (bookingId: string) => {
    setSelectedBookings(prev => 
      prev.includes(bookingId) 
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  const handleSelectAll = () => {
    if (selectedBookings.length === paginatedBookings.length) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(paginatedBookings.map(booking => booking.id));
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        const response = await fetch(`/api/admin/bookings/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setBookings(prev => prev.filter(booking => booking.id !== id));
          setSelectedBookings(prev => prev.filter(bookingId => bookingId !== id));
        } else {
          alert('Failed to delete booking');
        }
      } catch (error) {
        alert('Error deleting booking');
      }
    }
  };

  const handleView = (bookingId: string) => {
    // Toggle expanded row to show/hide details
    setExpandedRow(expandedRow === bookingId ? null : bookingId);
  };

  const handleEdit = (bookingId: string) => {
    // Navigate to edit page (to be implemented)
    alert(`Edit functionality for booking ${bookingId} will be implemented soon.`);
  };

  const handlePrint = (booking: BookingWithCustomer) => {
    // Generate print view
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Booking Details - ${booking.invoiceNo || booking.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          .section { margin-bottom: 20px; }
          .label { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Petsas Car Rentals - Booking Details</h1>
        </div>
        <div class="section">
          <p><span class="label">Booking ID:</span> ${booking.id}</p>
          <p><span class="label">Invoice No:</span> ${booking.invoiceNo || 'N/A'}</p>
          <p><span class="label">Order No:</span> ${booking.orderNumber || 'N/A'}</p>
          <p><span class="label">Transaction ID:</span> ${booking.transactionId || 'N/A'}</p>
          <p><span class="label">Status:</span> ${booking.status}</p>
          <p><span class="label">Payment Status:</span> ${booking.paymentStatus}</p>
          <p><span class="label">Payment Type:</span> ${booking.paymentType}</p>
        </div>
        <div class="section">
          <h3>Customer Information</h3>
          <p><span class="label">Name:</span> ${booking.customer.firstName} ${booking.customer.lastName}</p>
          <p><span class="label">Email:</span> ${booking.customer.email}</p>
          <p><span class="label">Phone:</span> ${booking.customer.phone}</p>
          <p><span class="label">Address:</span> ${booking.customer.address || 'Not provided'}</p>
        </div>
        <div class="section">
          <h3>Vehicle & Booking Details</h3>
          <p><span class="label">Vehicle:</span> ${booking.vehicle.name}</p>
          <p><span class="label">Code:</span> ${booking.vehicle.code}</p>
          <p><span class="label">Category:</span> ${booking.vehicle.category.name}</p>
          <p><span class="label">Rental Period:</span> ${formatDate(booking.startDate)} to ${formatDate(booking.endDate)}</p>
          <p><span class="label">Total Price:</span> €${booking.totalPrice.toFixed(2)}</p>
          <p><span class="label">Created:</span> ${formatDateTime(booking.createdAt)}</p>
        </div>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleBulkDelete = async () => {
    if (selectedBookings.length === 0) {
      alert('Please select bookings to delete');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedBookings.length} booking(s)?`)) {
      try {
        const response = await fetch('/api/admin/bookings/bulk-delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ bookingIds: selectedBookings }),
        });

        if (response.ok) {
          setBookings(prev => prev.filter(booking => !selectedBookings.includes(booking.id)));
          setSelectedBookings([]);
        } else {
          alert('Failed to delete bookings');
        }
      } catch (error) {
        alert('Error deleting bookings');
      }
    }
  };

  const getStatusColor = (status: string, type: 'payment' | 'process') => {
    if (type === 'payment') {
      switch (status.toLowerCase()) {
        case 'paid': return 'bg-green-100 text-green-800';
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'pay on arrival': return 'bg-blue-100 text-blue-800';
        case 'failed': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    } else {
      switch (status.toLowerCase()) {
        case 'confirmed': return 'bg-green-100 text-green-800';
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'cancelled': return 'bg-red-100 text-red-800';
        case 'completed': return 'bg-blue-100 text-blue-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedBookings = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Statistics
  const stats = {
    total: filteredBookings.length,
    confirmed: filteredBookings.filter(b => b.status === 'Confirmed').length,
    pending: filteredBookings.filter(b => b.status === 'Pending').length,
    paid: filteredBookings.filter(b => b.paymentStatus === 'Paid').length,
    totalRevenue: filteredBookings.reduce((sum, b) => sum + b.totalPrice, 0),
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Filter Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Search & Filter Bookings</h3>
          <button
            onClick={clearFilters}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            Clear All Filters
          </button>
        </div>

        {/* Main Search */}
        <div className="mb-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by customer name, email, vehicle, booking ID, invoice number, or order number..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Filter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Process Status</label>
            <select
              value={filters.processStatus}
              onChange={(e) => handleFilterChange('processStatus', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
            <select
              value={filters.paymentStatus}
              onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Payments</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Pay on Arrival">Pay on Arrival</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
            <select
              value={filters.paymentType}
              onChange={(e) => handleFilterChange('paymentType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="Online">Online</option>
              <option value="On Arrival">On Arrival</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice No</label>
            <input
              type="text"
              placeholder="Invoice number"
              value={filters.invoiceNo}
              onChange={(e) => handleFilterChange('invoiceNo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Bookings</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
          <div className="text-sm text-gray-600">Confirmed</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-purple-600">{stats.paid}</div>
          <div className="text-sm text-gray-600">Paid</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-indigo-600">€{stats.totalRevenue.toFixed(2)}</div>
          <div className="text-sm text-gray-600">Total Revenue</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <button
            onClick={handleBulkDelete}
            disabled={selectedBookings.length === 0}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaTrash className="h-4 w-4" />
            <span>Delete Selected ({selectedBookings.length})</span>
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
            <FaDownload className="h-4 w-4" />
            <span>Export to CSV</span>
          </button>
        </div>
        <div className="text-sm text-gray-600">
          Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredBookings.length)} of {filteredBookings.length} bookings
        </div>
      </div>

      {/* Enhanced Bookings Table */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-blue-600 text-white">
            <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={selectedBookings.length === paginatedBookings.length && paginatedBookings.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Booking</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Vehicle</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Dates</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Payment</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Transaction ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Total</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
              {paginatedBookings.map((booking, index) => (
                <React.Fragment key={booking.id}>
                  <tr className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedBookings.includes(booking.id)}
                        onChange={() => handleSelectBooking(booking.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-blue-600">
                          <button
                            onClick={() => setExpandedRow(expandedRow === booking.id ? null : booking.id)}
                            className="hover:underline"
                          >
                            #{booking.id.substring(0, 8)}...
                          </button>
                        </div>
                        <div className="text-gray-500">
                          {booking.invoiceNo ? `Invoice: ${booking.invoiceNo}` : 'No invoice'}
                        </div>
                        <div className="text-gray-500">
                          {booking.orderNumber ? `Order: ${booking.orderNumber}` : 'No order'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatDateTime(booking.createdAt)}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {booking.customer.firstName} {booking.customer.lastName}
                        </div>
                        <div className="text-gray-500 flex items-center">
                          <FaEnvelope className="h-3 w-3 mr-1" />
                          {booking.customer.email}
                        </div>
                        <div className="text-gray-500 flex items-center">
                          <FaPhone className="h-3 w-3 mr-1" />
                          {booking.customer.phone}
                        </div>
                        {booking.customer.verified && (
                          <div className="text-xs text-green-600">✓ Verified</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{booking.vehicle.name}</div>
                        <div className="text-gray-500">{booking.vehicle.code}</div>
                        <div className="text-xs text-gray-400">{booking.vehicle.category.name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="flex items-center text-gray-900">
                          <FaCalendarAlt className="h-3 w-3 mr-1" />
                          {formatDate(booking.startDate)}
                        </div>
                        <div className="text-gray-500">to {formatDate(booking.endDate)}</div>
                        <div className="text-xs text-gray-400">
                          {Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                        </div>
                      </div>
                </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          booking.paymentType === 'Online' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                    {booking.paymentType}
                  </span>
                        <div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.paymentStatus, 'payment')}`}>
                    {booking.paymentStatus}
                  </span>
                        </div>
                      </div>
                </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm">
                        {booking.transactionId ? (
                          <div className="font-mono text-gray-900 break-all">
                            {booking.transactionId}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">No transaction</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status, 'process')}`}>
                    {booking.status}
                  </span>
                </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      €{booking.totalPrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center">
                      <div className="flex justify-center space-x-1">
                        <button 
                          onClick={() => handleView(booking.id)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50" 
                          title="View Details"
                        >
                          <FaEye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEdit(booking.id)}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50" 
                          title="Edit"
                        >
                          <FaEdit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handlePrint(booking)}
                          className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50" 
                          title="Print"
                        >
                          <FaPrint className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(booking.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50" 
                          title="Delete"
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expanded Row Details */}
                  {expandedRow === booking.id && (
                    <tr className="bg-gray-50">
                      <td colSpan={9} className="px-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Customer Details</h4>
                            <div className="space-y-1">
                              <div><strong>Customer ID:</strong> {booking.customer.id}</div>
                              <div><strong>Address:</strong> {booking.customer.address || 'Not provided'}</div>
                              <div><strong>Member Since:</strong> {formatDate(booking.customer.createdAt)}</div>
                              <div><strong>Account Status:</strong> {booking.customer.verified ? 'Verified' : 'Unverified'}</div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Booking Details</h4>
                            <div className="space-y-1">
                              <div><strong>Transaction ID:</strong> {booking.transactionId || 'N/A'}</div>
                              <div><strong>Order Number:</strong> {booking.orderNumber || 'N/A'}</div>
                              <div><strong>Rental Period:</strong> {Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24))} days</div>
                              <div><strong>Created:</strong> {formatDateTime(booking.createdAt)}</div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Vehicle Details</h4>
                            <div className="space-y-1">
                              <div><strong>Vehicle ID:</strong> {booking.vehicle.id}</div>
                              <div><strong>Category:</strong> {booking.vehicle.category.name}</div>
                              <div><strong>Code:</strong> {booking.vehicle.code}</div>
                            </div>
                          </div>
                  </div>
                </td>
              </tr>
                  )}
                </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

        {/* Enhanced Pagination */}
        <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                <span className="font-medium">{Math.min(indexOfLastItem, filteredBookings.length)}</span> of{' '}
                <span className="font-medium">{filteredBookings.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                
                {/* Page Numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingsClient; 
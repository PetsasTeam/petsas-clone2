import React from 'react';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaDownload,
  FaCreditCard,
  FaPrint,
  FaCheck,
  FaClock,
  FaExclamationTriangle
} from 'react-icons/fa';

const BookingsPage: React.FC = () => {
  // Mock booking data based on your screenshots
  const bookings = [
    {
      bookingNo: '59613',
      invoiceNo: '14311',
      transactionId: '0ae53d1f-e4e5-7a18-4d21f054a2',
      customer: 'Saeby Mark',
      bookingDate: '20/06/2025',
      paymentType: 'Online',
      paymentStatus: 'Paid',
      processStatus: 'Pending',
      rentalCost: '447.95€',
      actions: ['Print', 'View']
    },
    {
      bookingNo: '59612',
      invoiceNo: '14310',
      transactionId: '0ae594a9-41ea-7f9a-ad93-3a0321f054a2',
      customer: 'Saeby Mark',
      bookingDate: '20/06/2025',
      paymentType: 'Online',
      paymentStatus: 'Paid',
      processStatus: 'Pending',
      rentalCost: '841.50€',
      actions: ['Print', 'View']
    },
    {
      bookingNo: '59611',
      invoiceNo: '14309',
      transactionId: '0ae47f12-0e17-7585-ad35-30b421f054a2',
      customer: 'Safe Andrew',
      bookingDate: '20/06/2025',
      paymentType: 'Online',
      paymentStatus: 'Paid',
      processStatus: 'Completed',
      rentalCost: '550.80€',
      actions: ['Print', 'View']
    },
    {
      bookingNo: '59610',
      invoiceNo: '14308',
      transactionId: '0ae47aa7-e7db-7da0-9944-6b2121f054a2',
      customer: 'Tikkotis Ian',
      bookingDate: '20/06/2025',
      paymentType: 'Online',
      paymentStatus: 'Paid',
      processStatus: 'Completed',
      rentalCost: '1,062.90€',
      actions: ['Print', 'View']
    },
    {
      bookingNo: '59609',
      invoiceNo: '14307',
      transactionId: '0ae47aa7-e855-7bf9-b873-3fc921f054a2',
      customer: 'Beadle Carl',
      bookingDate: '20/06/2025',
      paymentType: 'Online',
      paymentStatus: 'Paid',
      processStatus: 'Completed',
      rentalCost: '1,082.90€',
      actions: ['Print', 'View']
    },
    {
      bookingNo: '59608',
      invoiceNo: '14306',
      transactionId: '0ae445e8-21b6-70a5-8a3a-e47521f054a2',
      customer: 'Gjurdjena Svetlana',
      bookingDate: '20/06/2025',
      paymentType: 'Online',
      paymentStatus: 'Paid',
      processStatus: 'Completed',
      rentalCost: '267.75€',
      actions: ['Print', 'View']
    },
    {
      bookingNo: '59607',
      invoiceNo: '14305',
      transactionId: '0ae42674-8cf9-7ca6-b62d-3b3521f054a2',
      customer: 'Simenas Aleksandr',
      bookingDate: '20/06/2025',
      paymentType: 'Online',
      paymentStatus: 'Paid',
      processStatus: 'Completed',
      rentalCost: '749.70€',
      actions: ['Print', 'View']
    },
    {
      bookingNo: '59606',
      invoiceNo: '14304',
      transactionId: '0ae21a54-e6a0-7b24-d3e0-2de21f054a2',
      customer: 'Mazurczyk Lucas Alexander',
      bookingDate: '19/06/2025',
      paymentType: 'Online',
      paymentStatus: 'Paid',
      processStatus: 'Completed',
      rentalCost: '481.95€',
      actions: ['Print', 'View']
    },
    {
      bookingNo: '59605',
      invoiceNo: '14303',
      transactionId: '0ae22195-8622-7b05-b1a4-9f2921f054a2',
      customer: 'Mazurczyk Lucas Alexander',
      bookingDate: '19/06/2025',
      paymentType: 'Online',
      paymentStatus: 'Proforma',
      processStatus: 'Cancelled',
      rentalCost: '481.95€',
      actions: ['Print', 'View']
    },
    {
      bookingNo: '59604',
      invoiceNo: '',
      transactionId: '',
      customer: 'Vidal Martinez Mikel',
      bookingDate: '19/06/2025',
      paymentType: 'Arrival',
      paymentStatus: 'Proforma',
      processStatus: 'Completed',
      rentalCost: '322.00€',
      actions: ['Print', 'View']
    }
  ];

  const getStatusColor = (status: string, type: 'payment' | 'process') => {
    if (type === 'payment') {
      switch (status) {
        case 'Paid': return 'bg-green-100 text-green-800';
        case 'Proforma': return 'bg-yellow-100 text-yellow-800';
        case 'Pending': return 'bg-orange-100 text-orange-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    } else {
      switch (status) {
        case 'Completed': return 'bg-green-100 text-green-800';
        case 'Pending': return 'bg-yellow-100 text-yellow-800';
        case 'Cancelled': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-600">Manage bookings and track payment transactions</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <FaPlus className="h-4 w-4" />
          <span>New Booking</span>
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Invoices</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Process Status:</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status:</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Payments</option>
              <option value="paid">Paid</option>
              <option value="proforma">Proforma</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Issued Date from:</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">to:</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Number:</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter invoice number"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Customer:</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter customer name"
            />
          </div>
        </div>
        <div className="flex space-x-4">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <FaFilter className="h-4 w-4" />
            <span>Filter</span>
          </button>
          <button className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors">
            Clear
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
          <FaTrash className="h-4 w-4" />
          <span>Delete Selected</span>
        </button>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">Booking No</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Invoice No</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Transaction ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Booking Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Payment Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Payment Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Process Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Rental Cost</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking, index) => (
                <tr key={booking.bookingNo} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                    <a href={`/admin/bookings/${booking.bookingNo}`} className="hover:underline">
                      {booking.bookingNo}
                    </a>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {booking.invoiceNo || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">
                    {booking.transactionId || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {booking.customer}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {booking.bookingDate}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      booking.paymentType === 'Online'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {booking.paymentType}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.paymentStatus, 'payment')}`}>
                      {booking.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.processStatus, 'process')}`}>
                      {booking.processStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {booking.rentalCost}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center">
                    <div className="flex justify-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 px-2 py-1 text-xs bg-blue-50 rounded hover:bg-blue-100">
                        <FaPrint className="h-3 w-3 inline mr-1" />
                        Print
                      </button>
                      <button className="text-green-600 hover:text-green-900 px-2 py-1 text-xs bg-green-50 rounded hover:bg-green-100">
                        <FaEye className="h-3 w-3 inline mr-1" />
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Previous
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
                <span className="font-medium">{bookings.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Previous
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  1
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaCalendarAlt className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaCreditCard className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Online Payments</p>
              <p className="text-2xl font-bold text-gray-900">{bookings.filter(b => b.paymentType === 'Online').length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaCheck className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{bookings.filter(b => b.processStatus === 'Completed').length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaClock className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{bookings.filter(b => b.processStatus === 'Pending').length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingsPage; 
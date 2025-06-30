'use client';

import React from 'react';
import { FaPrint, FaEye, FaTrash } from 'react-icons/fa';
import { deleteBooking } from '../setup/vehicle-categories/actions';

// We need to define the shape of the booking object, including the nested customer
// This should match what the server component fetches and passes as props.
type BookingWithCustomer = {
  id: string;
  invoiceNo: string | null;
  transactionId: string | null;
  createdAt: Date;
  totalPrice: number;
  paymentType: string;
  paymentStatus: string;
  status: string;
  customer: {
    firstName: string;
    lastName: string;
  };
};

interface BookingsClientProps {
  bookings: BookingWithCustomer[];
}

const BookingsClient: React.FC<BookingsClientProps> = ({ bookings }) => {
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      const result = await deleteBooking(id);
      if (!result.success) {
        alert(`Error: ${result.error}`);
      }
    }
  };

  const getStatusColor = (status: string, type: 'payment' | 'process') => {
    if (type === 'payment') {
      switch (status) {
        case 'Paid': return 'bg-green-100 text-green-800';
        case 'Proforma': return 'bg-yellow-100 text-yellow-800';
        case 'Pending': return 'bg-orange-100 text-orange-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    } else { // process status
      switch (status) {
        case 'COMPLETED': return 'bg-green-100 text-green-800';
        case 'PENDING': return 'bg-yellow-100 text-yellow-800';
        case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
        case 'CANCELLED': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium"><input type="checkbox" /></th>
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
              <tr key={booking.id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <td className="px-4 py-3"><input type="checkbox" /></td>
                <td className="px-4 py-3 text-sm font-medium text-blue-600">
                   <a href={`/admin/bookings/${booking.id}`} className="hover:underline">{booking.id.substring(0, 5)}...</a>
                </td>
                <td className="px-4 py-3 text-sm">{booking.invoiceNo || '-'}</td>
                <td className="px-4 py-3 text-sm max-w-xs truncate">{booking.transactionId || '-'}</td>
                <td className="px-4 py-3 text-sm">{`${booking.customer.firstName} ${booking.customer.lastName}`}</td>
                <td className="px-4 py-3 text-sm">{booking.createdAt.toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${booking.paymentType === 'Online' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                    {booking.paymentType}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.paymentStatus, 'payment')}`}>
                    {booking.paymentStatus}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status, 'process')}`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-medium">€{booking.totalPrice.toFixed(2)}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center space-x-2">
                    <button className="text-blue-600 hover:text-blue-900 p-1"><FaPrint /></button>
                    <button className="text-green-600 hover:text-green-900 p-1"><FaEye /></button>
                    <button onClick={() => handleDelete(booking.id)} className="text-red-600 hover:text-red-900 p-1"><FaTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* ... pagination can be moved here as well ... */}
    </div>
  );
};

export default BookingsClient; 
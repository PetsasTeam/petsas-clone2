import React from 'react';
import { prisma } from '@/lib/prisma';
import { BOOKING_STATUS } from '@/lib/constants';
import { 
  FaCalendarAlt, 
  FaCreditCard, 
  FaUsers, 
  FaCar, 
  FaEye, 
  FaEdit,
  FaCheck,
  FaPlus
} from 'react-icons/fa';

const AdminDashboard = async () => {

  const totalVehicles = await prisma.vehicle.count();
  const totalCustomers = await prisma.customer.count();
  const activeBookingsCount = await prisma.booking.count({ where: { status: BOOKING_STATUS.CONFIRMED } });
  const totalCategories = await prisma.vehicleCategory.count();
  const visibleVehicles = await prisma.vehicle.count({ where: { visible: true }});
  const rentedVehicles = await prisma.booking.count({ where: { status: 'Confirmed' }}); // Simplified logic

  const recentBookings = await prisma.booking.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { customer: true, vehicle: true },
  });

  const monthlyRevenue = await prisma.booking.aggregate({
    _sum: { totalPrice: true },
    where: { 
      status: BOOKING_STATUS.CONFIRMED,
      createdAt: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      }
    },
  });

  const stats = [
    { title: 'Total Vehicles', value: totalVehicles.toLocaleString(), icon: <FaCar className="h-8 w-8 text-blue-600" /> },
    { title: 'Active Bookings', value: activeBookingsCount.toLocaleString(), icon: <FaCalendarAlt className="h-8 w-8 text-green-600" /> },
    { title: 'Total Customers', value: totalCustomers.toLocaleString(), icon: <FaUsers className="h-8 w-8 text-purple-600" /> },
    { title: 'Monthly Revenue', value: `€${(monthlyRevenue._sum.totalPrice || 0).toLocaleString()}`, icon: <FaCreditCard className="h-8 w-8 text-yellow-600" /> }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your car rental business.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{`${booking.customer.firstName} ${booking.customer.lastName}`}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.vehicle.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{`${booking.startDate.toLocaleDateString()} - ${booking.endDate.toLocaleDateString()}`}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{booking.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">€{booking.totalPrice.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900"><FaEye className="h-4 w-4" /></button>
                      <button className="text-green-600 hover:text-green-900"><FaEdit className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions & Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3">
              <FaPlus className="h-5 w-5 text-blue-600" />
              <span className="text-gray-700">Add New Vehicle</span>
            </button>
            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3">
              <FaUsers className="h-5 w-5 text-purple-600" />
              <span className="text-gray-700">Add Customer</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-3">
             <div className="flex items-center justify-between">
              <span className="text-gray-600">Vehicle Categories</span>
              <span className="text-purple-600 font-medium">{totalCategories}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Vehicles</span>
              <span className="text-blue-600 font-medium">{totalVehicles}</span>
            </div>
             <div className="flex items-center justify-between">
              <span className="text-gray-600">Visible Vehicles</span>
              <span className="text-green-600 font-medium">{visibleVehicles}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Rented Vehicles</span>
              <span className="text-orange-600 font-medium">{rentedVehicles}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
          <div className="space-y-3">
            {/* These would also be calculated from real data */}
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Online Payments</span>
              <span className="text-green-600 font-medium">€{ (monthlyRevenue._sum.totalPrice || 0).toLocaleString() }</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">On Arrival</span>
              <span className="text-blue-600 font-medium">€0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Pending</span>
              <span className="text-orange-600 font-medium">€...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 
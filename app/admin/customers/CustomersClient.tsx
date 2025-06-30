'use client';

import React, { useState } from 'react';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaSearch,
  FaFilter,
  FaUsers,
  FaDownload,
  FaEnvelope,
  FaPhone
} from 'react-icons/fa';
import { deleteCustomer } from './actions';
import { Customer, Booking } from '../../generated/prisma';

interface CustomersClientProps {
  customers: (Customer & { bookings: Pick<Booking, 'id'>[] })[];
  stats: {
    total: number;
    withBookings: number;
    recent: number;
  };
}

const CustomersClient: React.FC<CustomersClientProps> = ({ customers, stats }) => {
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [searchFilters, setSearchFilters] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB');
  };

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customers.map(c => c.id));
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    if (customer.bookings.length > 0) {
      alert(`Cannot delete customer with ${customer.bookings.length} existing bookings`);
      return;
    }

    if (confirm('Are you sure you want to delete this customer?')) {
      try {
        await deleteCustomer(customerId);
      } catch (error) {
        alert('Failed to delete customer');
      }
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedCustomers.length === 0) {
      alert('Please select customers to delete');
      return;
    }
    
    const customersWithBookings = selectedCustomers.filter(id => {
      const customer = customers.find(c => c.id === id);
      return customer && customer.bookings.length > 0;
    });

    if (customersWithBookings.length > 0) {
      alert(`Cannot delete ${customersWithBookings.length} customers with existing bookings`);
      return;
    }
    
    if (confirm(`Are you sure you want to delete ${selectedCustomers.length} selected customers?`)) {
      try {
        await Promise.all(selectedCustomers.map(id => deleteCustomer(id)));
        setSelectedCustomers([]);
      } catch (error) {
        alert('Failed to delete selected customers');
      }
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
    return (
      fullName.includes(searchFilters.firstName.toLowerCase()) &&
      fullName.includes(searchFilters.lastName.toLowerCase()) &&
      customer.email.toLowerCase().includes(searchFilters.email.toLowerCase()) &&
      customer.phone.toLowerCase().includes(searchFilters.phone.toLowerCase())
    );
  });

  const handleFilterChange = (field: string, value: string) => {
    setSearchFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setSearchFilters({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600">Manage your customer database and information</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <FaPlus className="h-4 w-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name:</label>
            <input
              type="text"
              value={searchFilters.firstName}
              onChange={(e) => handleFilterChange('firstName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter first name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name:</label>
            <input
              type="text"
              value={searchFilters.lastName}
              onChange={(e) => handleFilterChange('lastName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter last name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email:</label>
            <input
              type="email"
              value={searchFilters.email}
              onChange={(e) => handleFilterChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone:</label>
            <input
              type="text"
              value={searchFilters.phone}
              onChange={(e) => handleFilterChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter phone"
            />
          </div>
        </div>
        <div className="flex space-x-4">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <FaFilter className="h-4 w-4" />
            <span>Filter</span>
          </button>
          <button 
            onClick={clearFilters}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
          <FaPlus className="h-4 w-4" />
          <span>Add New</span>
        </button>
        <button 
          onClick={handleDeleteSelected}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <FaTrash className="h-4 w-4" />
          <span>Delete Selected</span>
        </button>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2">
          <FaDownload className="h-4 w-4" />
          <span>Export to CSV</span>
        </button>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300"
                    checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium">Name</th>
                <th className="px-6 py-4 text-left text-sm font-medium">Email</th>
                <th className="px-6 py-4 text-left text-sm font-medium">Phone</th>
                <th className="px-6 py-4 text-center text-sm font-medium">Bookings</th>
                <th className="px-6 py-4 text-center text-sm font-medium">Joined</th>
                <th className="px-6 py-4 text-center text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer, index) => (
                <tr key={customer.id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300"
                      checked={selectedCustomers.includes(customer.id)}
                      onChange={() => handleSelectCustomer(customer.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {customer.firstName} {customer.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <FaEnvelope className="h-3 w-3 text-gray-400" />
                      <span>{customer.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <FaPhone className="h-3 w-3 text-gray-400" />
                      <span>{customer.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      customer.bookings.length > 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {customer.bookings.length} booking{customer.bookings.length !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    {formatDate(customer.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    <div className="flex justify-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50">
                        <FaEye className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50">
                        <FaEdit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteCustomer(customer.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                      >
                        <FaTrash className="h-4 w-4" />
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
                Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredCustomers.length}</span> of{' '}
                <span className="font-medium">{filteredCustomers.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
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

      {/* Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaUsers className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaPlus className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">New This Month</p>
              <p className="text-2xl font-bold text-gray-900">{stats.recent}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaEnvelope className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">With Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.withBookings}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaPhone className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Phone Verified</p>
              <p className="text-2xl font-bold text-gray-900">{customers.filter(c => c.phone).length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomersClient; 
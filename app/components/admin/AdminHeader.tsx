"use client";

import React from 'react';
import { FaBell, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';

const AdminHeader: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <div className="lg:hidden">
              <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            <h1 className="ml-2 text-xl font-semibold text-gray-900">
              Petsas Admin Dashboard
            </h1>
          </div>

          {/* Right side - User menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full relative">
              <FaBell className="h-5 w-5" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
            </button>

            {/* User dropdown */}
            <div className="relative">
              <button className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <FaUser className="h-4 w-4 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">Administrator</p>
                  <p className="text-xs text-gray-500">Petsas Car Rentals</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader; 
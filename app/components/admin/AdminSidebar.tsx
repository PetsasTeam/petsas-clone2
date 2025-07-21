"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FaTachometerAlt, 
  FaCar, 
  FaUsers, 
  FaCalendarAlt, 
  FaCreditCard, 
  FaMapMarkerAlt, 
  FaPercent, 
  FaCog, 
  FaChevronDown,
  FaChevronRight,
  FaImage,
  FaList,
  FaPlus,
  FaNewspaper,
  FaPalette
} from 'react-icons/fa';

interface MenuItem {
  title: string;
  href?: string;
  icon: React.ReactNode;
  children?: MenuItem[];
}

const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(['system-setup']);

  const menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      href: '/admin',
      icon: <FaTachometerAlt className="h-5 w-5" />
    },
    {
      title: 'System Setup',
      icon: <FaCog className="h-5 w-5" />,
      children: [
        {
          title: 'General Settings',
          href: '/admin/setup/general',
          icon: <FaCog className="h-4 w-4" />
        },
        {
          title: 'Vehicle Categories',
          href: '/admin/setup/vehicle-categories',
          icon: <FaList className="h-4 w-4" />
        },
        {
          title: 'Rental Options',
          href: '/admin/setup/rental-options',
          icon: <FaPlus className="h-4 w-4" />
        },
        {
          title: 'Rental Periods',
          href: '/admin/setup/rental-periods',
          icon: <FaCalendarAlt className="h-4 w-4" />
        },
        {
          title: 'Locations',
          href: '/admin/setup/locations',
          icon: <FaMapMarkerAlt className="h-4 w-4" />
        },
        {
          title: 'Promotions',
          href: '/admin/setup/promotions',
          icon: <FaPercent className="h-4 w-4" />
        }
      ]
    },
    {
      title: 'Blog',
      href: '/admin/blog',
      icon: <FaNewspaper className="h-5 w-5" />
    },
    {
      title: 'Site Content',
      href: '/admin/content',
      icon: <FaPalette className="h-5 w-5" />
    },
    {
      title: 'Booking Management',
      icon: <FaCalendarAlt className="h-5 w-5" />,
      children: [
        {
          title: 'All Bookings',
          href: '/admin/bookings',
          icon: <FaCalendarAlt className="h-4 w-4" />
        },
        {
          title: 'New Booking',
          href: '/admin/bookings/new',
          icon: <FaPlus className="h-4 w-4" />
        },
        {
          title: 'Payment Tracking',
          href: '/admin/bookings/payments',
          icon: <FaCreditCard className="h-4 w-4" />
        },
        {
          title: 'Payment Logs',
          href: '/admin/payment-logs',
          icon: <FaCreditCard className="h-4 w-4" />
        }
      ]
    },
    {
      title: 'Customer Management',
      icon: <FaUsers className="h-5 w-5" />,
      children: [
        {
          title: 'All Customers',
          href: '/admin/customers',
          icon: <FaUsers className="h-4 w-4" />
        },
        {
          title: 'Add Customer',
          href: '/admin/customers/add',
          icon: <FaPlus className="h-4 w-4" />
        }
      ]
    }
  ];

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.title);
    const isItemActive = item.href ? isActive(item.href) : false;

    if (hasChildren) {
      return (
        <div key={item.title}>
          <button
            onClick={() => toggleExpanded(item.title)}
            className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium rounded-lg transition-colors ${
              level === 0 
                ? 'text-gray-700 hover:bg-gray-100' 
                : 'text-gray-600 hover:bg-gray-50 ml-4'
            }`}
          >
            <div className="flex items-center space-x-3">
              {item.icon}
              <span>{item.title}</span>
            </div>
            {isExpanded ? (
              <FaChevronDown className="h-4 w-4" />
            ) : (
              <FaChevronRight className="h-4 w-4" />
            )}
          </button>
          {isExpanded && (
            <div className="mt-1 space-y-1">
              {item.children?.map(child => renderMenuItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.title}
        href={item.href!}
        className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
          level === 0 ? '' : 'ml-4'
        } ${
          isItemActive
            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        {item.icon}
        <span>{item.title}</span>
      </Link>
    );
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform -translate-x-full transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0">
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-6">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FaCar className="h-5 w-5 text-white" />
            </div>
            <span className="ml-3 text-lg font-semibold text-gray-900">Admin Panel</span>
          </div>
          
          <nav className="flex-1 px-2 space-y-1">
            {menuItems.map(item => renderMenuItem(item))}
          </nav>
        </div>
        
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <FaUsers className="h-4 w-4 text-gray-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Admin User</p>
              <p className="text-xs text-gray-500">System Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;

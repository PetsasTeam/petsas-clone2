'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaToggleOn,
  FaToggleOff,
  FaPercent,
  FaCalendarAlt,
  FaGift,
  FaUsers,
  FaHeart
} from 'react-icons/fa';
import { deletePromotion, togglePromotionVisibility } from './actions';
import { Promotion } from '../../../generated/prisma';

interface PromotionsClientProps {
  promotions: Promotion[];
  stats: {
    total: number;
    active: number;
    expired: number;
    upcoming: number;
  };
}

const PromotionsClient: React.FC<PromotionsClientProps> = ({ promotions, stats }) => {
  const [selectedPromotions, setSelectedPromotions] = useState<string[]>([]);

  const getPromotionTypeColor = (type: string | null) => {
    switch (type) {
      case 'Wedding':
        return 'bg-pink-100 text-pink-800';
      case 'Seasonal':
        return 'bg-green-100 text-green-800';
      case 'Event':
        return 'bg-blue-100 text-blue-800';
      case 'Festival':
        return 'bg-purple-100 text-purple-800';
      case 'VIP':
        return 'bg-yellow-100 text-yellow-800';
      case 'Christening':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPromotionTypeIcon = (type: string | null) => {
    switch (type) {
      case 'Wedding':
        return <FaHeart className="h-4 w-4 text-pink-600" />;
      case 'Seasonal':
        return <FaCalendarAlt className="h-4 w-4 text-green-600" />;
      case 'Event':
        return <FaUsers className="h-4 w-4 text-blue-600" />;
      case 'Festival':
        return <FaGift className="h-4 w-4 text-purple-600" />;
      case 'VIP':
        return <FaPercent className="h-4 w-4 text-yellow-600" />;
      default:
        return <FaGift className="h-4 w-4 text-gray-600" />;
    }
  };

  const isPromotionActive = (startDate: Date, endDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today >= startDate && today <= endDate;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB');
  };

  const handleSelectPromotion = (promotionId: string) => {
    setSelectedPromotions(prev => 
      prev.includes(promotionId) 
        ? prev.filter(id => id !== promotionId)
        : [...prev, promotionId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPromotions.length === promotions.length) {
      setSelectedPromotions([]);
    } else {
      setSelectedPromotions(promotions.map(p => p.id));
    }
  };

  const handleDeletePromotion = async (promotionId: string) => {
    if (confirm('Are you sure you want to delete this promotion?')) {
      try {
        await deletePromotion(promotionId);
        window.location.reload(); // Refresh the page to show updated data
      } catch (error) {
        alert('Failed to delete promotion');
      }
    }
  };

  const handleToggleVisibility = async (promotionId: string, visible: boolean) => {
    try {
      await togglePromotionVisibility(promotionId, !visible);
      window.location.reload(); // Refresh the page to show updated data
    } catch (error) {
      alert('Failed to update promotion visibility');
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedPromotions.length === 0) {
      alert('Please select promotions to delete');
      return;
    }
    
    if (confirm(`Are you sure you want to delete ${selectedPromotions.length} selected promotions?`)) {
      try {
        await Promise.all(selectedPromotions.map(id => deletePromotion(id)));
        setSelectedPromotions([]);
        window.location.reload(); // Refresh the page to show updated data
      } catch (error) {
        alert('Failed to delete selected promotions');
      }
    }
  };

  const handleSetAllVisible = async () => {
    if (selectedPromotions.length === 0) {
      alert('Please select promotions to make visible');
      return;
    }
    
    try {
      await Promise.all(selectedPromotions.map(id => togglePromotionVisibility(id, true)));
      setSelectedPromotions([]);
      window.location.reload(); // Refresh the page to show updated data
    } catch (error) {
      alert('Failed to update promotion visibility');
    }
  };

  const handleSetAllHidden = async () => {
    if (selectedPromotions.length === 0) {
      alert('Please select promotions to hide');
      return;
    }
    
    try {
      await Promise.all(selectedPromotions.map(id => togglePromotionVisibility(id, false)));
      setSelectedPromotions([]);
      window.location.reload(); // Refresh the page to show updated data
    } catch (error) {
      alert('Failed to update promotion visibility');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promotions Management</h1>
          <p className="text-gray-600">Manage discount codes and promotional campaigns</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Link href="/admin/setup/promotions/new">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
            <FaPlus className="h-4 w-4" />
            <span>Add New</span>
          </button>
        </Link>
        <button 
          onClick={handleDeleteSelected}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <FaTrash className="h-4 w-4" />
          <span>Delete Selected</span>
        </button>
        <button 
          onClick={handleSetAllVisible}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <FaToggleOn className="h-4 w-4" />
          <span>Set to Visible</span>
        </button>
        <button 
          onClick={handleSetAllHidden}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
        >
          <FaToggleOff className="h-4 w-4" />
          <span>Set to Not Visible</span>
        </button>
      </div>

      {/* Promotions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300"
                    checked={selectedPromotions.length === promotions.length && promotions.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Code</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Discount</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Start Date</th>
                <th className="px-4 py-3 text-center text-sm font-medium">End Date</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Type</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Visible</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {promotions.map((promotion, index) => (
                <tr key={promotion.id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300"
                      checked={selectedPromotions.includes(promotion.id)}
                      onChange={() => handleSelectPromotion(promotion.id)}
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium max-w-xs truncate">
                    {promotion.name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                    {promotion.code}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center font-semibold">
                    {promotion.discount}%
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                    {formatDate(promotion.startDate)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                    {formatDate(promotion.endDate)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getPromotionTypeColor(promotion.type)}`}>
                        {getPromotionTypeIcon(promotion.type)}
                        <span className="ml-1">{promotion.type || 'General'}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      isPromotionActive(promotion.startDate, promotion.endDate)
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {isPromotionActive(promotion.startDate, promotion.endDate) ? 'Active' : 'Expired'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <button onClick={() => handleToggleVisibility(promotion.id, promotion.visible)}>
                      {promotion.visible ? (
                        <FaToggleOn className="h-6 w-6 text-green-600 mx-auto cursor-pointer" />
                      ) : (
                        <FaToggleOff className="h-6 w-6 text-gray-400 mx-auto cursor-pointer" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center">
                    <div className="flex justify-center space-x-2">
                      <button 
                        onClick={() => alert(`Viewing promotion: ${promotion.name}\nCode: ${promotion.code}\nDiscount: ${promotion.discount}%\nType: ${promotion.type}`)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="View Details"
                      >
                        <FaEye className="h-4 w-4" />
                      </button>
                      <Link href={`/admin/setup/promotions/${promotion.id}/edit`}>
                        <button className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50" title="Edit">
                          <FaEdit className="h-4 w-4" />
                        </button>
                      </Link>
                      <button 
                        onClick={() => handleDeletePromotion(promotion.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Delete"
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
        
        {/* Total Records */}
        <div className="bg-blue-600 text-white px-6 py-2 text-right text-sm">
          Total Records: {promotions.length}
        </div>
      </div>

      {/* Promotion Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaGift className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Promotions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaCalendarAlt className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Promotions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaHeart className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Wedding Promos</p>
              <p className="text-2xl font-bold text-gray-900">{promotions.filter(p => p.type === 'Wedding').length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaToggleOn className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Visible Promotions</p>
              <p className="text-2xl font-bold text-gray-900">{promotions.filter(p => p.visible).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Promotion Categories */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Promotion Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <FaHeart className="h-6 w-6 text-pink-600 mr-2" />
              <h4 className="font-medium text-gray-900">Special Events</h4>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Wedding Celebrations</li>
              <li>• Christening Events</li>
              <li>• Anniversary Specials</li>
            </ul>
            <div className="mt-3 text-sm font-medium text-pink-600">
              {promotions.filter(p => ['Wedding', 'Christening'].includes(p.type || '')).length} active
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <FaCalendarAlt className="h-6 w-6 text-green-600 mr-2" />
              <h4 className="font-medium text-gray-900">Seasonal Offers</h4>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Summer Specials</li>
              <li>• Holiday Discounts</li>
              <li>• Seasonal Campaigns</li>
            </ul>
            <div className="mt-3 text-sm font-medium text-green-600">
              {promotions.filter(p => p.type === 'Seasonal').length} active
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <FaUsers className="h-6 w-6 text-blue-600 mr-2" />
              <h4 className="font-medium text-gray-900">Event & VIP</h4>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Corporate Events</li>
              <li>• VIP Customer Offers</li>
              <li>• Festival Promotions</li>
            </ul>
            <div className="mt-3 text-sm font-medium text-blue-600">
              {promotions.filter(p => ['Event', 'VIP', 'Festival'].includes(p.type || '')).length} active
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionsClient;

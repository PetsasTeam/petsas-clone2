'use client';

import React from 'react';
import { useFormState } from 'react-dom';
import { updatePromotion, State, getPromotionById } from '../../actions';
import { FaEdit, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Promotion } from '../../../../../generated/prisma';

const initialState: State = { message: null, errors: {} };

export default function EditPromotionPage() {
  const params = useParams();
  const promotionId = params.id as string;
  const [state, dispatch] = useFormState(updatePromotion.bind(null, promotionId), initialState);
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(true);

  const promotionTypes = [
    'Wedding',
    'Seasonal', 
    'Event',
    'Festival',
    'VIP',
    'Christening',
    'General'
  ];

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        const data = await getPromotionById(promotionId);
        setPromotion(data);
      } catch (error) {
        console.error('Failed to fetch promotion:', error);
      } finally {
        setLoading(false);
      }
    };

    if (promotionId) {
      fetchPromotion();
    }
  }, [promotionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading promotion...</div>
      </div>
    );
  }

  if (!promotion) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Promotion not found</div>
      </div>
    );
  }

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            href="/admin/setup/promotions"
            className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100"
          >
            <FaArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Promotion</h1>
            <p className="text-gray-600">Update promotional campaign details</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form action={dispatch}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Promotion Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={promotion.name}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., APHRODITI'S WEDDING"
                required
              />
              {state.errors?.name && (
                <p className="mt-1 text-sm text-red-600">{state.errors.name[0]}</p>
              )}
            </div>

            {/* Code */}
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Promotion Code *
              </label>
              <input
                type="text"
                id="code"
                name="code"
                defaultValue={promotion.code}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., WEDDING25"
                required
              />
              {state.errors?.code && (
                <p className="mt-1 text-sm text-red-600">{state.errors.code[0]}</p>
              )}
            </div>

            {/* Discount */}
            <div>
              <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-2">
                Discount (%) *
              </label>
              <input
                type="number"
                id="discount"
                name="discount"
                min="0"
                max="100"
                step="0.01"
                defaultValue={promotion.discount}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 15.00"
                required
              />
              {state.errors?.discount && (
                <p className="mt-1 text-sm text-red-600">{state.errors.discount[0]}</p>
              )}
            </div>

            {/* Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Promotion Type
              </label>
              <select
                id="type"
                name="type"
                defaultValue={promotion.type || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Type</option>
                {promotionTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {state.errors?.type && (
                <p className="mt-1 text-sm text-red-600">{state.errors.type[0]}</p>
              )}
            </div>

            {/* Start Date */}
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                defaultValue={formatDateForInput(promotion.startDate)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              {state.errors?.startDate && (
                <p className="mt-1 text-sm text-red-600">{state.errors.startDate[0]}</p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                defaultValue={formatDateForInput(promotion.endDate)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              {state.errors?.endDate && (
                <p className="mt-1 text-sm text-red-600">{state.errors.endDate[0]}</p>
              )}
            </div>
          </div>

          {/* Visible Checkbox */}
          <div className="mt-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="visible"
                name="visible"
                defaultChecked={promotion.visible}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="visible" className="ml-2 block text-sm font-medium text-gray-700">
                Make this promotion visible to customers
              </label>
            </div>
            {state.errors?.visible && (
              <p className="mt-1 text-sm text-red-600">{state.errors.visible[0]}</p>
            )}
          </div>

          {/* Error Message */}
          {state.message && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{state.message}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-8 flex space-x-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <FaEdit className="h-4 w-4" />
              <span>Update Promotion</span>
            </button>
            <Link
              href="/admin/setup/promotions"
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 
 
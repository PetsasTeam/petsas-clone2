'use client';

import React, { useState } from 'react';
import { FaSave, FaUndo } from 'react-icons/fa';
import { updateGeneralSettings } from './actions';

interface GeneralSettings {
  id?: string;
  maxRowsPerPage: number;
  vatPercentage?: number;
  payOnArrivalDiscount: number;
  payOnlineDiscount: number;
  nextInvoiceNumber: string | number;
  glassmorphismEnabled: boolean;
}

interface GeneralSettingsFormProps {
  settings: GeneralSettings;
}

export default function GeneralSettingsForm({ settings }: GeneralSettingsFormProps) {
  const [formData, setFormData] = useState({
    maxRowsPerPage: settings.maxRowsPerPage || 500,
    vatPercentage: settings.vatPercentage || 19.0,
    payOnArrivalDiscount: settings.payOnArrivalDiscount || 10.0,
    payOnlineDiscount: settings.payOnlineDiscount || 15.0,
    nextInvoiceNumber: settings.nextInvoiceNumber || 14312,
    glassmorphismEnabled: settings.glassmorphismEnabled ?? true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitFormData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      submitFormData.append(key, value.toString());
    });
    await updateGeneralSettings(submitFormData);
  };

  const handleReset = () => {
    setFormData({
      maxRowsPerPage: settings.maxRowsPerPage || 500,
      vatPercentage: settings.vatPercentage || 19.0,
      payOnArrivalDiscount: settings.payOnArrivalDiscount || 10.0,
      payOnlineDiscount: settings.payOnlineDiscount || 15.0,
      nextInvoiceNumber: settings.nextInvoiceNumber || 14312,
      glassmorphismEnabled: settings.glassmorphismEnabled ?? true,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          
          {/* Column 1 */}
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-gray-900">Website & Display</h3>
              <p className="text-sm text-gray-500">How data is displayed on the website</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Rows per page</label>
              <input
                type="number"
                name="maxRowsPerPage"
                value={formData.maxRowsPerPage}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="glassmorphismEnabled"
                name="glassmorphismEnabled"
                checked={formData.glassmorphismEnabled}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="glassmorphismEnabled" className="ml-2 block text-sm font-medium text-gray-700">
                Enable Glassmorphism Effect
              </label>
            </div>
            <p className="text-xs text-gray-500 -mt-4">
              Controls the glass-like transparency effect on the homepage booking form
            </p>

            <div className="border-b border-gray-200 pb-4 pt-4">
              <h3 className="text-lg font-semibold text-gray-900">Financial Settings</h3>
              <p className="text-sm text-gray-500">Taxes and discounts configuration</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">VAT (%)</label>
              <input
                type="number"
                step="0.01"
                name="vatPercentage"
                value={formData.vatPercentage}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pay on arrival discount (%)</label>
              <input
                type="number"
                step="0.01"
                name="payOnArrivalDiscount"
                value={formData.payOnArrivalDiscount}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pay online discount (%)</label>
              <input
                type="number"
                step="0.01"
                name="payOnlineDiscount"
                value={formData.payOnlineDiscount}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Next Invoice Number</label>
              <input
                type="number"
                name="nextInvoiceNumber"
                value={formData.nextInvoiceNumber}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Column 2 - Empty for now */}
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-gray-900">Additional Settings</h3>
              <p className="text-sm text-gray-500">Future configuration options</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleReset}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center space-x-2"
          >
            <FaUndo className="h-4 w-4" />
            <span>Reset</span>
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <FaSave className="h-4 w-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </form>
  );
} 
 
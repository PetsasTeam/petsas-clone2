import React from 'react';
import { FaSave, FaUndo, FaCogs } from 'react-icons/fa';
import { prisma } from '@/lib/prisma';
import GeneralSettingsForm from './GeneralSettingsForm';

async function getGeneralSettings() {
  const settings = await prisma.generalSetting.findFirst();
  return settings || {
    maxRowsPerPage: 500,
    vat: 19.00,
    payOnArrivalDiscount: 10.00,
    payOnlineDiscount: 15.00,
    nextInvoiceNumber: 14312,
    glassmorphismEnabled: true,
  };
}

export default async function GeneralSettingsPage() {
  const settings = await getGeneralSettings();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">General Settings</h1>
          <p className="text-gray-600">Configure system-wide settings for your rental business</p>
        </div>
      </div>

      <GeneralSettingsForm settings={settings} />
      
      {/* System Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FaCogs className="mr-3 text-blue-600"/>
            System Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-medium text-gray-600">Next.js Version</p>
              <p className="font-semibold text-gray-900">14.2.4</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-medium text-gray-600">React Version</p>
              <p className="font-semibold text-gray-900">18</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-medium text-gray-600">Database Status</p>
              <p className="font-semibold text-green-600">Connected</p>
            </div>
          </div>
      </div>
    </div>
  );
} 
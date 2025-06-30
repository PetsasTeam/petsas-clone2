import React from 'react';
import { redirect } from 'next/navigation';
import { PrismaClient } from '../../../../generated/prisma';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

const prisma = new PrismaClient();

async function createNewRentalOption(formData: FormData) {
  'use server';
  
  const code = formData.get('code') as string;
  const name = formData.get('name') as string;
  const displayOrder = parseInt(formData.get('displayOrder') as string) || 0;
  const visible = formData.get('visible') === 'on';
  const maxQty = parseInt(formData.get('maxQty') as string) || 1;
  const priceType = formData.get('priceType') as string;
  const maxCost = formData.get('maxCost') ? parseFloat(formData.get('maxCost') as string) : null;
  const freeOverDays = formData.get('freeOverDays') ? parseInt(formData.get('freeOverDays') as string) : null;
  const description = formData.get('description') as string || null;

  if (!code || !name || !priceType) {
    throw new Error('Code, name, and price type are required');
  }

  try {
    // Check if code already exists
    const existingOption = await prisma.rentalOption.findUnique({
      where: { code }
    });

    if (existingOption) {
      throw new Error(`A rental option with code "${code}" already exists. Please use a different code.`);
    }

    const newRentalOption = await prisma.rentalOption.create({
      data: {
        code,
        name,
        displayOrder,
        visible,
        maxQty,
        priceType,
        maxCost,
        freeOverDays,
        description,
        photo: null, // Will be set later via image upload
      },
    });

    redirect('/admin/setup/rental-options');
  } catch (error) {
    console.error('Error creating rental option:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to create rental option');
  }
}

export default async function NewRentalOptionPage() {
  // Get the next display order by finding the highest current order
  const maxOrder = await prisma.rentalOption.findFirst({
    orderBy: { displayOrder: 'desc' },
    select: { displayOrder: true }
  });

  const nextDisplayOrder = (maxOrder?.displayOrder || 0) + 1;

  return (
    <div className="space-y-6">
      {/* Header with Breadcrumbs */}
      <div>
        <div className="text-sm text-gray-500 mb-2">
          <Link href="/admin/setup/rental-options" className="hover:text-gray-700">System Setup</Link> &gt; 
          <Link href="/admin/setup/rental-options" className="hover:text-gray-700"> Rental Options</Link> &gt;
          <span className="font-medium text-gray-800"> Add New Option</span>
        </div>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Add New Rental Option</h1>
          <Link href="/admin/setup/rental-options">
            <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center space-x-2">
              <FaArrowLeft className="h-4 w-4" />
              <span>Back to Options</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form action={createNewRentalOption} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code
                <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="code"
                required
                className="w-full p-3 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="e.g., GPS, CDW, PAI"
              />
              <p className="text-xs text-gray-500 mt-1">Short unique identifier for the option</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
              <input 
                type="number" 
                name="displayOrder"
                defaultValue={nextDisplayOrder}
                className="w-full p-3 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
              <p className="text-xs text-gray-500 mt-1">Lower numbers appear first (suggested: {nextDisplayOrder})</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Option Name
                <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="name"
                required
                className="w-full p-3 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="e.g., GPS Navigation System, Collision Damage Waiver"
              />
              <p className="text-xs text-gray-500 mt-1">This name will be displayed to customers during checkout</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Type
                <span className="text-red-500">*</span>
              </label>
              <select 
                name="priceType"
                required
                className="w-full p-3 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select pricing type</option>
                <option value="per Day">per Day</option>
                <option value="per Rental">per Rental</option>
                <option value="per day per driver">per day per driver</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Quantity</label>
              <input 
                type="number" 
                name="maxQty"
                defaultValue={1}
                min="1"
                className="w-full p-3 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
              <p className="text-xs text-gray-500 mt-1">Maximum quantity customers can select</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Cost (€)</label>
              <input 
                type="number" 
                step="0.01"
                name="maxCost"
                className="w-full p-3 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="e.g., 40.00"
              />
              <p className="text-xs text-gray-500 mt-1">Optional maximum cost limit for this option</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Free Over Days</label>
              <input 
                type="number" 
                name="freeOverDays"
                className="w-full p-3 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="e.g., 7"
              />
              <p className="text-xs text-gray-500 mt-1">Number of days after which this option becomes free</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                name="description"
                rows={3}
                className="w-full p-3 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Optional description of the rental option"
              />
            </div>
            
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg w-full">
                <input 
                  type="checkbox" 
                  name="visible"
                  defaultChecked={true}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    Visible to Customers
                  </label>
                  <p className="text-xs text-gray-600">
                    Check this to make the option visible during checkout
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-6">
            <div className="flex justify-end space-x-3">
              <Link href="/admin/setup/rental-options">
                <button type="button" className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors">
                  Cancel
                </button>
              </Link>
              <button 
                type="submit"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <FaSave className="h-4 w-4" />
                <span>Create Option</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Creating Rental Options</h3>
        <div className="text-blue-800 space-y-2">
          <p>• <strong>Code:</strong> A short unique identifier (e.g., GPS, CDW, PAI)</p>
          <p>• <strong>Price Type:</strong> How the option is charged - per day, per rental, or per day per driver</p>
          <p>• <strong>Max Cost:</strong> Optional ceiling price for daily-charged items</p>
          <p>• <strong>Free Over Days:</strong> Make the option free after a certain number of rental days</p>
          <p>• <strong>After Creation:</strong> You can set up pricing tiers for different vehicle groups and upload an icon</p>
        </div>
      </div>
    </div>
  );
} 
 
import React from 'react';
import { redirect } from 'next/navigation';
import { prisma } from '../../../../../lib/prisma';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

async function createCategory(formData: FormData) {
  'use server';
  
  const name = formData.get('name') as string;
  const displayOrder = parseInt(formData.get('displayOrder') as string) || 0;
  const visible = formData.get('visible') === 'on';

  if (!name) {
    throw new Error('Category name is required');
  }

  try {
    const newCategory = await prisma.vehicleCategory.create({
      data: {
        name,
        displayOrder,
        visible,
      },
    });

    redirect('/admin/setup/vehicle-categories');
  } catch (error) {
    console.error('Error creating category:', error);
    throw new Error('Failed to create category');
  }
}

export default async function NewVehicleCategoryPage() {
  // Get the next display order by finding the highest current order
  const maxOrder = await prisma.vehicleCategory.findFirst({
    orderBy: { displayOrder: 'desc' },
    select: { displayOrder: true }
  });

  const nextDisplayOrder = (maxOrder?.displayOrder || 0) + 1;

  return (
    <div className="space-y-6">
      {/* Header with Breadcrumbs */}
      <div>
        <div className="text-sm text-gray-500 mb-2">
          <Link href="/admin/setup/vehicle-categories" className="hover:text-gray-700">System Setup</Link> &gt; 
          <Link href="/admin/setup/vehicle-categories" className="hover:text-gray-700"> Vehicle Categories</Link> &gt;
          <span className="font-medium text-gray-800"> Add New Category</span>
        </div>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Add New Vehicle Category</h1>
          <Link href="/admin/setup/vehicle-categories">
            <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center space-x-2">
              <FaArrowLeft className="h-4 w-4" />
              <span>Back to Categories</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form action={createCategory} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name
                <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="name"
                required
                className="w-full p-3 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="e.g., Luxury Vehicles, Economy Cars, SUVs"
              />
              <p className="text-xs text-gray-500 mt-1">This name will be displayed to customers on the website</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
              <input 
                type="number" 
                name="displayOrder"
                defaultValue={nextDisplayOrder}
                className="w-full p-3 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
              <p className="text-xs text-gray-500 mt-1">Lower numbers appear first on the website (suggested: {nextDisplayOrder})</p>
            </div>
            
            <div className="flex items-center">
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
                    Check this to make the category visible on the website
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-6">
            <div className="flex justify-end space-x-3">
              <Link href="/admin/setup/vehicle-categories">
                <button type="button" className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors">
                  Cancel
                </button>
              </Link>
              <button 
                type="submit"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <FaSave className="h-4 w-4" />
                <span>Create Category</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Creating Vehicle Categories</h3>
        <div className="text-blue-800 space-y-2">
          <p>• <strong>Category Name:</strong> Choose a clear, descriptive name that customers will understand</p>
          <p>• <strong>Display Order:</strong> Controls the order categories appear on your website (1 = first, 2 = second, etc.)</p>
          <p>• <strong>Visibility:</strong> You can create categories and hide them until you're ready to add vehicles</p>
          <p>• <strong>After Creation:</strong> You'll be able to add individual vehicles to this category</p>
        </div>
      </div>
    </div>
  );
} 
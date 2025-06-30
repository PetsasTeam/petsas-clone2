import React from 'react';
import { PrismaClient } from '../../../generated/prisma';
import Link from 'next/link';
import { FaPlus, FaCar, FaToggleOn, FaEdit } from 'react-icons/fa';
import VehicleCategoriesClient from './VehicleCategoriesClient';

const prisma = new PrismaClient();

async function getCategories() {
  const categories = await prisma.vehicleCategory.findMany({
    include: {
      _count: {
        select: { vehicles: true },
      },
    },
    orderBy: {
      displayOrder: 'asc',
    }
  });
  return categories;
}

const VehicleCategoriesPage = async () => {
  const categoriesData = await getCategories();

  // We need to map the data to a serializable format to pass to the client component
  const categories = categoriesData.map(category => ({
    id: category.id,
    name: category.name,
    totalGroups: category._count.vehicles,
    displayOrder: category.displayOrder, 
    visible: category.visible,
  }));
  
  const totalVisible = categories.filter(c => c.visible).length;
  const totalGroups = categories.reduce((sum, cat) => sum + cat.totalGroups, 0);


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehicle Categories</h1>
          <p className="text-gray-600">Manage your vehicle categories and their display settings</p>
        </div>
        <Link href="/admin/setup/vehicle-categories/new">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <FaPlus className="h-4 w-4" />
            <span>Add New Category</span>
          </button>
        </Link>
      </div>
      
      <VehicleCategoriesClient categories={categories} />

      {/* Category Details Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-2">
              <FaCar className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-600">Total Categories</p>
            <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-2">
              <FaToggleOn className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-600">Active Categories</p>
            <p className="text-2xl font-bold text-green-600">{totalVisible}</p>
          </div>
          <div className="text-center">
            <div className="bg-orange-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-2">
              <FaEdit className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-sm font-medium text-gray-600">Total Vehicle Groups</p>
            <p className="text-2xl font-bold text-orange-600">{totalGroups}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleCategoriesPage; 
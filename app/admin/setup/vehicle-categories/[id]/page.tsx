import React from 'react';
import { prisma } from '@/lib/prisma';
import EditCategoryClient from './EditCategoryClient';
import { redirect } from 'next/navigation';

async function getCategoryDetails(id: string) {
  const category = await prisma.vehicleCategory.findUnique({
    where: { id },
    include: {
      vehicles: true,
      seasonalPricings: {
        include: {
          season: true,
        },
      },
    },
  });
  return category;
}

const VehicleCategoryDetailPage = async ({ params }: { params: { id: string } }) => {
  const category = await getCategoryDetails(params.id);

  if (!category) {
    return <div>Category not found.</div>;
  }

  // For simplicity in this view, let's find the 'High Season' price
  const highSeasonPrice = category.seasonalPricings.find(p => p.season.name === 'High Season')?.price3to6Days || 0;

  // Map the data to a serializable format
  const categoryData = {
    id: category.id,
    name: category.name,
    displayOrder: category.displayOrder,
    visible: category.visible,
  };

  const vehicleGroupsData = category.vehicles.map(vehicle => ({
    id: vehicle.id,
    group: vehicle.group,
    name: vehicle.name,
    model: vehicle.name,
    image: vehicle.image,
    pricePerDay: highSeasonPrice,
    visible: vehicle.visible,
    categoryId: vehicle.categoryId,
  }));

  const handleSave = async () => {
    'use server';
    redirect(`/admin/setup/vehicle-categories/${params.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header with Breadcrumbs */}
      <div>
        <div className="text-sm text-gray-500 mb-2">
            <a href="/admin/setup/vehicle-categories" className="hover:text-gray-700">System Setup</a> &gt; 
            <a href="/admin/setup/vehicle-categories" className="hover:text-gray-700"> Vehicle Categories</a> &gt;
            <span className="font-medium text-gray-800"> {category.name}</span>
        </div>
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Edit Vehicle Category</h1>
        </div>
      </div>

      <EditCategoryClient category={categoryData} vehicleGroups={vehicleGroupsData} onSave={handleSave} />
    </div>
  );
};

export default VehicleCategoryDetailPage; 
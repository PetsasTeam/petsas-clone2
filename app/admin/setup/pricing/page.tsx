import React from 'react';
import { FaEdit, FaTrash, FaPlus, FaEye } from 'react-icons/fa';
import { prisma } from '../../../../lib/prisma';



async function getPricingData() {
  const seasonalPricing = await prisma.seasonalPricing.findMany({
    include: {
      category: true,
      season: true
    },
    orderBy: [
      { category: { displayOrder: 'asc' } },
      { group: 'asc' }
    ]
  });

  const seasons = await prisma.season.findMany({
    orderBy: { startDate: 'asc' }
  });

  const categories = await prisma.vehicleCategory.findMany({
    orderBy: { displayOrder: 'asc' }
  });

  return {
    pricing: seasonalPricing,
    seasons,
    categories
  };
}

const PricingManagementPage: React.FC = async () => {
  const { pricing, seasons, categories } = await getPricingData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pricing Management</h1>
          <p className="text-gray-600">Manage seasonal pricing for all vehicle groups</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <FaPlus className="h-4 w-4" />
          <span>Add New Pricing</span>
        </button>
      </div>

      {/* Season Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {seasons.map((season) => (
          <div key={season.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{season.name}</h3>
                <p className="text-sm text-gray-600">
                  {season.startDate.toLocaleDateString()} - {season.endDate.toLocaleDateString()}
                </p>
                <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs mt-2">
                  {season.type}
                </span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {pricing.filter(p => p.seasonId === season.id).length}
                </p>
                <p className="text-sm text-gray-600">Price Groups</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Pricing Data</h2>
          <p className="text-sm text-gray-600">Current pricing for Summer Season 2025 (April 1 - October 31, 2025)</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Group</th>
                <th className="px-4 py-3 text-center text-sm font-medium">3-6 Days (€)</th>
                <th className="px-4 py-3 text-center text-sm font-medium">7-14 Days (€)</th>
                <th className="px-4 py-3 text-center text-sm font-medium">15+ Days (€)</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Season</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pricing.map((price, index) => (
                <tr key={price.id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                      {price.category.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {price.group}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                    €{price.price3to6Days}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                    €{price.price7to14Days}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                    €{price.price15PlusDays}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                      {price.season.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50">
                        <FaEye className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50">
                        <FaEdit className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50">
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
          Total Pricing Records: {pricing.length}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing Summary by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => {
            const categoryPricing = pricing.filter(p => p.categoryId === category.id);
            const avgPrice3to6 = categoryPricing.length > 0 
              ? (categoryPricing.reduce((sum, p) => sum + p.price3to6Days, 0) / categoryPricing.length).toFixed(0)
              : 0;
            const avgPrice7to14 = categoryPricing.length > 0 
              ? (categoryPricing.reduce((sum, p) => sum + p.price7to14Days, 0) / categoryPricing.length).toFixed(0)
              : 0;
            const avgPrice15Plus = categoryPricing.length > 0 
              ? (categoryPricing.reduce((sum, p) => sum + p.price15PlusDays, 0) / categoryPricing.length).toFixed(0)
              : 0;

            return (
              <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">{category.name}</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Groups:</span>
                    <span className="font-medium">{categoryPricing.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg 3-6 days:</span>
                    <span className="font-medium">€{avgPrice3to6}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg 7-14 days:</span>
                    <span className="font-medium">€{avgPrice7to14}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg 15+ days:</span>
                    <span className="font-medium">€{avgPrice15Plus}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PricingManagementPage; 
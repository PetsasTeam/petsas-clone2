'use client';

import React from 'react';
import Link from 'next/link';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaToggleOn, 
  FaToggleOff 
} from 'react-icons/fa';
import { deleteCategory, toggleCategoryVisibility, updateCategoryOrder } from './actions';

interface Category {
  id: string;
  name: string;
  totalGroups: number;
  displayOrder: number;
  visible: boolean;
}

interface VehicleCategoriesClientProps {
  categories: Category[];
}

const VehicleCategoriesClient: React.FC<VehicleCategoriesClientProps> = ({ categories }) => {
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      const result = await deleteCategory(id);
      if (!result.success) {
        alert(result.error);
      }
    }
  };

  const handleToggleVisibility = async (id: string, currentVisibility: boolean) => {
    const result = await toggleCategoryVisibility(id, !currentVisibility);
    if (!result.success) {
      alert(result.error);
    }
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const result = await updateCategoryOrder(id, direction);
    if (!result.success) {
      alert(result.error);
    }
  };

  return (
    <div>
      {/* Action Buttons */}
      <div className="flex space-x-4 mb-4">
        <Link href="/admin/setup/vehicle-categories/new">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
            <FaPlus className="h-4 w-4" />
            <span>Add New</span>
          </button>
        </Link>
        <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
          <FaTrash className="h-4 w-4" />
          <span>Delete Selected</span>
        </button>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <FaToggleOn className="h-4 w-4" />
          <span>Set to Visible</span>
        </button>
        <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2">
          <FaToggleOff className="h-4 w-4" />
          <span>Set to Not Visible</span>
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium">Name</th>
                <th className="px-6 py-4 text-center text-sm font-medium">Total Groups</th>
                <th className="px-6 py-4 text-center text-sm font-medium">Display Order</th>
                <th className="px-6 py-4 text-center text-sm font-medium">Visible</th>
                <th className="px-6 py-4 text-center text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category, index) => (
                <tr key={category.id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    <Link href={`/admin/setup/vehicle-categories/${category.id}`} className="hover:text-blue-600">
                      {category.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    {category.totalGroups}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button 
                        onClick={() => handleReorder(category.id, 'up')}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <span className="bg-blue-100 px-2 py-1 rounded text-xs">↑</span>
                      </button>
                      <span>{category.displayOrder}</span>
                      <button 
                        onClick={() => handleReorder(category.id, 'down')}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <span className="bg-blue-100 px-2 py-1 rounded text-xs">↓</span>
                      </button>
                    </div>
                  </td>
                  <td 
                    onClick={() => handleToggleVisibility(category.id, category.visible)}
                    className="px-6 py-4 whitespace-nowrap text-center cursor-pointer"
                  >
                    {category.visible ? (
                      <FaToggleOn className="h-6 w-6 text-green-600 mx-auto" />
                    ) : (
                      <FaToggleOff className="h-6 w-6 text-gray-400 mx-auto" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    <div className="flex justify-center space-x-2">
                      <Link href={`/admin/setup/vehicle-categories/${category.id}`}>
                        <button className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50">
                          <FaEye className="h-4 w-4" />
                        </button>
                      </Link>
                      <Link href={`/admin/setup/vehicle-categories/${category.id}`}>
                        <button className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50">
                          <FaEdit className="h-4 w-4" />
                        </button>
                      </Link>
                      <button 
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
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
        
        <div className="bg-blue-600 text-white px-6 py-2 text-right text-sm">
          Total Records: {categories.length}
        </div>
      </div>
    </div>
  );
};

export default VehicleCategoriesClient; 
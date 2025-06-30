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
  FaCar,
  FaShieldAlt,
  FaBaby,
  FaMap,
  FaTools
} from 'react-icons/fa';
import { 
  deleteRentalOption, 
  toggleRentalOptionVisibility, 
  bulkDeleteRentalOptions, 
  bulkToggleVisibility 
} from './actions';

// Type for rental option with pricing tiers
interface RentalOption {
  id: string;
  code: string;
  name: string;
  displayOrder: number;
  visible: boolean;
  maxQty: number;
  priceType: string;
  maxCost: number | null;
  freeOverDays: number | null;
  photo: string | null;
  description: string | null;
  pricingTiers: Array<{
    id: string;
    vehicleGroups: string;
    price: number;
  }>;
}

interface RentalOptionsClientProps {
  rentalOptions: RentalOption[];
}

const RentalOptionsClient: React.FC<RentalOptionsClientProps> = ({ rentalOptions: initialOptions }) => {
  const [rentalOptions, setRentalOptions] = useState(initialOptions);
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Helper function to get icon for rental option
  const getOptionIcon = (code: string) => {
    switch (code) {
      case 'SCDW':
      case 'TWU':
      case 'PAI':
        return <FaShieldAlt className="h-6 w-6 text-blue-600" />;
      case 'GPS':
        return <FaMap className="h-6 w-6 text-orange-600" />;
      case 'BABY':
      case 'BOOST':
        return <FaBaby className="h-6 w-6 text-pink-600" />;
      case 'ROOF':
        return <FaTools className="h-6 w-6 text-gray-600" />;
      default:
        return <FaCar className="h-6 w-6 text-gray-600" />;
    }
  };

  // Handle individual option selection
  const handleSelectOption = (optionId: string, checked: boolean) => {
    setSelectedOptions(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(optionId);
      } else {
        newSet.delete(optionId);
      }
      return newSet;
    });
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedOptions(new Set(rentalOptions.map(option => option.id)));
    } else {
      setSelectedOptions(new Set());
    }
  };

  // Handle delete individual option
  const handleDeleteOption = async (optionId: string) => {
    if (window.confirm('Are you sure you want to delete this rental option?')) {
      const result = await deleteRentalOption(optionId);
      if (result.success) {
        setRentalOptions(prev => prev.filter(option => option.id !== optionId));
        setSelectedOptions(prev => {
          const newSet = new Set(prev);
          newSet.delete(optionId);
          return newSet;
        });
        alert('Rental option deleted successfully!');
      } else {
        alert(`Error: ${result.error}`);
      }
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedOptions.size === 0) {
      alert('Please select options to delete');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedOptions.size} selected option(s)?`)) {
      const result = await bulkDeleteRentalOptions(Array.from(selectedOptions));
      if (result.success) {
        setRentalOptions(prev => prev.filter(option => !selectedOptions.has(option.id)));
        setSelectedOptions(new Set());
        setSelectAll(false);
        alert('Selected options deleted successfully!');
      } else {
        alert(`Error: ${result.error}`);
      }
    }
  };

  // Handle toggle visibility
  const handleToggleVisibility = async (optionId: string, currentVisibility: boolean) => {
    const result = await toggleRentalOptionVisibility(optionId, !currentVisibility);
    if (result.success) {
      setRentalOptions(prev => 
        prev.map(option => 
          option.id === optionId 
            ? { ...option, visible: !currentVisibility }
            : option
        )
      );
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  // Handle bulk visibility toggle
  const handleBulkVisibility = async (visible: boolean) => {
    if (selectedOptions.size === 0) {
      alert('Please select options to update');
      return;
    }

    const result = await bulkToggleVisibility(Array.from(selectedOptions), visible);
    if (result.success) {
      setRentalOptions(prev => 
        prev.map(option => 
          selectedOptions.has(option.id)
            ? { ...option, visible }
            : option
        )
      );
      alert(`Selected options ${visible ? 'shown' : 'hidden'} successfully!`);
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rental Options</h1>
          <p className="text-gray-600">Manage additional services and rental options</p>
        </div>
        <Link href="/admin/setup/rental-options/new">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <FaPlus className="h-4 w-4" />
            <span>Add New Option</span>
          </button>
        </Link>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Link href="/admin/setup/rental-options/new">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
            <FaPlus className="h-4 w-4" />
            <span>Add New</span>
          </button>
        </Link>
        <button 
          onClick={handleBulkDelete}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <FaTrash className="h-4 w-4" />
          <span>Delete Selected</span>
        </button>
        <button 
          onClick={() => handleBulkVisibility(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <FaToggleOn className="h-4 w-4" />
          <span>Set to Visible</span>
        </button>
        <button 
          onClick={() => handleBulkVisibility(false)}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
        >
          <FaToggleOff className="h-4 w-4" />
          <span>Set to Not Visible</span>
        </button>
      </div>

      {/* Rental Options Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300"
                    checked={selectAll}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium">Icon</th>
                <th className="px-6 py-4 text-left text-sm font-medium">Name</th>
                <th className="px-6 py-4 text-center text-sm font-medium">Price Type</th>
                <th className="px-6 py-4 text-center text-sm font-medium">Max Cost</th>
                <th className="px-6 py-4 text-center text-sm font-medium">Visible</th>
                <th className="px-6 py-4 text-center text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rentalOptions.map((option, index) => (
                <tr key={option.id} className={`hover:bg-gray-50 ${selectedOptions.has(option.id) ? 'bg-blue-50' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300"
                      checked={selectedOptions.has(option.id)}
                      onChange={(e) => handleSelectOption(option.id, e.target.checked)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      {getOptionIcon(option.code)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    <Link href={`/admin/setup/rental-options/${option.id}`} className="hover:text-blue-600">
                      {option.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    {option.priceType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    {option.maxCost ? `€${option.maxCost.toFixed(2)}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {option.visible ? (
                      <FaToggleOn 
                        className="h-6 w-6 text-green-600 mx-auto cursor-pointer hover:text-green-700" 
                        onClick={() => handleToggleVisibility(option.id, option.visible)}
                        title="Click to hide"
                      />
                    ) : (
                      <FaToggleOff 
                        className="h-6 w-6 text-gray-400 mx-auto cursor-pointer hover:text-gray-500"
                        onClick={() => handleToggleVisibility(option.id, option.visible)}
                        title="Click to show"
                      />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    <div className="flex justify-center space-x-2">
                      <Link href={`/admin/setup/rental-options/${option.id}`}>
                        <button className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50" title="View">
                          <FaEye className="h-4 w-4" />
                        </button>
                      </Link>
                      <Link href={`/admin/setup/rental-options/${option.id}`}>
                        <button className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50" title="Edit">
                          <FaEdit className="h-4 w-4" />
                        </button>
                      </Link>
                      <button 
                        onClick={() => handleDeleteOption(option.id)}
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
      </div>

      {/* Rental Options Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaPlus className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Options</p>
              <p className="text-2xl font-bold text-gray-900">{rentalOptions.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaShieldAlt className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Insurance Options</p>
              <p className="text-2xl font-bold text-gray-900">
                {rentalOptions.filter(o => o.name.toLowerCase().includes('insurance') || o.name.toLowerCase().includes('damage') || o.name.toLowerCase().includes('waiver')).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaBaby className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Child Safety</p>
              <p className="text-2xl font-bold text-gray-900">
                {rentalOptions.filter(o => o.name.toLowerCase().includes('seat') || o.name.toLowerCase().includes('baby')).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaToggleOn className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Options</p>
              <p className="text-2xl font-bold text-gray-900">{rentalOptions.filter(o => o.visible).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Option Categories */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Option Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <FaShieldAlt className="h-6 w-6 text-blue-600 mr-2" />
              <h4 className="font-medium text-gray-900">Insurance & Protection</h4>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              {rentalOptions
                .filter(o => o.name.toLowerCase().includes('insurance') || o.name.toLowerCase().includes('damage') || o.name.toLowerCase().includes('waiver') || o.name.toLowerCase().includes('tyres'))
                .map(option => (
                  <li key={option.id}>• {option.name}</li>
                ))
              }
            </ul>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <FaBaby className="h-6 w-6 text-purple-600 mr-2" />
              <h4 className="font-medium text-gray-900">Child Safety</h4>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              {rentalOptions
                .filter(o => o.name.toLowerCase().includes('seat') || o.name.toLowerCase().includes('baby'))
                .map(option => (
                  <li key={option.id}>• {option.name}</li>
                ))
              }
            </ul>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <FaTools className="h-6 w-6 text-green-600 mr-2" />
              <h4 className="font-medium text-gray-900">Accessories</h4>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              {rentalOptions
                .filter(o => !o.name.toLowerCase().includes('insurance') && !o.name.toLowerCase().includes('damage') && !o.name.toLowerCase().includes('waiver') && !o.name.toLowerCase().includes('tyres') && !o.name.toLowerCase().includes('seat') && !o.name.toLowerCase().includes('baby'))
                .map(option => (
                  <li key={option.id}>• {option.name}</li>
                ))
              }
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalOptionsClient; 
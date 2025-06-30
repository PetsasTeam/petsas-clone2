"use client";

import React, { useState } from 'react';
import Select from 'react-select';
import Link from 'next/link';
import { FaSave, FaUndo, FaList, FaMoneyBillWave, FaPlus, FaTrash } from 'react-icons/fa';
import { updateRentalOption } from '../actions';

// All available vehicle groups in the system
const allVehicleGroups = [
  { value: 'A3', label: 'A3' }, { value: 'B3', label: 'B3' }, { value: 'C2', label: 'C2' }, { value: 'C4', label: 'C4' },
  { value: 'D1', label: 'D1' }, { value: 'D4', label: 'D4' }, { value: 'A5', label: 'A5' }, { value: 'B5', label: 'B5' },
  { value: 'C3', label: 'C3' }, { value: 'D5', label: 'D5' }, { value: 'D6', label: 'D6' }, { value: 'D7', label: 'D7' },
  { value: 'T1', label: 'T1' }, { value: 'EW', label: 'EW' }, { value: 'EY', label: 'EY' }, { value: 'H1', label: 'H1' },
  { value: 'H2', label: 'H2' }, { value: 'T5', label: 'T5' }, { value: 'V3', label: 'V3' }, { value: 'V5', label: 'V5' },
  { value: 'E3', label: 'E3' }, { value: 'EC', label: 'EC' }, { value: 'EH', label: 'EH' }, { value: 'EQ', label: 'EQ' },
  { value: 'E5', label: 'E5' }, { value: 'G3', label: 'G3' }, { value: 'ER', label: 'ER' }, { value: 'H6', label: 'H6' },
  { value: 'H7', label: 'H7' }, { value: 'T8', label: 'T8' }, { value: 'T6', label: 'T6' }, { value: 'V7', label: 'V7' },
  { value: 'V9', label: 'V9' }, { value: 'W3', label: 'W3' }, { value: 'V8', label: 'V8' }, { value: 'G4', label: 'G4' },
  { value: 'G9', label: 'G9' }, { value: 'G5', label: 'G5' },
];

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

interface PricingTier {
  id: string;
  vehicleGroups: string;
  price: number;
}

interface RentalOptionDetailClientProps {
  rentalOption: RentalOption;
}

const RentalOptionDetailClient: React.FC<RentalOptionDetailClientProps> = ({ rentalOption: initialOption }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'details'>('details');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTiers, setSelectedTiers] = useState<Set<string>>(new Set());
  const [selectAllTiers, setSelectAllTiers] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [currentImagePath, setCurrentImagePath] = useState(initialOption.photo);

  // Form state for general tab
  const [generalData, setGeneralData] = useState({
    code: initialOption.code,
    name: initialOption.name,
    displayOrder: initialOption.displayOrder,
    visible: initialOption.visible,
    maxQty: initialOption.maxQty,
    priceType: initialOption.priceType,
    maxCost: initialOption.maxCost || '',
    freeOverDays: initialOption.freeOverDays || '',
    description: initialOption.description || '',
  });

  // State for pricing tiers
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>(initialOption.pricingTiers);

  const handleGeneralInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setGeneralData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleGroupChange = (selectedOptions: any, tierId: string) => {
    const updatedTiers = pricingTiers.map(tier => {
      if (tier.id === tierId) {
        return { ...tier, vehicleGroups: selectedOptions.map((opt: any) => opt.value).join(',') };
      }
      return tier;
    });
    setPricingTiers(updatedTiers);
  };

  const handleSelectAllGroups = (tierId: string) => {
    const updatedTiers = pricingTiers.map(tier => {
      if (tier.id === tierId) {
        return { ...tier, vehicleGroups: allVehicleGroups.map(group => group.value).join(',') };
      }
      return tier;
    });
    setPricingTiers(updatedTiers);
  };

  const handleClearAllGroups = (tierId: string) => {
    const updatedTiers = pricingTiers.map(tier => {
      if (tier.id === tierId) {
        return { ...tier, vehicleGroups: '' };
      }
      return tier;
    });
    setPricingTiers(updatedTiers);
  };

  const handlePriceChange = (tierId: string, price: string) => {
    const updatedTiers = pricingTiers.map(tier => {
      if (tier.id === tierId) {
        return { ...tier, price: parseFloat(price) || 0 };
      }
      return tier;
    });
    setPricingTiers(updatedTiers);
  };

  const handleSelectTier = (tierId: string, checked: boolean) => {
    setSelectedTiers(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(tierId);
      } else {
        newSet.delete(tierId);
      }
      return newSet;
    });
  };

  const handleSelectAllTiers = (checked: boolean) => {
    setSelectAllTiers(checked);
    if (checked) {
      setSelectedTiers(new Set(pricingTiers.map(tier => tier.id)));
    } else {
      setSelectedTiers(new Set());
    }
  };

  const handleAddNewTier = () => {
    const newTier: PricingTier = {
      id: `new-${Date.now()}`,
      vehicleGroups: '',
      price: 0
    };
    setPricingTiers(prev => [...prev, newTier]);
  };

  const handleAddNewTierWithAllGroups = () => {
    const newTier: PricingTier = {
      id: `new-${Date.now()}`,
      vehicleGroups: allVehicleGroups.map(group => group.value).join(','),
      price: 0
    };
    setPricingTiers(prev => [...prev, newTier]);
  };

  const handleDeleteSelectedTiers = () => {
    if (selectedTiers.size === 0) {
      alert('Please select tiers to delete');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedTiers.size} selected tier(s)?`)) {
      setPricingTiers(prev => prev.filter(tier => !selectedTiers.has(tier.id)));
      setSelectedTiers(new Set());
      setSelectAllTiers(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setIsUploadingImage(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('rentalOptionId', initialOption.id);

      const response = await fetch('/api/admin/rental-options/upload-image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setCurrentImagePath(result.imagePath);
        alert('Image uploaded successfully!');
      } else {
        alert(`Upload failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setIsUploadingImage(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Prepare the data
      const rentalOptionData = {
        code: generalData.code,
        name: generalData.name,
        displayOrder: generalData.displayOrder,
        visible: generalData.visible,
        maxQty: generalData.maxQty,
        priceType: generalData.priceType,
        maxCost: generalData.maxCost ? parseFloat(generalData.maxCost.toString()) : null,
        freeOverDays: generalData.freeOverDays ? parseInt(generalData.freeOverDays.toString()) : null,
        photo: currentImagePath,
        description: generalData.description || null,
      };

      const pricingTierData = pricingTiers.map(tier => ({
        vehicleGroups: tier.vehicleGroups,
        price: tier.price
      }));

      const result = await updateRentalOption(initialOption.id, rentalOptionData, pricingTierData);
      
      if (result.success) {
        alert('Rental option updated successfully!');
        // Update the pricing tiers with new IDs from the database
        if (result.data) {
          setPricingTiers(result.data.pricingTiers);
        }
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert('An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const customStyles = {
    container: (provided: any) => ({
      ...provided,
      position: 'relative',
    }),
    control: (provided: any) => ({
      ...provided,
      borderColor: '#d1d5db',
      borderRadius: '0.375rem',
      minHeight: '38px',
      boxShadow: 'none',
       '&:hover': {
         borderColor: '#a5b4fc',
       },
    }),
    valueContainer: (provided: any) => ({
        ...provided,
        padding: '2px 6px'
    }),
    input: (provided: any) => ({
        ...provided,
        margin: '0px',
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    indicatorsContainer: (provided: any) => ({
        ...provided,
        height: '38px',
    }),
    menu: (provided: any) => ({
      ...provided,
      zIndex: 99999,
      backgroundColor: 'white',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      minWidth: '100%',
      maxHeight: '200px',
      overflow: 'hidden',
    }),
    menuList: (provided: any) => ({
      ...provided,
      maxHeight: '200px',
      overflow: 'auto',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#f3f4f6' : 'white',
      color: state.isSelected ? 'white' : '#374151',
      padding: '8px 12px',
      cursor: 'pointer',
      fontSize: '14px',
      '&:hover': {
        backgroundColor: state.isSelected ? '#3b82f6' : '#f3f4f6',
      },
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: '#dbeafe',
      borderRadius: '0.25rem',
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: '#1e40af',
      fontSize: '12px',
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      color: '#1e40af',
      '&:hover': {
        backgroundColor: '#bfdbfe',
        color: '#1e40af',
      },
    }),
  };

  return (
    <div className="space-y-6">
      {/* Header with Breadcrumbs */}
      <div>
        <div className="text-sm text-gray-500 mb-2">
          <Link href="/admin/setup/rental-options" className="hover:text-gray-700">System Setup</Link> &gt; 
          <Link href="/admin/setup/rental-options" className="hover:text-gray-700"> Rental Options</Link> &gt;
          <span className="font-medium text-gray-800"> {generalData.name}</span>
        </div>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Edit Rental Option</h1>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaSave className="h-4 w-4" />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 text-sm font-medium flex items-center space-x-2 ${
            activeTab === 'general'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FaList />
          <span>General</span>
        </button>
        <button
          onClick={() => setActiveTab('details')}
          className={`px-4 py-2 text-sm font-medium flex items-center space-x-2 ${
            activeTab === 'details'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FaMoneyBillWave />
          <span>Rental Option Details</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">ID</label>
              <input type="text" value={initialOption.id} readOnly className="mt-1 w-full p-2 bg-gray-100 border-gray-300 rounded-md"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Display Order</label>
              <input 
                type="number" 
                name="displayOrder"
                value={generalData.displayOrder} 
                onChange={handleGeneralInputChange}
                className="mt-1 w-full p-2 border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Code</label>
              <input 
                type="text" 
                name="code"
                value={generalData.code} 
                onChange={handleGeneralInputChange}
                className="mt-1 w-full p-2 border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Qty</label>
              <input 
                type="number" 
                name="maxQty"
                value={generalData.maxQty} 
                onChange={handleGeneralInputChange}
                className="mt-1 w-full p-2 border-gray-300 rounded-md"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input 
                type="text" 
                name="name"
                value={generalData.name} 
                onChange={handleGeneralInputChange}
                className="mt-1 w-full p-2 border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Price Type</label>
              <select 
                name="priceType"
                value={generalData.priceType} 
                onChange={handleGeneralInputChange}
                className="mt-1 w-full p-2 border-gray-300 rounded-md"
              >
                <option value="per Day">per Day</option>
                <option value="per Rental">per Rental</option>
                <option value="per day per driver">per day per driver</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Cost (€)</label>
              <input 
                type="number" 
                step="0.01"
                name="maxCost"
                value={generalData.maxCost} 
                onChange={handleGeneralInputChange}
                placeholder="e.g. 40.00" 
                className="mt-1 w-full p-2 border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Free Over Days</label>
              <input 
                type="number" 
                name="freeOverDays"
                value={generalData.freeOverDays} 
                onChange={handleGeneralInputChange}
                className="mt-1 w-full p-2 border-gray-300 rounded-md"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea 
                name="description"
                value={generalData.description} 
                onChange={handleGeneralInputChange}
                rows={3}
                className="mt-1 w-full p-2 border-gray-300 rounded-md"
                placeholder="Optional description of the rental option"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Photo</label>
              <div className="mt-2 flex items-center space-x-4">
                <img 
                  src={currentImagePath || '/admin-icons/default-icon.gif'} 
                  alt="icon" 
                  className="h-16 w-16 bg-gray-100 p-1 rounded-md border object-contain"
                />
                <div className="flex flex-col space-y-2">
                  <input 
                    type="file" 
                    className="text-sm" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploadingImage}
                  />
                  {isUploadingImage && (
                    <p className="text-xs text-blue-600">Uploading...</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Upload a new icon (optional) - Max 5MB, JPG/PNG/GIF
                  </p>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Visible</label>
              <div className="flex items-center mt-2">
                <input 
                  type="checkbox" 
                  name="visible"
                  checked={generalData.visible} 
                  onChange={handleGeneralInputChange}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-900">This option is visible during checkout</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'details' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 flex justify-start space-x-2">
            <button 
              onClick={handleAddNewTier}
              className="bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 flex items-center space-x-2 text-sm"
            >
              <FaPlus /><span>Add New</span>
            </button>
            <button 
              onClick={handleAddNewTierWithAllGroups}
              className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 flex items-center space-x-2 text-sm"
            >
              <FaPlus /><span>Add with All Groups</span>
            </button>
            <button 
              onClick={handleDeleteSelectedTiers}
              className="bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 flex items-center space-x-2 text-sm"
            >
              <FaTrash /><span>Delete Selected</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium w-1/12">
                    <input 
                      type="checkbox" 
                      className="rounded"
                      checked={selectAllTiers}
                      onChange={(e) => handleSelectAllTiers(e.target.checked)}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium w-8/12">Group(s)</th>
                  <th className="px-4 py-3 text-left text-sm font-medium w-3/12">Price (€)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pricingTiers.map((tier) => (
                  <tr key={tier.id} className={selectedTiers.has(tier.id) ? 'bg-blue-50' : ''}>
                    <td className="px-4 py-2">
                      <input 
                        type="checkbox" 
                        className="rounded"
                        checked={selectedTiers.has(tier.id)}
                        onChange={(e) => handleSelectTier(tier.id, e.target.checked)}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 mb-2">
                          <button
                            type="button"
                            onClick={() => handleSelectAllGroups(tier.id)}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                          >
                            Select All
                          </button>
                          <button
                            type="button"
                            onClick={() => handleClearAllGroups(tier.id)}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                          >
                            Clear All
                          </button>
                          <span className="text-xs text-gray-500">
                            ({tier.vehicleGroups.split(',').filter(g => g).length} selected)
                          </span>
                        </div>
                      <Select
                        isMulti
                        options={allVehicleGroups}
                        styles={customStyles}
                        value={tier.vehicleGroups.split(',').filter(g => g).map(g => ({ value: g, label: g }))}
                        onChange={(selected) => handleGroupChange(selected, tier.id)}
                        className="w-full text-sm"
                        placeholder="Select groups..."
                          isSearchable={true}
                          menuPlacement="auto"
                          maxMenuHeight={200}
                      />
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        type="number" 
                        step="0.01"
                        value={tier.price} 
                        onChange={(e) => handlePriceChange(tier.id, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 px-4 py-3 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaSave className="h-4 w-4" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentalOptionDetailClient; 
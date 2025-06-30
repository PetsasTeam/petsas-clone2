'use client';

import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes } from 'react-icons/fa';
import { updateVehicle, createVehicle } from '../actions';

// Updated to match the VehicleGroup interface from parent
interface VehicleData {
  id: string;
  group: string;
  name: string;
  model: string;
  image: string;
  pricePerDay: number;
  visible: boolean;
  categoryId: string;
  code: string;
  engineSize?: string | null;
  doors?: number | null;
  seats?: number | null;
  transmission?: string | null;
  hasAC?: boolean | null;
  adults?: number | null;
  children?: number | null;
  bigLuggages?: number | null;
  smallLuggages?: number | null;
}

interface EditVehicleModalProps {
  vehicle: VehicleData | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (updatedVehicle: VehicleData) => void; // Pass back the updated vehicle data
}

const EditVehicleModal: React.FC<EditVehicleModalProps> = ({ vehicle, isOpen, onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    name: '',
    group: '',
    code: '',
    visible: true,
    engineSize: '',
    doors: 4,
    seats: 5,
    transmission: 'Manual',
    hasAC: true,
    adults: 4,
    children: 0,
    bigLuggages: 1,
    smallLuggages: 1
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (vehicle) {
      setFormData({
        name: vehicle.name,
        group: vehicle.group,
        code: vehicle.code,
        visible: vehicle.visible,
        engineSize: vehicle.engineSize || '',
        doors: vehicle.doors ?? 4,
        seats: vehicle.seats ?? 5,
        transmission: vehicle.transmission || 'Manual',
        hasAC: vehicle.hasAC ?? true,
        adults: vehicle.adults ?? 4,
        children: vehicle.children ?? 0,
        bigLuggages: vehicle.bigLuggages ?? 1,
        smallLuggages: vehicle.smallLuggages ?? 1
      });
    }
  }, [vehicle]);

  if (!isOpen || !vehicle) return null;

  const isCreating = vehicle.id === 'new';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      let result;
      if (isCreating) {
        result = await createVehicle(vehicle.categoryId, formData);
        if (result.success && result.vehicle) {
          alert('Vehicle created successfully!');
          // Create new vehicle object with the returned data
          const newVehicle: VehicleData = {
            id: result.vehicle.id,
            name: result.vehicle.name,
            group: result.vehicle.group,
            visible: result.vehicle.visible,
            model: result.vehicle.name, // Use name as model for consistency
            image: result.vehicle.image,
            pricePerDay: 0, // Default value since it's not in the schema
            categoryId: result.vehicle.categoryId,
            code: result.vehicle.code,
            engineSize: result.vehicle.engineSize,
            doors: result.vehicle.doors,
            seats: result.vehicle.seats,
            transmission: result.vehicle.transmission,
            hasAC: result.vehicle.hasAC,
            adults: result.vehicle.adults,
            children: result.vehicle.children,
            bigLuggages: result.vehicle.bigLuggages,
            smallLuggages: result.vehicle.smallLuggages
          };
          onSaved?.(newVehicle);
          onClose();
        } else {
          alert(`Error: ${result.error}`);
        }
      } else {
        result = await updateVehicle(vehicle.id, vehicle.categoryId, formData);
        if (result.success) {
          alert('Vehicle updated successfully!');
          // Create updated vehicle object with the new data
          const updatedVehicle: VehicleData = {
            ...vehicle,
            name: formData.name,
            group: formData.group,
            visible: formData.visible,
            model: formData.name, // Update model to match name since they show the same data
            code: formData.code,
            engineSize: formData.engineSize,
            doors: formData.doors,
            seats: formData.seats,
            transmission: formData.transmission,
            hasAC: formData.hasAC,
            adults: formData.adults,
            children: formData.children,
            bigLuggages: formData.bigLuggages,
            smallLuggages: formData.smallLuggages
          };
          onSaved?.(updatedVehicle); // Pass back the updated vehicle data
          onClose();
        } else {
          alert(`Error: ${result.error}`);
        }
      }
    } catch (error) {
      alert('An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-lg font-semibold">
            {isCreating ? 'Add New Vehicle Group' : 'Edit Vehicle Group'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <FaTimes />
          </button>
        </div>
        
        {/* Vehicle Info Display - only show for existing vehicles */}
        {!isCreating && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <img 
                src={vehicle.image} 
                alt={vehicle.name} 
                className="h-16 w-20 object-cover rounded"
              />
              <div>
                <p className="text-sm text-gray-600">Editing Vehicle:</p>
                <p className="font-semibold text-blue-600">Group {vehicle.group}</p>
                <p className="text-sm text-gray-700">{vehicle.name}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group Code
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="group"
                value={formData.group}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., A3, B5, C2"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Short code used for grouping vehicles (e.g., A3, B5)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Car Code
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., MBMV, EDAV"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Unique car code (e.g., MBMV, EDAV)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Engine Size</label>
              <input
                type="text"
                name="engineSize"
                value={formData.engineSize}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="e.g., 1200cc"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doors</label>
                <input
                  type="number"
                  name="doors"
                  value={formData.doors}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  min={2}
                  max={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seats</label>
                <input
                  type="number"
                  name="seats"
                  value={formData.seats}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  min={2}
                  max={9}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
                <select
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                >
                  <option value="Manual">Manual</option>
                  <option value="Automatic">Automatic</option>
                </select>
              </div>
              <div className="flex items-center mt-6">
                <input
                  type="checkbox"
                  name="hasAC"
                  checked={formData.hasAC}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 block text-sm font-medium text-gray-700">A/C</label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adults</label>
                <input
                  type="number"
                  name="adults"
                  value={formData.adults}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  min={1}
                  max={9}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Children</label>
                <input
                  type="number"
                  name="children"
                  value={formData.children}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  min={0}
                  max={9}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Big Luggages</label>
                <input
                  type="number"
                  name="bigLuggages"
                  value={formData.bigLuggages}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  min={0}
                  max={9}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Small Luggages</label>
                <input
                  type="number"
                  name="smallLuggages"
                  value={formData.smallLuggages}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  min={0}
                  max={9}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Name / Model Description
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., HYUNDAI i10 A/C or similar"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Full vehicle name as it appears to customers</p>
            </div>
            
            <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
              <input
                type="checkbox"
                name="visible"
                checked={formData.visible}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Visible to Customers
                </label>
                <p className="text-xs text-gray-600">
                  {formData.visible ? 'This vehicle will appear on the website' : 'This vehicle will be hidden from customers'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSaving}
            >
              <FaSave className="mr-2" />
              {isSaving ? 'Saving...' : (isCreating ? 'Create Vehicle' : 'Save Changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVehicleModal;

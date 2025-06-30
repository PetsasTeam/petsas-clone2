'use client';

import React, { useState } from 'react';
import { FaCar, FaList, FaEdit, FaToggleOn, FaEye, FaTrash, FaImage, FaToggleOff, FaPlus } from 'react-icons/fa';
import { deleteVehicle, updateCategory, updateVehicle, createVehicle } from '../actions';
import EditVehicleModal from './EditVehicleModal';
// import VehicleImageUpload from '../../../vehicles/VehicleImageUpload';

// Define the types for the props
interface Category {
  id: string;
  name: string;
  displayOrder: number;
  visible: boolean;
}

interface VehicleGroup {
  id: string;
  group: string; // e.g., A3
  name: string; // e.g., HYUNDAI i10 A/C
  model: string; // The original `name` from the DB, for consistency
  image: string;
  pricePerDay: number;
  visible: boolean;
  categoryId: string;
  code: string; // Added code property
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

interface EditCategoryClientProps {
  category: Category;
  vehicleGroups: VehicleGroup[];
  onSave: () => void;
}

const EditCategoryClient: React.FC<EditCategoryClientProps> = ({ category, vehicleGroups: initialVehicleGroups, onSave }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'groups'>('general');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleGroup | null>(null);
  const [vehicleGroups, setVehicleGroups] = useState(
    [...initialVehicleGroups].sort((a, b) => a.group.localeCompare(b.group))
  );
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleGroup | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedVehicles, setSelectedVehicles] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [viewingVehicle, setViewingVehicle] = useState<VehicleGroup | null>(null);
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  
  // State for General tab form data
  const [categoryData, setCategoryData] = useState({
    name: category.name,
    displayOrder: category.displayOrder,
    visible: category.visible
  });

  const handleVehicleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this vehicle group?')) {
      const result = await deleteVehicle(id);
      if (result.success) {
        // Remove from local state
        setVehicleGroups(prev => prev.filter(v => v.id !== id));
        // Remove from selection if selected
        setSelectedVehicles(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        alert('Vehicle deleted successfully!');
      } else {
        alert(`Error: ${result.error}`);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedVehicles.size === 0) {
      alert('Please select vehicles to delete');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedVehicles.size} selected vehicle(s)?`)) {
      const deletePromises = Array.from(selectedVehicles).map(id => deleteVehicle(id));
      const results = await Promise.all(deletePromises);
      
      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;
      
      if (successCount > 0) {
        // Remove successfully deleted vehicles from local state
        setVehicleGroups(prev => prev.filter(v => !selectedVehicles.has(v.id)));
        setSelectedVehicles(new Set());
        setSelectAll(false);
      }
      
      if (failCount > 0) {
        alert(`${successCount} vehicles deleted successfully. ${failCount} failed to delete.`);
      } else {
        alert(`${successCount} vehicles deleted successfully!`);
      }
    }
  };

  const handleSelectVehicle = (vehicleId: string, checked: boolean) => {
    setSelectedVehicles(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(vehicleId);
      } else {
        newSet.delete(vehicleId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedVehicles(new Set(vehicleGroups.map(v => v.id)));
    } else {
      setSelectedVehicles(new Set());
    }
  };

  const handleToggleVehicleVisibility = async (vehicleId: string, currentVisibility: boolean) => {
    const vehicle = vehicleGroups.find(v => v.id === vehicleId);
    if (!vehicle) return;

    const result = await updateVehicle(vehicleId, vehicle.categoryId, {
      name: vehicle.name,
      group: vehicle.group,
      visible: !currentVisibility,
      engineSize: vehicle.engineSize || '',
      doors: vehicle.doors || 4,
      seats: vehicle.seats || 5,
      transmission: vehicle.transmission || 'Manual',
      hasAC: vehicle.hasAC || true,
      adults: vehicle.adults || 4,
      children: vehicle.children || 0,
      bigLuggages: vehicle.bigLuggages || 1,
      smallLuggages: vehicle.smallLuggages || 1
    });

    if (result.success) {
      setVehicleGroups(prev => 
        prev.map(v => 
          v.id === vehicleId 
            ? { ...v, visible: !currentVisibility }
            : v
        )
      );
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const handleViewVehicle = (vehicle: VehicleGroup) => {
    setViewingVehicle(vehicle);
  };

  const handleEditVehicle = (vehicle: VehicleGroup) => {
    setEditingVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVehicle(null);
  };

  const handleVehicleSaved = (updatedVehicle: VehicleGroup) => {
    if (editingVehicle?.id === 'new') {
      // Adding a new vehicle - add it to the list and re-sort
      setVehicleGroups(prev => [...prev, updatedVehicle].sort((a, b) => a.group.localeCompare(b.group)));
    } else {
      // Update the local state with the edited vehicle data and re-sort
      setVehicleGroups(prev => {
        const updated = prev.map(vehicle => 
          vehicle.id === updatedVehicle.id 
            ? { ...vehicle, ...updatedVehicle } // Merge the updated data
            : vehicle
        );
        return updated.sort((a, b) => a.group.localeCompare(b.group));
      });
    }
  };

  const handleImageClick = (vehicle: VehicleGroup) => {
    setSelectedVehicle(vehicle);
    setShowImageUpload(true);
  };

  const handleImageUpdated = (vehicleId: string, newImagePath: string) => {
    setVehicleGroups(prevGroups => 
      prevGroups.map(group => 
        group.id === vehicleId 
          ? { ...group, image: newImagePath }
          : group
      )
    );
  };

  const handleCloseImageUpload = () => {
    setShowImageUpload(false);
    setSelectedVehicle(null);
  };

  const handleSaveCategory = async () => {
    setIsSaving(true);
    try {
      const result = await updateCategory(category.id, categoryData);
      if (result.success) {
        alert('Category updated successfully!');
        onSave(); // Refresh the parent component
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert('An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setCategoryData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || 0 : value)
    }));
  };

  const handleAddVehicle = () => {
    // Create a new vehicle object to add
    const newVehicle: VehicleGroup = {
      id: 'new', // Temporary ID for the modal
      group: '',
      name: '',
      model: '',
      image: '/vehicles/vehicle-placeholder.jpg',
      pricePerDay: 0,
      visible: true,
      categoryId: category.id,
      code: '',
      engineSize: undefined,
      doors: undefined,
      seats: undefined,
      transmission: undefined,
      hasAC: undefined,
      adults: undefined,
      children: undefined,
      bigLuggages: undefined,
      smallLuggages: undefined
    };
    setEditingVehicle(newVehicle);
    setIsModalOpen(true);
    setIsAddingVehicle(false);
  };

  return (
    <>
      <EditVehicleModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        vehicle={editingVehicle}
        onSaved={handleVehicleSaved}
      />

      {/* Vehicle View Modal */}
      {viewingVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-lg font-semibold">Vehicle Details</h3>
              <button onClick={() => setViewingVehicle(null)} className="text-gray-500 hover:text-gray-800">
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Group Code</label>
                  <p className="text-lg font-semibold text-blue-600">{viewingVehicle.group}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vehicle Name</label>
                  <p className="text-lg">{viewingVehicle.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Model Description</label>
                  <p className="text-lg">{viewingVehicle.model}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price per Day</label>
                  <p className="text-lg font-semibold text-green-600">€{viewingVehicle.pricePerDay.toFixed(2)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Visibility Status</label>
                  <p className={`text-lg font-semibold ${viewingVehicle.visible ? 'text-green-600' : 'text-red-600'}`}>
                    {viewingVehicle.visible ? 'Visible to customers' : 'Hidden from customers'}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Image</label>
                <img 
                  src={viewingVehicle.image} 
                  alt={viewingVehicle.name} 
                  className="w-full h-48 object-cover rounded-lg border"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button 
                onClick={() => {
                  setViewingVehicle(null);
                  handleEditVehicle(viewingVehicle);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Edit Vehicle
              </button>
              <button 
                onClick={() => setViewingVehicle(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Upload Modal */}
      {showImageUpload && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-lg font-semibold">Upload Vehicle Image</h3>
              <button onClick={handleCloseImageUpload} className="text-gray-500 hover:text-gray-800">
                ✕
              </button>
            </div>
            <p className="text-gray-600">Image upload functionality will be available soon.</p>
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleCloseImageUpload}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 text-sm font-medium flex items-center space-x-2 ${
            activeTab === 'general' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FaList />
          <span>General</span>
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={`px-4 py-2 text-sm font-medium flex items-center space-x-2 ${
            activeTab === 'groups' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FaCar />
          <span>Groups</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {activeTab === 'general' && (
          <form onSubmit={(e) => { e.preventDefault(); handleSaveCategory(); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                <input type="text" value={category.id} readOnly className="w-full p-2 bg-gray-100 border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                <input 
                  type="number" 
                  name="displayOrder"
                  value={categoryData.displayOrder} 
                  onChange={handleInputChange}
                  className="w-full p-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
                <p className="text-xs text-gray-500 mt-1">Lower numbers appear first on the website</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={categoryData.name} 
                  onChange={handleInputChange}
                  className="w-full p-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Visible</label>
                <div className="flex items-center mt-2">
                  <input 
                    type="checkbox" 
                    name="visible"
                    checked={categoryData.visible} 
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-900">This category is visible on the website</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Unchecked categories won't appear to customers</p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                type="submit"
                disabled={isSaving}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'groups' && (
           <div className="space-y-4">
               <div className="flex justify-between items-center">
                 <h3 className="text-lg font-semibold text-gray-900">Vehicle Groups in '{categoryData.name}'</h3>
                 <div className="flex space-x-2">
                   <button 
                     onClick={handleAddVehicle}
                     className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm flex items-center space-x-2"
                   >
                     <FaPlus className="h-4 w-4" />
                     <span>Add New Vehicle</span>
                   </button>
                   {selectedVehicles.size > 0 && (
                     <button 
                       onClick={handleBulkDelete}
                       className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
                     >
                       Delete Selected ({selectedVehicles.size})
                     </button>
                   )}
                 </div>
               </div>
               <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-blue-600 text-white">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium">
                              <input 
                                type="checkbox" 
                                className="rounded"
                                checked={selectAll}
                                onChange={(e) => handleSelectAll(e.target.checked)}
                              />
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Image</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Group</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Car Code</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Model Description</th>
                            <th className="px-4 py-3 text-center text-sm font-medium">Visible</th>
                            <th className="px-4 py-3 text-center text-sm font-medium">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {vehicleGroups.map((group) => (
                            <tr key={group.id} className={selectedVehicles.has(group.id) ? 'bg-blue-50' : ''}>
                            <td className="px-4 py-3">
                              <input 
                                type="checkbox" 
                                className="rounded"
                                checked={selectedVehicles.has(group.id)}
                                onChange={(e) => handleSelectVehicle(group.id, e.target.checked)}
                              />
                            </td>
                            <td className="px-4 py-3">
                              <img 
                                src={group.image} 
                                alt={group.name} 
                                className="h-12 w-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity" 
                                onClick={() => handleImageClick(group)}
                                title="Click to change image"
                              />
                            </td>
                            <td className="px-4 py-2 font-bold text-blue-700">{group.group}</td>
                            <td className="px-4 py-2 font-mono text-green-700">{group.code}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">{group.name}</td>
                            <td className="px-4 py-3 text-sm">{group.model}</td>
                            <td className="px-4 py-3 text-center">
                                {group.visible ? (
                                  <FaToggleOn 
                                    className="h-6 w-6 text-green-600 mx-auto cursor-pointer hover:text-green-700" 
                                    onClick={() => handleToggleVehicleVisibility(group.id, group.visible)}
                                    title="Click to hide vehicle"
                                  />
                                ) : (
                                  <FaToggleOff 
                                    className="h-6 w-6 text-gray-400 mx-auto cursor-pointer hover:text-gray-500"
                                    onClick={() => handleToggleVehicleVisibility(group.id, group.visible)}
                                    title="Click to show vehicle"
                                  />
                                )}
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex justify-center items-center space-x-2 text-gray-600">
                                  <button 
                                    onClick={() => handleViewVehicle(group)}
                                    className="hover:text-blue-600 p-1" 
                                    title="View Details"
                                  >
                                    <FaEye/>
                                  </button>
                                  <button 
                                    onClick={() => handleEditVehicle(group)} 
                                    className="hover:text-green-600 p-1" 
                                    title="Edit"
                                  >
                                    <FaEdit/>
                                  </button>
                                  <button 
                                    onClick={() => handleImageClick(group)} 
                                    className="hover:text-purple-600 p-1" 
                                    title="Change Image"
                                  >
                                    <FaImage/>
                                  </button>
                                  <button 
                                    onClick={() => handleVehicleDelete(group.id)} 
                                    className="hover:text-red-600 p-1" 
                                    title="Delete"
                                  >
                                    <FaTrash/>
                                  </button>
                                </div>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
           </div>
        )}
      </div>
    </>
  );
};

export default EditCategoryClient; 
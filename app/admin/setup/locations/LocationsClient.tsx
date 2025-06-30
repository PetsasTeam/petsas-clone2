'use client';

import React, { useState, useTransition } from 'react';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaToggleOn,
  FaToggleOff,
  FaMapMarkerAlt,
  FaPlane,
  FaBuilding,
  FaHotel,
  FaTimes,
  FaCheck,
  FaSpinner
} from 'react-icons/fa';
import { 
  Location, 
  deleteLocation, 
  bulkDeleteLocations, 
  toggleLocationVisibility, 
  bulkToggleVisibility,
  moveLocationUp,
  moveLocationDown,
  createLocation,
  updateLocation,
  CreateLocationData,
  UpdateLocationData
} from './actions';

interface LocationsClientProps {
  initialLocations: Location[];
}

const LocationsClient: React.FC<LocationsClientProps> = ({ initialLocations }) => {
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isPending, startTransition] = useTransition();

  const getLocationTypeIcon = (type: string) => {
    switch (type) {
      case 'Airport':
        return <FaPlane className="h-6 w-6 text-blue-600" />;
      case 'Office':
        return <FaBuilding className="h-6 w-6 text-green-600" />;
      case 'Hotel':
        return <FaHotel className="h-6 w-6 text-purple-600" />;
      default:
        return <FaMapMarkerAlt className="h-6 w-6 text-gray-600" />;
    }
  };

  const getLocationTypeColor = (type: string) => {
    switch (type) {
      case 'Airport':
        return 'bg-blue-100 text-blue-800';
      case 'Office':
        return 'bg-green-100 text-green-800';
      case 'Hotel':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(locations.map(l => l.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectLocation = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this location?')) {
      startTransition(async () => {
        try {
          await deleteLocation(id);
          setLocations(prev => prev.filter(l => l.id !== id));
        } catch (error) {
          alert('Failed to delete location');
        }
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedIds.size} location(s)?`)) {
      startTransition(async () => {
        try {
          await bulkDeleteLocations(Array.from(selectedIds));
          setLocations(prev => prev.filter(l => !selectedIds.has(l.id)));
          setSelectedIds(new Set());
        } catch (error) {
          alert('Failed to delete locations');
        }
      });
    }
  };

  const handleToggleVisibility = async (id: string) => {
    startTransition(async () => {
      try {
        const updatedLocation = await toggleLocationVisibility(id);
        setLocations(prev => prev.map(l => l.id === id ? updatedLocation : l));
      } catch (error) {
        alert('Failed to toggle visibility');
      }
    });
  };

  const handleBulkToggleVisibility = async (visible: boolean) => {
    if (selectedIds.size === 0) return;
    
    startTransition(async () => {
      try {
        await bulkToggleVisibility(Array.from(selectedIds), visible);
        setLocations(prev => prev.map(l => 
          selectedIds.has(l.id) ? { ...l, visible } : l
        ));
        setSelectedIds(new Set());
      } catch (error) {
        alert('Failed to toggle visibility');
      }
    });
  };

  const handleMoveUp = async (id: string) => {
    startTransition(async () => {
      try {
        await moveLocationUp(id);
        // Refresh locations to get updated order
        window.location.reload();
      } catch (error) {
        alert('Failed to move location up');
      }
    });
  };

  const handleMoveDown = async (id: string) => {
    startTransition(async () => {
      try {
        await moveLocationDown(id);
        // Refresh locations to get updated order
        window.location.reload();
      } catch (error) {
        alert('Failed to move location down');
      }
    });
  };

  const handleView = (location: Location) => {
    setSelectedLocation(location);
    setShowViewModal(true);
  };

  const handleEdit = (location: Location) => {
    setSelectedLocation(location);
    setShowEditModal(true);
  };

  const handleCreate = () => {
    setSelectedLocation(null);
    setShowCreateModal(true);
  };

  const stats = {
    total: locations.length,
    airports: locations.filter(l => l.type === 'Airport').length,
    offices: locations.filter(l => l.type === 'Office').length,
    active: locations.filter(l => l.visible).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Locations Management</h1>
          <p className="text-gray-600">Manage pickup and drop-off locations</p>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <FaPlus className="h-4 w-4" />
          <span>Add New Location</span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button 
          onClick={handleCreate}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <FaPlus className="h-4 w-4" />
          <span>Add New</span>
        </button>
        <button 
          onClick={handleBulkDelete}
          disabled={selectedIds.size === 0 || isPending}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaTrash className="h-4 w-4" />
          <span>Delete Selected ({selectedIds.size})</span>
        </button>
        <button 
          onClick={() => handleBulkToggleVisibility(true)}
          disabled={selectedIds.size === 0 || isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaToggleOn className="h-4 w-4" />
          <span>Set to Visible</span>
        </button>
        <button 
          onClick={() => handleBulkToggleVisibility(false)}
          disabled={selectedIds.size === 0 || isPending}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaToggleOff className="h-4 w-4" />
          <span>Set to Not Visible</span>
        </button>
      </div>

      {/* Locations Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300"
                    checked={selectedIds.size === locations.length && locations.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium">Icon</th>
                <th className="px-6 py-4 text-left text-sm font-medium">Name</th>
                <th className="px-6 py-4 text-center text-sm font-medium">Type</th>
                <th className="px-6 py-4 text-center text-sm font-medium">Display Order</th>
                <th className="px-6 py-4 text-center text-sm font-medium">Visible</th>
                <th className="px-6 py-4 text-center text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {locations.map((location, index) => (
                <tr key={location.id} className={`hover:bg-gray-50 ${selectedIds.has(location.id) ? 'bg-blue-50' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300"
                      checked={selectedIds.has(location.id)}
                      onChange={(e) => handleSelectLocation(location.id, e.target.checked)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      {getLocationTypeIcon(location.type)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {location.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLocationTypeColor(location.type)}`}>
                      {location.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button 
                        onClick={() => handleMoveUp(location.id)}
                        disabled={isPending}
                        className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                      >
                        <span className="bg-blue-100 px-2 py-1 rounded text-xs">↑</span>
                      </button>
                      <span>{location.displayOrder}</span>
                      <button 
                        onClick={() => handleMoveDown(location.id)}
                        disabled={isPending}
                        className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                      >
                        <span className="bg-blue-100 px-2 py-1 rounded text-xs">↓</span>
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleToggleVisibility(location.id)}
                      disabled={isPending}
                      className="disabled:opacity-50"
                    >
                      {location.visible ? (
                        <FaToggleOn className="h-6 w-6 text-green-600 mx-auto cursor-pointer" />
                      ) : (
                        <FaToggleOff className="h-6 w-6 text-gray-400 mx-auto cursor-pointer" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    <div className="flex justify-center space-x-2">
                      <button 
                        onClick={() => handleView(location)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                      >
                        <FaEye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEdit(location)}
                        className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                      >
                        <FaEdit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(location.id)}
                        disabled={isPending}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 disabled:opacity-50"
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
        
        {/* Total Records */}
        <div className="bg-blue-600 text-white px-6 py-2 text-right text-sm">
          Total Records: {locations.length}
        </div>
      </div>

      {/* Location Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaMapMarkerAlt className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Locations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaPlane className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Airport Locations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.airports}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaBuilding className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Office Locations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.offices}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaToggleOn className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Locations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showViewModal && selectedLocation && (
        <ViewLocationModal 
          location={selectedLocation} 
          onClose={() => setShowViewModal(false)} 
        />
      )}
      
      {showEditModal && selectedLocation && (
        <EditLocationModal 
          location={selectedLocation} 
          onClose={() => setShowEditModal(false)}
          onSave={(updatedLocation) => {
            setLocations(prev => prev.map(l => l.id === updatedLocation.id ? updatedLocation : l));
            setShowEditModal(false);
          }}
        />
      )}
      
      {showCreateModal && (
        <CreateLocationModal 
          onClose={() => setShowCreateModal(false)}
          onSave={(newLocation) => {
            setLocations(prev => [...prev, newLocation]);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
};

// View Location Modal
const ViewLocationModal: React.FC<{
  location: Location;
  onClose: () => void;
}> = ({ location, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Location Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes className="h-5 w-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <p className="text-gray-900">{location.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <p className="text-gray-900">{location.type}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <p className="text-gray-900">{location.address || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <p className="text-gray-900">{location.city || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <p className="text-gray-900">{location.phone || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-gray-900">{location.email || 'N/A'}</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Opening Hours</label>
            <p className="text-gray-900">{location.openingHours || 'N/A'}</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
            <p className="text-gray-900">{location.instructions || 'N/A'}</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Facilities</label>
            <p className="text-gray-900">{location.facilities || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Point</label>
            <p className="text-gray-900">{location.isPickupPoint ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dropoff Point</label>
            <p className="text-gray-900">{location.isDropoffPoint ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Has Delivery</label>
            <p className="text-gray-900">{location.hasDelivery ? 'Yes' : 'No'}</p>
          </div>
          {location.hasDelivery && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Radius (km)</label>
                <p className="text-gray-900">{location.deliveryRadius || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Fee (€)</label>
                <p className="text-gray-900">{location.deliveryFee ? `€${location.deliveryFee}` : 'Free'}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Edit Location Modal
const EditLocationModal: React.FC<{
  location: Location;
  onClose: () => void;
  onSave: (location: Location) => void;
}> = ({ location, onClose, onSave }) => {
  const [formData, setFormData] = useState<UpdateLocationData>({
    id: location.id,
    name: location.name,
    type: location.type,
    displayOrder: location.displayOrder,
    visible: location.visible,
    address: location.address || '',
    city: location.city || '',
    postcode: location.postcode || '',
    country: location.country || '',
    phone: location.phone || '',
    email: location.email || '',
    openingHours: location.openingHours || '',
    latitude: location.latitude || undefined,
    longitude: location.longitude || undefined,
    instructions: location.instructions || '',
    facilities: location.facilities || '',
    isPickupPoint: location.isPickupPoint,
    isDropoffPoint: location.isDropoffPoint,
    hasDelivery: location.hasDelivery,
    deliveryRadius: location.deliveryRadius || undefined,
    deliveryFee: location.deliveryFee || undefined,
  });
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const updatedLocation = await updateLocation(formData);
        onSave(updatedLocation);
      } catch (error) {
        alert('Failed to update location');
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit Location</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Airport">Airport</option>
                <option value="Office">Office</option>
                <option value="Hotel">Hotel</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Opening Hours</label>
              <input
                type="text"
                value={formData.openingHours}
                onChange={(e) => setFormData(prev => ({ ...prev, openingHours: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Mon-Fri: 8:00-18:00, Sat: 9:00-15:00"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Special pickup/dropoff instructions"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Facilities</label>
              <input
                type="text"
                value={formData.facilities}
                onChange={(e) => setFormData(prev => ({ ...prev, facilities: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Available facilities (comma-separated)"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPickupPoint"
                checked={formData.isPickupPoint}
                onChange={(e) => setFormData(prev => ({ ...prev, isPickupPoint: e.target.checked }))}
                className="rounded border-gray-300 mr-2"
              />
              <label htmlFor="isPickupPoint" className="text-sm font-medium text-gray-700">Pickup Point</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDropoffPoint"
                checked={formData.isDropoffPoint}
                onChange={(e) => setFormData(prev => ({ ...prev, isDropoffPoint: e.target.checked }))}
                className="rounded border-gray-300 mr-2"
              />
              <label htmlFor="isDropoffPoint" className="text-sm font-medium text-gray-700">Dropoff Point</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="hasDelivery"
                checked={formData.hasDelivery}
                onChange={(e) => setFormData(prev => ({ ...prev, hasDelivery: e.target.checked }))}
                className="rounded border-gray-300 mr-2"
              />
              <label htmlFor="hasDelivery" className="text-sm font-medium text-gray-700">Has Delivery</label>
            </div>
          </div>

          {formData.hasDelivery && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Radius (km)</label>
                <input
                  type="number"
                  value={formData.deliveryRadius || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, deliveryRadius: e.target.value ? parseInt(e.target.value) : undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Fee (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.deliveryFee || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, deliveryFee: e.target.value ? parseFloat(e.target.value) : undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0 for free delivery"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {isPending && <FaSpinner className="h-4 w-4 animate-spin" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Create Location Modal
const CreateLocationModal: React.FC<{
  onClose: () => void;
  onSave: (location: Location) => void;
}> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState<CreateLocationData>({
    name: '',
    type: 'Office',
    displayOrder: 0,
    visible: true,
    address: '',
    city: '',
    postcode: '',
    country: 'Cyprus',
    phone: '',
    email: '',
    openingHours: '',
    latitude: undefined,
    longitude: undefined,
    instructions: '',
    facilities: '',
    isPickupPoint: true,
    isDropoffPoint: true,
    hasDelivery: false,
    deliveryRadius: undefined,
    deliveryFee: undefined,
  });
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const newLocation = await createLocation(formData);
        onSave(newLocation);
      } catch (error) {
        alert('Failed to create location');
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create New Location</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Airport">Airport</option>
                <option value="Office">Office</option>
                <option value="Hotel">Hotel</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Opening Hours</label>
              <input
                type="text"
                value={formData.openingHours}
                onChange={(e) => setFormData(prev => ({ ...prev, openingHours: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Mon-Fri: 8:00-18:00, Sat: 9:00-15:00"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Special pickup/dropoff instructions"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Facilities</label>
              <input
                type="text"
                value={formData.facilities}
                onChange={(e) => setFormData(prev => ({ ...prev, facilities: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Available facilities (comma-separated)"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPickupPoint"
                checked={formData.isPickupPoint}
                onChange={(e) => setFormData(prev => ({ ...prev, isPickupPoint: e.target.checked }))}
                className="rounded border-gray-300 mr-2"
              />
              <label htmlFor="isPickupPoint" className="text-sm font-medium text-gray-700">Pickup Point</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDropoffPoint"
                checked={formData.isDropoffPoint}
                onChange={(e) => setFormData(prev => ({ ...prev, isDropoffPoint: e.target.checked }))}
                className="rounded border-gray-300 mr-2"
              />
              <label htmlFor="isDropoffPoint" className="text-sm font-medium text-gray-700">Dropoff Point</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="hasDelivery"
                checked={formData.hasDelivery}
                onChange={(e) => setFormData(prev => ({ ...prev, hasDelivery: e.target.checked }))}
                className="rounded border-gray-300 mr-2"
              />
              <label htmlFor="hasDelivery" className="text-sm font-medium text-gray-700">Has Delivery</label>
            </div>
          </div>

          {formData.hasDelivery && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Radius (km)</label>
                <input
                  type="number"
                  value={formData.deliveryRadius || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, deliveryRadius: e.target.value ? parseInt(e.target.value) : undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Fee (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.deliveryFee || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, deliveryFee: e.target.value ? parseFloat(e.target.value) : undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0 for free delivery"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {isPending && <FaSpinner className="h-4 w-4 animate-spin" />}
              <span>Create Location</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LocationsClient; 
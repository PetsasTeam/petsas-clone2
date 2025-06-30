'use client';

import React, { useState } from 'react';
import { FaUpload, FaTimes, FaImage } from 'react-icons/fa';

interface VehicleImageUploadProps {
  vehicleId: string;
  vehicleName: string;
  currentImage: string;
  onClose: () => void;
  onImageUpdated: (newImagePath: string) => void;
}

export default function VehicleImageUpload({
  vehicleId,
  vehicleName,
  currentImage,
  onClose,
  onImageUpdated
}: VehicleImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('vehicleId', vehicleId);

      const response = await fetch('/api/admin/vehicles/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        onImageUpdated(result.imagePath);
      } else {
        alert('Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-lg font-semibold">Upload Vehicle Image</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle: {vehicleName}
            </label>
          </div>

          {/* Current Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Image
            </label>
            <img
              src={currentImage}
              alt={vehicleName}
              className="w-full h-32 object-cover rounded-lg border"
            />
          </div>

          {/* Preview New Image */}
          {previewImage && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Image Preview
              </label>
              <img
                src={previewImage}
                alt="Preview"
                className="w-full h-32 object-cover rounded-lg border"
              />
            </div>
          )}

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select New Image
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FaImage className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 5MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>

          {/* Upload Button */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
              disabled={isUploading}
            >
              Cancel
            </button>
            {previewImage && (
              <button
                onClick={() => {
                  // The upload already happened in handleFileChange
                  onClose();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <FaUpload className="h-4 w-4 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <FaUpload className="h-4 w-4" />
                    <span>Complete</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
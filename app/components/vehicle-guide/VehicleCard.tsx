"use client";

import Image from 'next/image';
import React from 'react';
import { Vehicle } from '../../generated/prisma';
import {
  Users,
  Fuel,
  Calendar,
  DoorOpen,
  Armchair,
  Cog,
  Settings,
  Snowflake,
  Baby,
  Briefcase,
  Luggage,
  ShoppingBag,
} from "lucide-react";

interface VehicleCardProps {
  vehicle: Vehicle;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle }) => {

  return (
    <div className="bg-white rounded-lg shadow-lg border hover:shadow-xl transition-all duration-300 h-full">
      {/* Fixed height container with consistent structure */}
      <div className="h-full flex flex-col min-h-[380px]">
        <div className="flex flex-col lg:flex-row flex-1">
          {/* Car Image Section - Fixed height */}
          <div className="lg:w-2/5 relative flex-shrink-0">
            <div className="h-56 lg:h-full min-h-[200px] bg-white rounded-l-lg flex items-center justify-center">
              <Image
                src={vehicle.image || "/vehicles/vehicle-placeholder.jpg"}
                alt={`${vehicle.name}`}
                width={400}
                height={250}
                className="max-w-full max-h-full object-contain"
              />
            </div>
      </div>

          {/* Content Section - Full width without pricing */}
          <div className="lg:w-3/5 p-5 flex flex-col flex-1">
            {/* Car Title - Fixed height */}
            <div className="mb-3 h-14 flex flex-col justify-start">
              <h2 className="text-xl font-bold text-gray-900 mb-1 line-clamp-2">{vehicle.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
            Group {vehicle.group}
          </span>
                <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
            Code: {vehicle.code}
          </span>
              </div>
            </div>

            {/* Vehicle Specifications - Always Visible */}
            <div className="flex-1 flex flex-col">
              <div className="space-y-2 mb-3">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center space-x-2 text-gray-700">
                      <Fuel className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <span>Engine: {vehicle.engineSize}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-700">
                      <Settings className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span>Transmission: {vehicle.transmission}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-700">
                      <DoorOpen className="h-5 w-5 text-purple-600 flex-shrink-0" />
                      <span>Doors: {vehicle.doors}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-700">
                      <Armchair className="h-5 w-5 text-orange-600 flex-shrink-0" />
                      <span>Seats: {vehicle.seats}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-700">
                      <Users className="h-5 w-5 text-teal-600 flex-shrink-0" />
                      <span>Adults: {vehicle.adults || 0}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-700">
                      <Baby className="h-5 w-5 text-pink-600 flex-shrink-0" />
                      <span>Children: {vehicle.children || 0}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-700">
                      <Luggage className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                      <span>Big Luggage: {vehicle.bigLuggages || 0}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-700">
                      <ShoppingBag className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                      <span>Small Luggage: {vehicle.smallLuggages || 0}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-700">
                      <Snowflake className="h-5 w-5 text-cyan-600 flex-shrink-0" />
                      <span>AC: {vehicle.hasAC ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fixed Bottom Content */}
              <div className="mt-auto">
                {/* Mileage Info */}
                <div className="flex items-center space-x-1 text-gray-600 mb-3">
                  <Calendar className="h-3 w-3 text-teal-600 flex-shrink-0" />
                  <span className="text-xs">Unlimited</span>
        </div>
        
                {/* Additional Info */}
                <div className="flex flex-wrap gap-1 mb-3">
                  <div className="text-xs border border-gray-300 rounded px-2 py-1">
                    Free Cancellation
                  </div>
                  <div className="text-xs border border-gray-300 rounded px-2 py-1">
                    24/7 Support
                  </div>
                </div>
              </div>
            </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard; 
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import React from "react";
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import {
  Users,
  Fuel,
  Calendar,
  Car,
  Shield,
  Search,
  MapPin,
  ChevronDown,
  Navigation,
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
import { useRouter } from 'next/navigation';

function getPriceForDays(pricing: any, days: number): number {
  if (days <= 6) {
    return pricing.price3to6Days;
  } else if (days <= 14) {
    return pricing.price7to14Days;
  } else {
    return pricing.price15PlusDays;
  }
}

function calculateDays(pickupDate: string, dropoffDate: string, pickupTime?: string, dropoffTime?: string): number {
  const pickup = new Date(pickupDate);
  const dropoff = new Date(dropoffDate);
  
  // Calculate base days difference
  const diffTime = dropoff.getTime() - pickup.getTime();
  const baseDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // If we have time information, check if drop-off time is ≥2 hours after pickup time
  if (pickupTime && dropoffTime) {
    const [pickupHours, pickupMinutes] = pickupTime.split(':').map(Number);
    const [dropoffHours, dropoffMinutes] = dropoffTime.split(':').map(Number);
    
    const pickupTotalMinutes = pickupHours * 60 + pickupMinutes;
    const dropoffTotalMinutes = dropoffHours * 60 + dropoffMinutes;
    
    // If drop-off time is ≥2 hours (120 minutes) after pickup time, add 1 day
    if (dropoffTotalMinutes >= pickupTotalMinutes + 120) {
      return Math.max(baseDays + 1, 3); // Minimum 3 days
    }
  }
  
  // Return minimum 3 days for any rental
  return Math.max(baseDays || 1, 3);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// Vehicle Card Component - EXACTLY like reference
function VehicleCard({ vehicle, onlinePrice, arrivalPrice, days, generalSettings, searchParams, router }: any) {
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("online");

  // Handler for book now button
  const handleBookNow = (paymentType: 'online' | 'arrival') => {
    const params = new URLSearchParams();
    params.set('vehicleId', vehicle.id);
    params.set('pickupLocation', searchParams.pickupLocation || '');
    params.set('dropoffLocation', searchParams.dropoffLocation || '');
    params.set('pickupDate', searchParams.pickupDate || '');
    params.set('dropoffDate', searchParams.dropoffDate || '');
    params.set('pickupTime', searchParams.pickupTime || '09:00');
    params.set('dropoffTime', searchParams.dropoffTime || '09:00');
    params.set('days', days.toString());
    params.set('paymentType', paymentType);
    
    router.push(`/en/extras?${params.toString()}`);
  };

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

          {/* Content Section - Flexible with fixed structure */}
          <div className="lg:w-3/5 p-5 flex flex-col lg:flex-row flex-1">
            {/* Left Content - Vehicle Details */}
            <div className="flex-1 lg:pr-5 flex flex-col">
              {/* Car Title - Adjusted height for longer text */}
              <div className="mb-3 h-auto min-h-[3.5rem] flex flex-col justify-start">
                <h2 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                  {(() => {
                    let vehicleName = vehicle.name;
                    // Ensure consistent "or similar" ending
                    if (!vehicleName.toLowerCase().includes('or similar')) {
                      vehicleName += ' or similar';
                    } else {
                      // Fix capitalization if it exists but is wrong
                      vehicleName = vehicleName.replace(/or Similar/gi, 'or similar');
                    }
                    return vehicleName;
                  })()}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Group {vehicle.group}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
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
                    <div className="text-xs border border-gray-300 rounded px-2 py-1 flex items-center">
                      <Shield className="h-3 w-3 mr-1 flex-shrink-0" />
                      Full Coverage
                    </div>
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

            {/* Right Content - Pricing Section with fixed width */}
            <div className="lg:w-72 lg:border-l lg:pl-5 pt-3 lg:pt-0 flex-shrink-0">
              <div className="w-full h-full flex flex-col min-h-[220px]">
                {/* Tab Navigation */}
                <div className="grid w-full grid-cols-2 mb-3 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab("online")}
                    className={`text-xs py-2 px-2 rounded-md transition-colors ${
                      activeTab === "online" 
                        ? "bg-white text-gray-900 shadow-sm" 
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Pay Online
                  </button>
                  <button
                    onClick={() => setActiveTab("arrival")}
                    className={`text-xs py-2 px-2 rounded-md transition-colors ${
                      activeTab === "arrival" 
                        ? "bg-white text-gray-900 shadow-sm" 
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Pay on Arrival
                  </button>
                </div>

                {/* Tab Content - Fixed height */}
                <div className="bg-white rounded-lg border p-3 flex-1 flex flex-col justify-center min-h-[160px]">
                  {activeTab === "online" ? (
                    <div className="text-center">
                      <div className="mb-2">
                        <div className="text-xs bg-yellow-400 text-black px-2 py-1 rounded font-bold inline-block mb-2">
                          {generalSettings?.payOnlineDiscount || 0}% OFF
                        </div>
                      </div>
                      <div className="mb-2">
                        <div className="text-xl font-bold text-gray-900">€{onlinePrice.toFixed(2)}</div>
                      </div>
                      <button 
                        onClick={() => handleBookNow('online')}
                        className="w-full bg-teal-600 text-white py-2 px-3 rounded font-bold text-sm hover:bg-teal-700 mb-2"
                      >
                        BOOK NOW
                      </button>
                      <button className="w-full text-teal-600 text-xs underline hover:text-teal-700 mb-2">
                        View Details
                      </button>
                      <div className="p-2 bg-green-50 rounded text-xs">
                        <div className="text-green-800 font-medium">✓ Best Price - {generalSettings?.payOnlineDiscount || 0}% Discount</div>
                        <div className="text-green-600">Save on online payment</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="mb-2">
                        <div className="text-xs bg-yellow-400 text-black px-2 py-1 rounded font-bold inline-block mb-2">
                          {generalSettings?.payOnArrivalDiscount || 0}% OFF
                        </div>
                      </div>
                      <div className="mb-2">
                        <div className="text-xl font-bold text-gray-900">€{arrivalPrice.toFixed(2)}</div>
                      </div>
                      <button 
                        onClick={() => handleBookNow('arrival')}
                        className="w-full bg-teal-600 text-white py-2 px-3 rounded font-bold text-sm hover:bg-teal-700 mb-2"
                      >
                        BOOK NOW
                      </button>
                      <button className="w-full text-teal-600 text-xs underline hover:text-teal-700 mb-2">
                        View Details
                      </button>
                      <div className="p-2 bg-blue-50 rounded text-xs">
                        <div className="text-blue-800 font-medium">✓ Best Price - {generalSettings?.payOnArrivalDiscount || 0}% Discount</div>
                        <div className="text-blue-600">Special arrival payment</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Green DatePicker Styles */}
      <style jsx global>{`
        .date-picker-wrapper {
          width: 100%;
        }
        .date-picker-wrapper .react-datepicker-wrapper {
          width: 100% !important;
        }
        .date-picker-wrapper .react-datepicker__input-container {
          width: 100% !important;
        }
        .date-picker-wrapper .react-datepicker__input-container input {
          width: 100% !important;
          box-sizing: border-box !important;
          font-family: inherit !important;
          font-weight: normal !important;
          margin: 0 !important;
        }
        
        /* Modern Blue DatePicker Calendar Styles */
        .react-datepicker {
          border: 2px solid #1e3a8a !important;
          border-radius: 12px !important;
          font-family: inherit !important;
          box-shadow: 0 10px 25px rgba(30, 58, 138, 0.15) !important;
          overflow: hidden !important;
        }
        .react-datepicker__header {
          background: linear-gradient(135deg, #1e3a8a, #1e40af) !important;
          border-bottom: none !important;
          border-radius: 10px 10px 0 0 !important;
          padding: 16px 0 !important;
        }
        .react-datepicker__current-month {
          color: white !important;
          font-weight: 600 !important;
          font-size: 18px !important;
          margin-bottom: 8px !important;
        }
        .react-datepicker__day-name {
          color: white !important;
          font-weight: 500 !important;
          width: 40px !important;
          margin: 2px !important;
        }
        .react-datepicker__navigation {
          top: 18px !important;
          width: 24px !important;
          height: 24px !important;
          border-radius: 50% !important;
          background: rgba(255, 255, 255, 0.2) !important;
          transition: all 0.2s ease !important;
        }
        .react-datepicker__navigation:hover {
          background: rgba(255, 255, 255, 0.3) !important;
          transform: scale(1.1) !important;
        }
        .react-datepicker__navigation--previous {
          border-right-color: white !important;
          left: 12px !important;
        }
        .react-datepicker__navigation--next {
          border-left-color: white !important;
          right: 12px !important;
        }
        .react-datepicker__day {
          color: #374151 !important;
          font-weight: 500 !important;
          border-radius: 8px !important;
          margin: 3px !important;
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          transition: all 0.2s ease !important;
          position: relative !important;
        }
        .react-datepicker__day:hover {
          background: linear-gradient(135deg, #3b82f6, #1e3a8a) !important;
          color: white !important;
          transform: scale(1.05) !important;
          box-shadow: 0 4px 12px rgba(30, 58, 138, 0.3) !important;
        }
        .react-datepicker__day--selected {
          background: linear-gradient(135deg, #1e3a8a, #1e40af) !important;
          color: white !important;
          font-weight: 600 !important;
          box-shadow: 0 4px 12px rgba(30, 58, 138, 0.4) !important;
        }
        .react-datepicker__day--selected:hover {
          background: linear-gradient(135deg, #1e40af, #1d4ed8) !important;
          transform: scale(1.05) !important;
        }
        .react-datepicker__day--today {
          background: linear-gradient(135deg, #dbeafe, #bfdbfe) !important;
          color: #1e3a8a !important;
          font-weight: 600 !important;
          border: 2px solid #3b82f6 !important;
        }
        .react-datepicker__day--disabled {
          color: #d1d5db !important;
          cursor: not-allowed !important;
          background: #f9fafb !important;
        }
        .react-datepicker__day--disabled:hover {
          background: #f9fafb !important;
          transform: none !important;
          box-shadow: none !important;
        }
        .react-datepicker__month-container {
          background: white !important;
        }
        .react-datepicker__week {
          display: flex !important;
          justify-content: space-around !important;
        }
        
        /* Input styling consistency */
        .date-picker-input {
          background: white !important;
          border: 1px solid #d1d5db !important;
          transition: all 0.2s ease !important;
        }
        .date-picker-input:focus {
          outline: none !important;
          border-color: #1e3a8a !important;
          box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1) !important;
        }
      `}</style>
    </div>
  );
}

// Client component for search page
export default function SearchPageClient({ categories, currentSeason, searchParams, generalSettings }: any) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isEditingSearch, setIsEditingSearch] = useState(false);
  const router = useRouter();
  const [validationError, setValidationError] = useState<string>('');

  // Controlled state for search fields
  const [pickupLocation, setPickupLocation] = useState(searchParams.pickupLocation || 'Larnaka Airport');
  const [dropoffLocation, setDropoffLocation] = useState(searchParams.dropoffLocation || 'Larnaka Airport');
  const [pickupDate, setPickupDate] = useState<Date | null>(searchParams.pickupDate ? new Date(searchParams.pickupDate) : null);
  const [dropoffDate, setDropoffDate] = useState<Date | null>(searchParams.dropoffDate ? new Date(searchParams.dropoffDate) : null);
  const [pickupTime, setPickupTime] = useState(searchParams.pickupTime || '09:00');
  const [dropoffTime, setDropoffTime] = useState(searchParams.dropoffTime || '09:00');
  const [differentDropoff, setDifferentDropoff] = useState(false);

  // Update dropoff location if not different
  React.useEffect(() => {
    if (!differentDropoff) {
      setDropoffLocation(pickupLocation);
    }
  }, [pickupLocation, differentDropoff]);

  // Handler for search button
  const handleSearch = () => {
    // 24-hour validation
    if (!pickupDate) {
      setValidationError('Please select a pickup date.');
      return;
    }
    const [pickupHour, pickupMinute] = pickupTime.split(':').map(Number);
    const pickupDateTime = new Date(pickupDate);
    pickupDateTime.setHours(pickupHour, pickupMinute, 0, 0);
    const now = new Date();
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    if (pickupDateTime < twentyFourHoursFromNow) {
      setValidationError('You can book a car at least 24 hours before pick up. Please modify the Pick Up time and try again.');
      return;
    }
    setValidationError('');
    const params = new URLSearchParams();
    params.set('pickupLocation', pickupLocation);
    params.set('dropoffLocation', dropoffLocation);
    if (pickupDate) {
      params.set('pickupDate', pickupDate.toISOString().split('T')[0]);
    }
    if (dropoffDate) {
      params.set('dropoffDate', dropoffDate.toISOString().split('T')[0]);
    }
    params.set('pickupTime', pickupTime);
    params.set('dropoffTime', dropoffTime);
    
    router.push(`/en/search?${params.toString()}`);
  };

  // Calculate days between pickup and dropoff (including time-based logic)
  const days = calculateDays(
    searchParams.pickupDate || '', 
    searchParams.dropoffDate || '',
    searchParams.pickupTime || '09:00',
    searchParams.dropoffTime || '09:00'
  );

  // Filter categories based on selected category
  const filteredCategories = selectedCategory 
    ? categories.filter((cat: any) => cat.id === selectedCategory)
    : categories;

  // Calculate total vehicles count for filtered categories
  const totalVehicles = filteredCategories.reduce((total: number, cat: any) => total + cat.vehicles.length, 0);

  if (!currentSeason) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">No Pricing Available</h1>
          <p className="text-gray-600 mb-4">
            We're sorry, but no pricing season is configured for your selected dates. 
            Please contact us or try different dates.
          </p>
          <Link href="/" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Collapsible Search Section - EXACTLY like reference */}
      <div className={`bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-400 transition-all duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="flex items-center justify-center py-4 cursor-pointer hover:bg-white/10 transition-all duration-300 rounded-lg mx-4 w-full"
          >
            <div className="flex items-center space-x-4">
              <div
                className={`bg-teal-600 rounded-full p-3 shadow-lg transition-all duration-300 ${isSearchOpen ? "rotate-180 scale-110" : "hover:scale-105"}`}
              >
                <Search className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Search for a car</h2>
              <div className={`transition-transform duration-300 ${isSearchOpen ? "rotate-180" : ""}`}>
                <ChevronDown className="h-6 w-6 text-gray-900" />
              </div>
            </div>
          </button>

          {isSearchOpen && (
            <div className="pb-6 animate-in slide-in-from-top-2 fade-in-0">
              <div className="bg-white rounded-xl p-6 shadow-xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Pick up Section */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Navigation className="h-5 w-5 text-teal-600" />
                      <span className="font-bold text-gray-900">Pick up</span>
                    </div>
                    <div className="space-y-3">
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <input
                            placeholder="Enter pickup location"
                            className="pl-10 h-12 w-full border border-gray-300 rounded-md px-3 py-2"
                            value={pickupLocation}
                            onChange={e => setPickupLocation(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                          <div className="date-picker-wrapper">
                            <DatePicker
                              selected={pickupDate}
                              onChange={(date) => setPickupDate(date)}
                              dateFormat="dd/MM/yyyy"
                              placeholderText="Select date"
                              className="date-picker-input h-12 w-full border border-gray-300 rounded-md px-3 py-2"
                              minDate={new Date()}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Hour</label>
                          <select className="h-12 w-full border border-gray-300 rounded-md px-3 py-2" value={pickupTime.split(':')[0]} onChange={e => setPickupTime(e.target.value + ':' + pickupTime.split(':')[1])}>
                            {Array.from({ length: 24 }, (_, i) => (
                              <option key={i} value={i.toString().padStart(2, "0")}>{i.toString().padStart(2, "0")}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Minute</label>
                          <select className="h-12 w-full border border-gray-300 rounded-md px-3 py-2" value={pickupTime.split(':')[1]} onChange={e => setPickupTime(pickupTime.split(':')[0] + ':' + e.target.value)}>
                            <option value="00">00</option>
                            <option value="15">15</option>
                            <option value="30">30</option>
                            <option value="45">45</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Drop off Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-5 w-5 text-orange-600" />
                        <span className="font-bold text-gray-900">Drop off</span>
                      </div>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          checked={differentDropoff}
                          onChange={e => setDifferentDropoff(e.target.checked)}
                        />
                        <span className="text-sm text-gray-600">Different location</span>
                      </label>
                    </div>
                    <div className="space-y-3">
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <input
                            placeholder="Enter drop-off location"
                            className="pl-10 h-12 w-full border border-gray-300 rounded-md px-3 py-2"
                            value={dropoffLocation}
                            onChange={e => setDropoffLocation(e.target.value)}
                            disabled={!differentDropoff}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                          <div className="date-picker-wrapper">
                            <DatePicker
                              selected={dropoffDate}
                              onChange={(date) => setDropoffDate(date)}
                              dateFormat="dd/MM/yyyy"
                              placeholderText="Select date"
                              className="date-picker-input h-12 w-full border border-gray-300 rounded-md px-3 py-2"
                              minDate={pickupDate || new Date()}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Hour</label>
                          <select className="h-12 w-full border border-gray-300 rounded-md px-3 py-2" value={dropoffTime.split(':')[0]} onChange={e => setDropoffTime(e.target.value + ':' + dropoffTime.split(':')[1])}>
                            {Array.from({ length: 24 }, (_, i) => (
                              <option key={i} value={i.toString().padStart(2, "0")}>{i.toString().padStart(2, "0")}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Minute</label>
                          <select className="h-12 w-full border border-gray-300 rounded-md px-3 py-2" value={dropoffTime.split(':')[1]} onChange={e => setDropoffTime(dropoffTime.split(':')[0] + ':' + e.target.value)}>
                            <option value="00">00</option>
                            <option value="15">15</option>
                            <option value="30">30</option>
                            <option value="45">45</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Search Button */}
                <div className="flex justify-center">
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-12 py-3 text-lg rounded-lg flex items-center"
                    onClick={handleSearch}
                  >
                    <Search className="h-5 w-5 mr-2" />
                    SEARCH
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="bg-yellow-500 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <span className="font-semibold text-gray-900">Search</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="bg-teal-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <span className="font-semibold text-white bg-teal-600 px-3 py-1 rounded">Choose vehicle</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="bg-gray-300 text-gray-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <span className="text-gray-600">Choose extras</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="bg-gray-300 text-gray-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <span className="text-gray-600">Review and Pay</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Editable Search Summary */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
          {!isEditingSearch ? (
            // Display Mode
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Car className="h-4 w-4 text-teal-600" />
                  <span>{searchParams.pickupLocation?.replace('-', ' ')}</span>
                </div>
                <span>{searchParams.pickupDate && formatDate(searchParams.pickupDate)} - {searchParams.pickupTime}</span>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-teal-600" />
                  <span>{searchParams.dropoffLocation?.replace('-', ' ')}</span>
                </div>
                <span>{searchParams.dropoffDate && formatDate(searchParams.dropoffDate)} - {searchParams.dropoffTime}</span>
                <span className="font-semibold">({days} days)</span>
              </div>
              <button
                onClick={() => setIsEditingSearch(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
              >
                <Search className="h-4 w-4" />
                <span>Modify Search</span>
              </button>
            </div>
          ) : (
            // Edit Mode
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pickup Section */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Car className="h-4 w-4 text-teal-600" />
                    <label className="text-sm font-medium text-gray-700">Pickup</label>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <input
                      type="text"
                      placeholder="Location"
                      className="h-10 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      value={pickupLocation}
                      onChange={e => setPickupLocation(e.target.value)}
                    />
                    <div className="date-picker-wrapper">
                      <DatePicker
                        selected={pickupDate}
                        onChange={(date) => setPickupDate(date)}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Select date"
                        className="date-picker-input h-10 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        minDate={new Date()}
                      />
                    </div>
                    <select
                      className="h-10 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      value={pickupTime.split(':')[0]}
                      onChange={e => setPickupTime(e.target.value + ':' + pickupTime.split(':')[1])}
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i.toString().padStart(2, "0")}>
                          {i.toString().padStart(2, "0")}
                        </option>
                      ))}
                    </select>
                    <select
                      className="h-10 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      value={pickupTime.split(':')[1]}
                      onChange={e => setPickupTime(pickupTime.split(':')[0] + ':' + e.target.value)}
                    >
                      <option value="00">00</option>
                      <option value="15">15</option>
                      <option value="30">30</option>
                      <option value="45">45</option>
                    </select>
                  </div>
                </div>

                {/* Dropoff Section */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-teal-600" />
                    <label className="text-sm font-medium text-gray-700">Dropoff</label>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <input
                      type="text"
                      placeholder="Location"
                      className="h-10 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      value={dropoffLocation}
                      onChange={e => setDropoffLocation(e.target.value)}
                    />
                    <div className="date-picker-wrapper">
                      <DatePicker
                        selected={dropoffDate}
                        onChange={(date) => setDropoffDate(date)}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Select date"
                        className="date-picker-input h-10 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        minDate={pickupDate || new Date()}
                      />
                    </div>
                    <select
                      className="h-10 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      value={dropoffTime.split(':')[0]}
                      onChange={e => setDropoffTime(e.target.value + ':' + dropoffTime.split(':')[1])}
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i.toString().padStart(2, "0")}>
                          {i.toString().padStart(2, "0")}
                        </option>
                      ))}
                    </select>
                    <select
                      className="h-10 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      value={dropoffTime.split(':')[1]}
                      onChange={e => setDropoffTime(dropoffTime.split(':')[0] + ':' + e.target.value)}
                    >
                      <option value="00">00</option>
                      <option value="15">15</option>
                      <option value="30">30</option>
                      <option value="45">45</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  onClick={() => setIsEditingSearch(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleSearch();
                    setIsEditingSearch(false);
                  }}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
                >
                  <Search className="h-4 w-4" />
                  <span>Update Search</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Category Filters - KEEP AS IS */}
        <div className="mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button 
              onClick={() => setSelectedCategory(null)}
              className={`font-semibold px-4 py-2 rounded-full whitespace-nowrap text-sm ${
                selectedCategory === null 
                  ? "bg-blue-600 hover:bg-blue-700 text-white" 
                  : "border-gray-300 bg-white hover:bg-gray-50 text-gray-700 border"
              }`}
            >
              All Categories
            </button>
            {categories.map((category: any) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`font-semibold px-4 py-2 rounded-full whitespace-nowrap text-sm ${
                  selectedCategory === category.id
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "border-gray-300 bg-white hover:bg-gray-50 text-gray-700 border"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Vehicle Results - Sorted by Price */}
        <div className="grid grid-cols-1 gap-6">
          {(() => {
            // Flatten all vehicles from all categories and calculate prices
            const allVehicles = filteredCategories.flatMap((category: any) => 
              category.vehicles.map((vehicle: any) => {
                // Find the correct seasonal pricing for this vehicle's group and current season
                const vehiclePricing = category.seasonalPricings.find(
                  (pricing: any) => 
                    pricing.seasonId === currentSeason?.id && 
                    pricing.group === vehicle.group
                );

                if (!vehiclePricing) {
                  return null;
                }

                const basePrice = getPriceForDays(vehiclePricing, days);
                const totalBasePrice = basePrice * days;
                
                const onlineDiscount = generalSettings?.payOnlineDiscount / 100 || 0;
                const arrivalDiscount = generalSettings?.payOnArrivalDiscount / 100 || 0;
                
                const onlinePrice = totalBasePrice * (1 - onlineDiscount);
                const arrivalPrice = totalBasePrice * (1 - arrivalDiscount);

                return {
                  vehicle,
                  category,
                  vehiclePricing,
                  basePrice,
                  totalBasePrice,
                  onlinePrice,
                  arrivalPrice,
                  sortPrice: Math.min(onlinePrice, arrivalPrice) // Use the cheaper price for sorting
                };
              }).filter(Boolean) // Remove null values
            );

            // Sort by price (cheapest first)
            const sortedVehicles = allVehicles.sort((a: any, b: any) => a.sortPrice - b.sortPrice);

            return sortedVehicles.map((vehicleData: any) => (
              <VehicleCard 
                key={vehicleData.vehicle.id}
                vehicle={vehicleData.vehicle}
                onlinePrice={vehicleData.onlinePrice}
                arrivalPrice={vehicleData.arrivalPrice}
                days={days}
                generalSettings={generalSettings}
                searchParams={searchParams}
                router={router}
              />
            ));
          })()}
        </div>

        {validationError && (
          <div className="text-red-600 text-sm mt-2">{validationError}</div>
        )}
      </div>
    </div>
  );
}

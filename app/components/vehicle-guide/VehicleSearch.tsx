"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import {
  Search,
  MapPin,
  ChevronDown,
  Navigation,
} from "lucide-react";

interface Location {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  isPickupPoint: boolean;
  isDropoffPoint: boolean;
}

interface VehicleSearchProps {
  locations?: Location[];
}

const VehicleSearch: React.FC<VehicleSearchProps> = ({ locations: propLocations }) => {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [validationError, setValidationError] = useState<string>('');

  // Controlled state for search fields
  const [pickupLocation, setPickupLocation] = useState('Larnaka Airport');
  const [dropoffLocation, setDropoffLocation] = useState('Larnaka Airport');
  const [pickupDate, setPickupDate] = useState<Date | null>(null);
  const [dropoffDate, setDropoffDate] = useState<Date | null>(null);
  const [pickupTime, setPickupTime] = useState('09:00');
  const [dropoffTime, setDropoffTime] = useState('09:00');
  const [differentDropoff, setDifferentDropoff] = useState(false);
  const [locationOptions, setLocationOptions] = useState<Array<{value: string, label: string}>>([]);
  const [loading, setLoading] = useState(!propLocations);

  // Memoized location options for better performance
  const memoizedLocationOptions = useMemo(() => {
    if (propLocations) {
      const options = propLocations
        .filter(loc => loc.visible)
        .map(loc => ({
          value: loc.id,
          label: loc.name
        }));
      options.push({ value: 'custom', label: 'Custom (Hotel or Address)' });
      return options;
    }
    return [];
  }, [propLocations]);

  // Load location options
  useEffect(() => {
    const loadLocations = async () => {
      if (propLocations) {
        // Use provided locations immediately
        setLocationOptions(memoizedLocationOptions);
        setLoading(false);
        return;
      }

      try {
        // Fetch from API only if locations not provided
        const response = await fetch('/api/locations');
        if (response.ok) {
          const locations = await response.json();
          const options = locations
            .filter((loc: any) => loc.visible)
            .map((loc: any) => ({
              value: loc.id,
              label: loc.name
            }));
          options.push({ value: 'custom', label: 'Custom (Hotel or Address)' });
          setLocationOptions(options);
        } else {
          // Fallback locations
          setLocationOptions([
            { value: 'larnaka-airport', label: 'Larnaka Airport' },
            { value: 'pafos-airport', label: 'Pafos Airport' },
            { value: 'pafos-office', label: 'Pafos Office' },
            { value: 'limassol-office', label: 'Limassol Office' },
            { value: 'ayia-napa-office', label: 'Ayia Napa Office' },
            { value: 'nicosia-office', label: 'Nicosia Office' },
            { value: 'custom', label: 'Custom (Hotel or Address)' }
          ]);
        }
      } catch (error) {
        console.error('Error loading locations:', error);
        // Fallback locations
        setLocationOptions([
          { value: 'larnaka-airport', label: 'Larnaka Airport' },
          { value: 'pafos-airport', label: 'Pafos Airport' },
          { value: 'pafos-office', label: 'Pafos Office' },
          { value: 'limassol-office', label: 'Limassol Office' },
          { value: 'ayia-napa-office', label: 'Ayia Napa Office' },
          { value: 'nicosia-office', label: 'Nicosia Office' },
          { value: 'custom', label: 'Custom (Hotel or Address)' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadLocations();
  }, [propLocations]);

  // Update dropoff location if not different
  React.useEffect(() => {
    if (!differentDropoff) {
      setDropoffLocation(pickupLocation);
    }
  }, [pickupLocation, differentDropoff]);

  // Handler for search button
  const handleSearch = () => {
    // Location validation
    if (!pickupLocation || pickupLocation.trim() === '') {
      setValidationError('Please enter a pickup location.');
      return;
    }
    
    if (differentDropoff && (!dropoffLocation || dropoffLocation.trim() === '')) {
      setValidationError('Please enter a dropoff location.');
      return;
    }

    // Date validation
    if (!pickupDate) {
      setValidationError('Please select a pickup date.');
      return;
    }

    // Check if pickup date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(pickupDate);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      setValidationError('Please select a future date. Past dates are not allowed.');
      return;
    }

    // Check drop-off date
    if (!dropoffDate) {
      setValidationError('Please select a drop-off date.');
      return;
    }

    // Check if drop-off date is not before pickup date
    const pickupDateOnly = new Date(pickupDate);
    pickupDateOnly.setHours(0, 0, 0, 0);
    const dropoffDateOnly = new Date(dropoffDate);
    dropoffDateOnly.setHours(0, 0, 0, 0);
    
    if (dropoffDateOnly < pickupDateOnly) {
      setValidationError('Drop-off date cannot be before pickup date.');
      return;
    }

    // 24-hour validation
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
    const pickupYear = pickupDate.getFullYear();
    const pickupMonth = String(pickupDate.getMonth() + 1).padStart(2, '0');
    const pickupDay = String(pickupDate.getDate()).padStart(2, '0');
    params.set('pickupDate', `${pickupYear}-${pickupMonth}-${pickupDay}`);
    
    const dropoffYear = dropoffDate.getFullYear();
    const dropoffMonth = String(dropoffDate.getMonth() + 1).padStart(2, '0');
    const dropoffDay = String(dropoffDate.getDate()).padStart(2, '0');
    params.set('dropoffDate', `${dropoffYear}-${dropoffMonth}-${dropoffDay}`);
    params.set('pickupTime', pickupTime);
    params.set('dropoffTime', dropoffTime);
    
    router.push(`/en/search?${params.toString()}`);
  };

  return (
    <div>
      {/* Collapsible Search Section */}
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
                          <select
                            className="pl-10 h-12 w-full border border-gray-300 rounded-md px-3 py-2"
                            value={pickupLocation}
                            onChange={e => setPickupLocation(e.target.value)}
                          >
                            <option value="">Select pickup location</option>
                            {locationOptions.map(loc => (
                              <option key={loc.value} value={loc.label}>{loc.label}</option>
                            ))}
                          </select>
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
                    minDate={new Date(new Date().setHours(0, 0, 0, 0))}
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
                          <select
                            className="pl-10 h-12 w-full border border-gray-300 rounded-md px-3 py-2"
                            value={dropoffLocation}
                            onChange={e => setDropoffLocation(e.target.value)}
                            disabled={!differentDropoff}
                          >
                            <option value="">Select dropoff location</option>
                            {locationOptions.map(loc => (
                              <option key={loc.value} value={loc.label}>{loc.label}</option>
                            ))}
                          </select>
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
                              minDate={pickupDate || new Date(new Date().setHours(0, 0, 0, 0))}
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
                {validationError && (
                  <div className="text-red-600 text-sm mt-2">{validationError}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modern Green DatePicker Calendar Styles */}
      <style jsx>{`
        .react-datepicker {
          border: 2px solid #047857 !important;
          border-radius: 12px !important;
          font-family: inherit !important;
          box-shadow: 0 10px 25px rgba(4, 120, 87, 0.15) !important;
          overflow: hidden !important;
        }
        .react-datepicker__header {
          background: linear-gradient(135deg, #047857, #059669) !important;
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
          background: linear-gradient(135deg, #10b981, #047857) !important;
          color: white !important;
          transform: scale(1.05) !important;
          box-shadow: 0 4px 12px rgba(4, 120, 87, 0.3) !important;
        }
        .react-datepicker__day--selected {
          background: linear-gradient(135deg, #047857, #059669) !important;
          color: white !important;
          font-weight: 600 !important;
          box-shadow: 0 4px 12px rgba(4, 120, 87, 0.4) !important;
        }
        .react-datepicker__day--selected:hover {
          background: linear-gradient(135deg, #059669, #047857) !important;
          transform: scale(1.05) !important;
        }
        .react-datepicker__day--today {
          background: linear-gradient(135deg, #dcfce7, #bbf7d0) !important;
          color: #047857 !important;
          font-weight: 600 !important;
          border: 2px solid #10b981 !important;
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
          border-color: #047857 !important;
          box-shadow: 0 0 0 3px rgba(4, 120, 87, 0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default VehicleSearch; 
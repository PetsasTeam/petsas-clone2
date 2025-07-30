"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

// Types
interface Location {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  isPickupPoint: boolean;
  isDropoffPoint: boolean;
}

interface LocationOption {
  value: string;
  label: string;
}

interface BookingFormData {
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: Date | null;
  dropoffDate: Date | null;
  pickupHour: string;
  pickupMinute: string;
  dropoffHour: string;
  dropoffMinute: string;
  differentDropoff: boolean;
  pickupCustomLocation: string;
  pickupCustomCity: string;
  dropoffCustomLocation: string;
  dropoffCustomCity: string;
}

interface BookingFormProps {
  isCompact?: boolean;
  initialPickupLocations?: any[];
  initialDropoffLocations?: any[];
  locations?: Location[];
}

// Server action to fetch locations
async function getLocationOptions(): Promise<LocationOption[]> {
  try {
    const response = await fetch('/api/locations');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch locations: ${response.status}`);
    }
    
    const locations: Location[] = await response.json();
    
    const locationOptions: LocationOption[] = locations
      .filter(loc => loc.visible)
      .map(loc => ({
        value: loc.id,
        label: loc.name
      }));
    
    // Add custom option at the end
    locationOptions.push({ value: 'custom', label: 'Custom (Hotel or Address)' });
    
    return locationOptions;
  } catch (error) {
    console.error('Error fetching locations:', error);
    // Fallback to hardcoded locations
    return [
      { value: 'larnaka-airport', label: 'Larnaka Airport' },
      { value: 'pafos-airport', label: 'Pafos Airport' },
      { value: 'pafos-office', label: 'Pafos Office' },
      { value: 'limassol-office', label: 'Limassol Office' },
      { value: 'ayia-napa-office', label: 'Ayia Napa Office' },
      { value: 'nicosia-office', label: 'Nicosia Office' },
      { value: 'custom', label: 'Custom (Hotel or Address)' }
    ];
  }
}

const BookingForm: React.FC<BookingFormProps> = ({ isCompact = false, locations: propLocations }) => {
  const router = useRouter();
  const [formData, setFormData] = useState<BookingFormData>({
    pickupLocation: '',
    dropoffLocation: '',
    pickupDate: null,
    dropoffDate: null,
    pickupHour: '09',
    pickupMinute: '00',
    dropoffHour: '09',
    dropoffMinute: '00',
    differentDropoff: false,
    pickupCustomLocation: '',
    pickupCustomCity: '',
    dropoffCustomLocation: '',
    dropoffCustomCity: ''
  });

  const [locationOptions, setLocationOptions] = useState<LocationOption[]>([]);
  const [loading, setLoading] = useState(!propLocations); // Don't show loading if locations are provided

  // Memoized location options to prevent unnecessary re-computation
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

  // Load locations on component mount
  useEffect(() => {
    const loadLocations = async () => {
      if (propLocations) {
        // Use memoized location options immediately
        setLocationOptions(memoizedLocationOptions);
        setLoading(false);
        return;
      }

      try {
        // Fetch locations from API only if not provided
        const options = await getLocationOptions();
        setLocationOptions(options);
      } catch (error) {
        console.error('Error loading locations:', error);
        // Set fallback locations on error
        const fallbackOptions = [
          { value: 'larnaka-airport', label: 'Larnaka Airport' },
          { value: 'pafos-airport', label: 'Pafos Airport' },
          { value: 'pafos-office', label: 'Pafos Office' },
          { value: 'limassol-office', label: 'Limassol Office' },
          { value: 'ayia-napa-office', label: 'Ayia Napa Office' },
          { value: 'nicosia-office', label: 'Nicosia Office' },
          { value: 'custom', label: 'Custom (Hotel or Address)' }
        ];
        setLocationOptions(fallbackOptions);
      } finally {
        setLoading(false);
      }
    };

    loadLocations();
  }, [propLocations, memoizedLocationOptions]);

  const cities = [
    { value: 'nicosia', label: 'Nicosia' },
    { value: 'larnaca', label: 'Larnaca' },
    { value: 'limassol', label: 'Limassol' },
    { value: 'paphos', label: 'Paphos' },
    { value: 'ayia-napa-protaras', label: 'Ayia Napa/Protaras' }
  ];

  // Auto-sync drop-off location with pickup location when "different drop-off" is not checked
  useEffect(() => {
    if (!formData.differentDropoff) {
      setFormData(prev => ({
        ...prev,
        dropoffLocation: prev.pickupLocation,
        dropoffCustomLocation: prev.pickupCustomLocation,
        dropoffCustomCity: prev.pickupCustomCity
      }));
    }
  }, [formData.pickupLocation, formData.pickupCustomLocation, formData.pickupCustomCity, formData.differentDropoff]);

  const [validationError, setValidationError] = useState<string>('');

  const validateBookingForm = () => {
    // Check pickup location
    if (!formData.pickupLocation) {
      setValidationError('Please select a pickup location.');
      return false;
    }

    // Check custom pickup location details if custom is selected
    if (formData.pickupLocation === 'custom') {
      if (!formData.pickupCustomLocation || !formData.pickupCustomCity) {
        setValidationError('Please enter custom pickup location and city.');
        return false;
      }
    }

    // Check dropoff location if different dropoff is enabled
    if (formData.differentDropoff) {
      if (!formData.dropoffLocation) {
        setValidationError('Please select a dropoff location.');
        return false;
      }

      // Check custom dropoff location details if custom is selected
      if (formData.dropoffLocation === 'custom') {
        if (!formData.dropoffCustomLocation || !formData.dropoffCustomCity) {
          setValidationError('Please enter custom dropoff location and city.');
          return false;
        }
      }
    }

    // Check pickup date
    if (!formData.pickupDate) {
      setValidationError('Please select a pickup date.');
      return false;
    }

    // Check if pickup date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(formData.pickupDate);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      setValidationError('Please select a future date. Past dates are not allowed.');
      return false;
    }

    // Create pickup datetime
    const pickupDateTime = new Date(formData.pickupDate);
    pickupDateTime.setHours(parseInt(formData.pickupHour), parseInt(formData.pickupMinute), 0, 0);

    // Get current time
    const now = new Date();

    // Calculate 24 hours from now
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Check if pickup time is at least 24 hours from now
    if (pickupDateTime < twentyFourHoursFromNow) {
      setValidationError('You can book a car at least 24 hours before pick up. Please modify the Pick Up time and try again.');
      return false;
    }

    // Check drop-off date
    if (!formData.dropoffDate) {
      setValidationError('Please select a drop-off date.');
      return false;
    }

    // Check if drop-off date is not before pickup date
    const dropoffDate = new Date(formData.dropoffDate);
    dropoffDate.setHours(0, 0, 0, 0);
    
    if (dropoffDate < selectedDate) {
      setValidationError('Drop-off date cannot be before pickup date.');
      return false;
    }

    setValidationError('');
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateBookingForm()) {
      return;
    }
    
    // Build search URL with query parameters
    const searchParams = new URLSearchParams();
    
    // Add pickup location
    if (formData.pickupLocation === 'custom' && formData.pickupCustomLocation && formData.pickupCustomCity) {
      searchParams.set('pickupLocation', `${formData.pickupCustomLocation}, ${formData.pickupCustomCity}`);
    } else if (formData.pickupLocation) {
      const locationLabel = locationOptions.find(loc => loc.value === formData.pickupLocation)?.label || formData.pickupLocation;
      searchParams.set('pickupLocation', locationLabel);
    }
    
    // Add dropoff location
    if (formData.differentDropoff) {
      if (formData.dropoffLocation === 'custom' && formData.dropoffCustomLocation && formData.dropoffCustomCity) {
        searchParams.set('dropoffLocation', `${formData.dropoffCustomLocation}, ${formData.dropoffCustomCity}`);
      } else if (formData.dropoffLocation) {
        const locationLabel = locationOptions.find(loc => loc.value === formData.dropoffLocation)?.label || formData.dropoffLocation;
        searchParams.set('dropoffLocation', locationLabel);
      }
    } else {
      // Same as pickup location
      if (formData.pickupLocation === 'custom' && formData.pickupCustomLocation && formData.pickupCustomCity) {
        searchParams.set('dropoffLocation', `${formData.pickupCustomLocation}, ${formData.pickupCustomCity}`);
      } else if (formData.pickupLocation) {
        const locationLabel = locationOptions.find(loc => loc.value === formData.pickupLocation)?.label || formData.pickupLocation;
        searchParams.set('dropoffLocation', locationLabel);
      }
    }
    
    // Add dates (using local timezone to prevent date shifting)
    if (formData.pickupDate) {
      const year = formData.pickupDate.getFullYear();
      const month = String(formData.pickupDate.getMonth() + 1).padStart(2, '0');
      const day = String(formData.pickupDate.getDate()).padStart(2, '0');
      searchParams.set('pickupDate', `${year}-${month}-${day}`);
    }
    if (formData.dropoffDate) {
      const year = formData.dropoffDate.getFullYear();
      const month = String(formData.dropoffDate.getMonth() + 1).padStart(2, '0');
      const day = String(formData.dropoffDate.getDate()).padStart(2, '0');
      searchParams.set('dropoffDate', `${year}-${month}-${day}`);
    } else if (formData.pickupDate) {
      const year = formData.pickupDate.getFullYear();
      const month = String(formData.pickupDate.getMonth() + 1).padStart(2, '0');
      const day = String(formData.pickupDate.getDate()).padStart(2, '0');
      searchParams.set('dropoffDate', `${year}-${month}-${day}`);
    }
    
    // Add times
    searchParams.set('pickupTime', `${formData.pickupHour}:${formData.pickupMinute}`);
    searchParams.set('dropoffTime', `${formData.dropoffHour}:${formData.dropoffMinute}`);
    
    // Navigate to search page
    router.push(`/en/search?${searchParams.toString()}`);
  };

  const handleDifferentDropoffChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      differentDropoff: checked,
      dropoffLocation: checked ? '' : prev.pickupLocation,
      dropoffCustomLocation: checked ? '' : prev.pickupCustomLocation,
      dropoffCustomCity: checked ? '' : prev.pickupCustomCity
    }));
  };

  const handlePickupLocationChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      pickupLocation: value,
      pickupCustomLocation: value !== 'custom' ? '' : prev.pickupCustomLocation,
      pickupCustomCity: value !== 'custom' ? '' : prev.pickupCustomCity
    }));
  };

  const handleDropoffLocationChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      dropoffLocation: value,
      dropoffCustomLocation: value !== 'custom' ? '' : prev.dropoffCustomLocation,
      dropoffCustomCity: value !== 'custom' ? '' : prev.dropoffCustomCity
    }));
  };

  const getDisplayLocation = (location: string, customLocation: string, customCity: string) => {
    if (location === 'custom' && customLocation && customCity) {
      const cityLabel = cities.find(city => city.value === customCity)?.label || customCity;
      return `${customLocation} (${cityLabel})`;
    }
    return locationOptions.find(loc => loc.value === location)?.label || 'Same as pickup location';
  };

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

  // Loading state
  if (loading) {
    return (
      <div className="form-container">
        <div className="loading-spinner">Loading locations...</div>
      </div>
    );
  }

  if (isCompact) {
    return (
      <form onSubmit={handleSubmit} className="compact-form-horizontal">
        <div className="input-group">
          <label className="form-label">Pick up</label>
          <select
            className="form-select"
            value={formData.pickupLocation}
            onChange={(e) => handlePickupLocationChange(e.target.value)}
          >
            <option value="">Select pickup location</option>
            {locationOptions.map(loc => (
              <option key={loc.value} value={loc.value}>{loc.label}</option>
            ))}
          </select>
          
          {/* Custom pickup location fields for compact form */}
          {formData.pickupLocation === 'custom' && (
            <div className="custom-location-fields-compact">
              <select 
                className="form-select"
                value={formData.pickupCustomCity}
                onChange={(e) => setFormData({...formData, pickupCustomCity: e.target.value})}
              >
                <option value="">Select city/area</option>
                {cities.map(city => (
                  <option key={city.value} value={city.value}>{city.label}</option>
                ))}
              </select>
              <input
                type="text"
                className="form-input"
                placeholder="Enter hotel name or address"
                value={formData.pickupCustomLocation}
                onChange={(e) => setFormData({...formData, pickupCustomLocation: e.target.value})}
              />
            </div>
          )}
        </div>

        <div className="input-group date-group">
          <label className="form-label">Date</label>
          <div className="date-picker-wrapper">
            <DatePicker
              selected={formData.pickupDate}
              onChange={(date) => setFormData({ ...formData, pickupDate: date })}
              dateFormat="dd/MM/yyyy"
              placeholderText="Select date"
              className="date-picker-input"
              minDate={new Date(new Date().setHours(0, 0, 0, 0))}
            />
          </div>
        </div>

        <div className="input-group time-group">
          <label className="form-label">Hour</label>
          <select className="form-select" value={formData.pickupHour} onChange={(e) => setFormData({ ...formData, pickupHour: e.target.value })}>
            {hours.map(hour => <option key={hour} value={hour}>{hour}</option>)}
          </select>
        </div>

        <div className="input-group time-group">
          <label className="form-label">Minute</label>
          <select className="form-select" value={formData.pickupMinute} onChange={(e) => setFormData({ ...formData, pickupMinute: e.target.value })}>
            {minutes.map(minute => <option key={minute} value={minute}>{minute}</option>)}
          </select>
        </div>

        <div className="input-group dropoff-group">
          <div className="drop-off-header-compact">
            <label className="form-label">Drop off</label>
            <div className="checkbox-group">
              <input type="checkbox" id="differentLocationCompact" checked={formData.differentDropoff} onChange={(e) => handleDifferentDropoffChange(e.target.checked)} />
              <label htmlFor="differentLocationCompact">Different Drop off location</label>
            </div>
          </div>
          {formData.differentDropoff ? (
            <select
              className="form-select"
              value={formData.dropoffLocation || formData.pickupLocation}
              onChange={(e) => handleDropoffLocationChange(e.target.value)}
            >
              {locationOptions.map(loc => (
                <option key={loc.value} value={loc.value}>{loc.label}</option>
              ))}
            </select>
          ) : (
             <div className="location-display-compact">
               {locationOptions.find(loc => loc.value === formData.pickupLocation)?.label || 'Same as pickup location'}
             </div>
          )}
          
          {/* Custom dropoff location fields for compact form */}
          {formData.differentDropoff && formData.dropoffLocation === 'custom' && (
            <div className="custom-location-fields-compact">
              <select 
                className="form-select"
                value={formData.dropoffCustomCity}
                onChange={(e) => setFormData({...formData, dropoffCustomCity: e.target.value})}
              >
                <option value="">Select city/area</option>
                {cities.map(city => (
                  <option key={city.value} value={city.value}>{city.label}</option>
                ))}
              </select>
              <input
                type="text"
                className="form-input"
                placeholder="Enter hotel name or address"
                value={formData.dropoffCustomLocation}
                onChange={(e) => setFormData({...formData, dropoffCustomLocation: e.target.value})}
              />
            </div>
          )}
        </div>

        <div className="input-group date-group">
          <label className="form-label">Date</label>
          <div className="date-picker-wrapper">
            <DatePicker
              selected={formData.dropoffDate}
              onChange={(date) => setFormData({ ...formData, dropoffDate: date })}
              dateFormat="dd/MM/yyyy"
              placeholderText="Select date"
              className="date-picker-input"
                                minDate={formData.pickupDate || new Date(new Date().setHours(0, 0, 0, 0))}
              disabled={!formData.differentDropoff}
            />
          </div>
        </div>

        <div className="input-group time-group">
          <label className="form-label">Hour</label>
          <select className="form-select" value={formData.dropoffHour} onChange={(e) => setFormData({ ...formData, dropoffHour: e.target.value })}>
            {hours.map(hour => <option key={hour} value={hour}>{hour}</option>)}
          </select>
        </div>

        <div className="input-group time-group">
          <label className="form-label">Minute</label>
          <select className="form-select" value={formData.dropoffMinute} onChange={(e) => setFormData({ ...formData, dropoffMinute: e.target.value })}>
            {minutes.map(minute => <option key={minute} value={minute}>{minute}</option>)}
          </select>
        </div>

        <div className="input-group">
          <button type="submit" className="search-button-compact">
            <span className="search-icon">🔍</span>
            SEARCH
          </button>
        </div>
        
        {validationError && (
          <div className="error-message-compact" style={{ display: 'block' }}>
            {validationError}
          </div>
        )}
        <style jsx>{`
          .compact-form-horizontal {
            display: flex;
            align-items: flex-end;
            gap: 10px;
            width: 100%;
          }
          .input-group {
            display: flex;
            flex-direction: column;
            gap: 4px;
            flex-grow: 1;
            flex-basis: 150px;
          }
          .input-group.date-group {
            flex-grow: 0;
            flex-basis: 130px;
            flex-shrink: 0;
          }
           .input-group.time-group {
            flex-grow: 0;
            flex-basis: 70px;
            flex-shrink: 0;
          }
          .form-label {
            font-size: 11px;
            font-weight: 600;
            color: #003366;
            text-transform: uppercase;
          }
          .form-input, .form-select {
            padding: 8px;
            border: 1px solid #003366;
            border-radius: 4px;
            background-color: white;
            color: #003366;
            font-size: 14px;
            width: 100%;
            height: 37px;
            box-sizing: border-box;
            flex-grow: 1;
            flex-basis: 150px;
            min-width: 0;
            max-width: 100%;
          }
          .date-picker-wrapper {
            width: 100%;
          }
          :global(.date-picker-wrapper .react-datepicker-wrapper) {
            width: 100% !important;
          }
          :global(.date-picker-wrapper .react-datepicker__input-container) {
            width: 100% !important;
          }
          :global(.date-picker-wrapper .react-datepicker__input-container input) {
            padding: 8px !important;
            border: 1px solid #003366 !important;
            border-radius: 4px !important;
            background-color: white !important;
            color: #003366 !important;
            font-size: 14px !important;
            height: 37px !important;
            width: 100% !important;
            box-sizing: border-box !important;
            font-family: inherit !important;
            font-weight: normal !important;
            margin: 0 !important;
          }
          :global(.date-picker-input) {
            padding: 8px !important;
            border: 1px solid #003366 !important;
            border-radius: 4px !important;
            background-color: white !important;
            color: #003366 !important;
            font-size: 14px !important;
            height: 37px !important;
            width: 100% !important;
            box-sizing: border-box !important;
            font-family: inherit !important;
            font-weight: normal !important;
            appearance: none !important;
            -webkit-appearance: none !important;
            -moz-appearance: none !important;
          }
          :global(.date-picker-input:focus) {
            outline: none !important;
            border-color: #0066cc !important;
            box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2) !important;
          }
          .location-display-compact {
            padding: 8px;
            border: 1px solid #003366;
            border-radius: 4px;
            background-color: white;
            color: #003366;
            font-size: 14px;
            height: 37px; 
            display: flex;
            align-items: center;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            box-sizing: border-box;
            width: 100%;
            appearance: none;
            -webkit-appearance: none;
            -moz-appearance: none;
            cursor: default;
            flex-grow: 1;
            flex-basis: 150px;
          }
          .drop-off-header-compact {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            margin-bottom: 4px;
          }
          .checkbox-group {
            display: flex;
            align-items: center;
            gap: 4px;
          }
          .checkbox-group label {
            font-size: 11px;
            color: #003366;
            font-weight: normal;
          }
          
          /* Ensure drop-off location dropdown has consistent width */
          .input-group .form-select {
            width: 100% !important;
            flex: 1 1 auto;
          }
          
          /* Fix for drop-off location container to match pickup location width */
          .input-group.dropoff-group {
            min-width: 0;
            flex-shrink: 0;
            flex-grow: 1;
            flex-basis: 100%;
            flex: 1 0 100% !important;
          }
          
          /* Ensure the select element takes full width regardless of header structure */
          .input-group.dropoff-group .form-select {
            width: 100% !important;
            min-width: 0;
            flex: 1 1 100%;
            box-sizing: border-box;
          }
          .search-button-compact {
            padding: 8px 16px;
            border: 2px solid #003366;
            border-radius: 4px;
            background-color: white;
            color: #003366;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            height: 37px;
          }
          .search-button-compact:hover {
            background-color: #003366;
            color: white;
          }
          .error-message-compact {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background-color: #fee2e2;
            color: #dc2626;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
            border: 1px solid #fecaca;
            margin-top: 4px;
            z-index: 10;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          /* Custom DatePicker Styles */
          :global(.react-datepicker) {
            border: 2px solid #003366;
            border-radius: 8px;
            font-family: inherit;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
          :global(.react-datepicker__header) {
            background-color: #003366;
            border-bottom: none;
            border-radius: 6px 6px 0 0;
          }
          :global(.react-datepicker__current-month) {
            color: white;
            font-weight: 600;
            font-size: 16px;
          }
          :global(.react-datepicker__day-name) {
            color: white;
            font-weight: 500;
          }
          :global(.react-datepicker__navigation) {
            top: 12px;
          }
          :global(.react-datepicker__navigation--previous) {
            border-right-color: white;
          }
          :global(.react-datepicker__navigation--next) {
            border-left-color: white;
          }
          :global(.react-datepicker__day) {
            color: #003366;
            font-weight: 500;
            border-radius: 4px;
            margin: 2px;
            width: 32px;
            height: 32px;
            line-height: 32px;
          }
          :global(.react-datepicker__day:hover) {
            background-color: #f0fdf4;
            color: #047857;
          }
          :global(.react-datepicker__day--selected) {
            background-color: #059669;
            color: white;
          }
          :global(.react-datepicker__day--selected:hover) {
            background-color: #047857;
          }
          :global(.react-datepicker__day--today) {
            background-color: #dcfce7;
            color: #047857;
            font-weight: 600;
          }
          :global(.react-datepicker__day--disabled) {
            color: #ccc;
            cursor: not-allowed;
          }
          :global(.react-datepicker__day--disabled:hover) {
            background-color: transparent;
          }
        `}</style>
      </form>
    );
  }

  return (
    <div className={`booking-form-container ${isCompact ? 'compact' : ''}`}>
      <div className="booking-card">
        {!isCompact && (
          <>
            <h2 className="form-title">Find Your Perfect Car</h2>
          </>
        )}

        <form onSubmit={handleSubmit} className="booking-form">
          {/* Pick up Location */}
          <div className="form-group">
            <label className="form-label">
              📍 Pick up Location
            </label>
            <select 
              className="form-select"
              value={formData.pickupLocation} 
              onChange={(e) => handlePickupLocationChange(e.target.value)}
            >
              <option value="">Select pickup location</option>
              {locationOptions.length > 0 ? (
                locationOptions.map(loc => (
                  <option key={loc.value} value={loc.value}>{loc.label}</option>
                ))
              ) : (
                <option value="" disabled>Loading locations...</option>
              )}
            </select>
            
            {/* Custom pickup location fields */}
            {formData.pickupLocation === 'custom' && (
              <div className="custom-location-fields">
                <select 
                  className="form-select"
                  value={formData.pickupCustomCity}
                  onChange={(e) => setFormData({...formData, pickupCustomCity: e.target.value})}
                >
                  <option value="">Select city/area</option>
                  {cities.map(city => (
                    <option key={city.value} value={city.value}>{city.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter hotel name or address"
                  value={formData.pickupCustomLocation}
                  onChange={(e) => setFormData({...formData, pickupCustomLocation: e.target.value})}
                />
              </div>
            )}
          </div>

          {/* Date and Time Row */}
          <div className="date-time-row">
            <div className="form-group">
              <label className="form-label">Date</label>
              <div className="date-picker-wrapper">
                <DatePicker
                  selected={formData.pickupDate}
                  onChange={(date) => setFormData({...formData, pickupDate: date})}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Select date"
                  className="date-picker-input"
                  minDate={new Date(new Date().setHours(0, 0, 0, 0))}
              />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Hour</label>
              <select
                className="form-select"
                value={formData.pickupHour}
                onChange={(e) => setFormData({ ...formData, pickupHour: e.target.value })}
              >
                {hours.map(hour => (
                  <option key={hour} value={hour}>{hour}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Minute</label>
              <select
                className="form-select"
                value={formData.pickupMinute}
                onChange={(e) => setFormData({ ...formData, pickupMinute: e.target.value })}
              >
                {minutes.map(minute => (
                  <option key={minute} value={minute}>{minute}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Drop off Section */}
          <div className="form-group">
            <div className="drop-off-header">
              <label className="form-label">
                📍 Drop off
              </label>
              <div className="checkbox-group">
                <input 
                  type="checkbox" 
                  id="differentLocation"
                  checked={formData.differentDropoff}
                  onChange={(e) => handleDifferentDropoffChange(e.target.checked)}
                />
                <label htmlFor="differentLocation">Different Drop off location</label>
              </div>
            </div>
            
            {/* Drop off Location Selector */}
            <div className="drop-off-location">
              {formData.differentDropoff ? (
                <>
                  <select 
                    className="form-select"
                    value={formData.dropoffLocation} 
                    onChange={(e) => handleDropoffLocationChange(e.target.value)}
                  >
                    <option value="">Select drop-off location</option>
                    {locationOptions.map(loc => (
                      <option key={loc.value} value={loc.value}>{loc.label}</option>
                    ))}
                  </select>
                  
                  {/* Custom dropoff location fields */}
                  {formData.dropoffLocation === 'custom' && (
                    <div className="custom-location-fields">
                      <select 
                        className="form-select"
                        value={formData.dropoffCustomCity}
                        onChange={(e) => setFormData({...formData, dropoffCustomCity: e.target.value})}
                      >
                        <option value="">Select city/area</option>
                        {cities.map(city => (
                          <option key={city.value} value={city.value}>{city.label}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Enter hotel name or address"
                        value={formData.dropoffCustomLocation}
                        onChange={(e) => setFormData({...formData, dropoffCustomLocation: e.target.value})}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="location-display">
                  {formData.pickupLocation ? 
                    getDisplayLocation(formData.pickupLocation, formData.pickupCustomLocation, formData.pickupCustomCity)
                    : 'Same as pickup location'
                  }
                </div>
              )}
            </div>
          </div>

          {/* Drop off Date and Time */}
          <div className="date-time-row">
            <div className="form-group">
              <label className="form-label">Date</label>
              <div className="date-picker-wrapper">
                <DatePicker
                  selected={formData.dropoffDate}
                  onChange={(date) => setFormData({...formData, dropoffDate: date})}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Select date"
                  className="date-picker-input"
                  minDate={formData.pickupDate || new Date(new Date().setHours(0, 0, 0, 0))}
              />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Hour</label>
              <select
                className="form-select"
                value={formData.dropoffHour}
                onChange={(e) => setFormData({ ...formData, dropoffHour: e.target.value })}
              >
                {hours.map(hour => (
                  <option key={hour} value={hour}>{hour}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Minute</label>
              <select
                className="form-select"
                value={formData.dropoffMinute}
                onChange={(e) => setFormData({ ...formData, dropoffMinute: e.target.value })}
              >
                {minutes.map(minute => (
                  <option key={minute} value={minute}>{minute}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Button - Moved above benefits */}
          <button type="submit" className="search-button">
            <span className="search-icon">🔍</span>
            FIND YOUR VEHICLE
          </button>

          {/* Error Message */}
          {validationError && (
            <div className="error-message" style={{ display: 'block' }}>
              {validationError}
            </div>
          )}

          {/* Included Benefits */}
          {!isCompact && (
            <div className="benefits-section">
              <h4>Included Benefits</h4>
              <div className="benefits-list">
                <div className="benefit-item">• VAT included & online roadside assistance</div>
                <div className="benefit-item">• Free SCDW for 7+ days plus rentals</div>
                <div className="benefit-item">• Free delivery/pick up within town limits</div>
                <div className="benefit-item">• Unlimited kilometres & young fleet</div>
              </div>
            </div>
          )}
        </form>
      </div>

      <style jsx>{`
        .booking-form-container {
          display: flex;
          justify-content: center;
          padding: 2rem;
        }

        .booking-card {
          background: var(--glass-bg-main, rgba(255, 255, 255, 0.75)) !important;
          backdrop-filter: blur(20px) !important;
          -webkit-backdrop-filter: blur(20px) !important;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 
            0 15px 35px -10px rgba(0, 0, 0, 0.15),
            0 0 0 1px rgba(255, 255, 255, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.4);
          width: 100%;
          max-width: 600px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          position: relative;
        }
        
        .booking-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
          border-radius: 16px;
          pointer-events: none;
        }
        
        .form-title {
          font-size: 24px;
          font-weight: 800;
          background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 20px 0;
          text-align: center;
          letter-spacing: -0.025em;
        }

        .booking-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .form-label {
          font-size: 14px;
          font-weight: 700;
          color: #374151;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }

        .form-input, .form-select {
          padding: 14px 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          font-size: 15px;
          font-weight: 500;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: var(--glass-bg-secondary, rgba(255, 255, 255, 0.6)) !important;
          backdrop-filter: blur(8px) !important;
          -webkit-backdrop-filter: blur(8px) !important;
          box-shadow: 
            0 3px 5px -1px rgba(0, 0, 0, 0.05),
            0 1px 3px -1px rgba(0, 0, 0, 0.03),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
          position: relative;
        }
        
        .form-input:focus, .form-select:focus {
          outline: none;
          border-color: #3b82f6;
          background: rgba(255, 255, 255, 1);
          box-shadow: 
            0 0 0 4px rgba(59, 130, 246, 0.1),
            0 10px 25px -5px rgba(0, 0, 0, 0.1),
            0 4px 6px -2px rgba(0, 0, 0, 0.05);
          transform: translateY(-2px);
        }

        .form-input:hover, .form-select:hover {
          border-color: rgba(156, 163, 175, 0.6);
          background: rgba(255, 255, 255, 1);
          box-shadow: 
            0 8px 25px -5px rgba(0, 0, 0, 0.08),
            0 4px 6px -2px rgba(0, 0, 0, 0.03);
          transform: translateY(-1px);
        }

        .form-input:disabled, .form-select:disabled {
          padding: 18px 20px !important;
          border: 2px solid rgba(229, 231, 235, 0.4) !important;
          border-radius: 16px !important;
          font-size: 16px !important;
          font-weight: 500 !important;
          background: rgba(255, 255, 255, 0.98) !important;
          box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.05),
            0 2px 4px -1px rgba(0, 0, 0, 0.03) !important;
          color: #6b7280 !important;
          cursor: not-allowed !important;
          opacity: 1 !important;
        }

        .form-input:disabled:hover, .form-select:disabled:hover {
          border-color: rgba(229, 231, 235, 0.4) !important;
          background: rgba(255, 255, 255, 0.98) !important;
          box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.05),
            0 2px 4px -1px rgba(0, 0, 0, 0.03) !important;
          transform: none !important;
        }

        .search-button {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          border: none;
          padding: 16px 28px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 
            0 8px 20px -5px rgba(59, 130, 246, 0.4),
            0 3px 5px -2px rgba(59, 130, 246, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin: 12px 0;
          position: relative;
          overflow: hidden;
        }

        .search-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .search-button:hover::before {
          left: 100%;
        }

        .search-button:hover {
          background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
          transform: translateY(-3px);
          box-shadow: 
            0 20px 40px -10px rgba(59, 130, 246, 0.5),
            0 8px 16px -4px rgba(59, 130, 246, 0.3);
        }

        .search-button:active {
          transform: translateY(-1px);
          transition: all 0.1s;
        }

        .search-icon {
          font-size: 18px;
          opacity: 0.9;
        }

        .error-message {
          background-color: #fee2e2;
          color: #dc2626;
          padding: 16px 20px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          border: 1px solid #fecaca;
          margin: 12px 0;
          text-align: center;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .form-row {
          display: grid;
          gap: 20px;
        }

        .date-time-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        /* Responsive adjustments */
        @media (min-width: 640px) {
          .form-row {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          }

          .date-time-row {
            grid-template-columns: 2fr 1fr 1fr;
            gap: 20px;
          }
        }

        @media (max-width: 640px) {
          .booking-card {
          padding: 20px;
            background: var(--glass-bg-main, rgba(255, 255, 255, 0.75)) !important;
            backdrop-filter: blur(20px) !important;
            -webkit-backdrop-filter: blur(20px) !important;
          }
          .form-title {
            font-size: 20px;
          }
          .form-input, .form-select {
            font-size: 14px;
            padding: 12px 14px;
          }
          .search-button {
            font-size: 14px;
            padding: 16px;
          }
        }

        .custom-location-fields {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 16px;
          padding: 20px;
          background: var(--glass-bg-tertiary, rgba(255, 255, 255, 0.4)) !important;
          backdrop-filter: blur(8px) !important;
          -webkit-backdrop-filter: blur(8px) !important;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .custom-location-fields-compact {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 16px;
          padding: 20px;
          background: var(--glass-bg-tertiary, rgba(255, 255, 255, 0.4)) !important;
          backdrop-filter: blur(8px) !important;
          -webkit-backdrop-filter: blur(8px) !important;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        /* Compact form specific styling for custom location fields */
        .compact-form-horizontal .custom-location-fields-compact {
          margin-top: 8px;
          padding: 12px;
          gap: 8px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.6) !important;
          border: 1px solid rgba(0, 51, 102, 0.2);
        }
        
        .compact-form-horizontal .custom-location-fields-compact .form-select,
        .compact-form-horizontal .custom-location-fields-compact .form-input {
          padding: 6px 8px;
          font-size: 12px;
          height: 32px;
          border: 1px solid #003366;
          border-radius: 4px;
          background-color: white;
          color: #003366;
        }

        .drop-off-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .drop-off-location {
          margin-top: 12px;
        }

        .location-display {
          padding: 18px 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 16px;
          font-size: 16px;
          background: var(--glass-bg-quaternary, rgba(255, 255, 255, 0.5)) !important;
          backdrop-filter: blur(8px) !important;
          -webkit-backdrop-filter: blur(8px) !important;
          color: #6b7280;
          font-weight: 500;
          font-style: italic;
          box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.05),
            0 2px 4px -1px rgba(0, 0, 0, 0.03),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }

        .checkbox-group {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 500;
        }

        .checkbox-group input[type="checkbox"] {
          margin: 0;
          transform: scale(1.1);
        }

        .benefits-section {
          background: var(--glass-bg-tertiary, rgba(255, 255, 255, 0.4)) !important;
          backdrop-filter: blur(10px) !important;
          -webkit-backdrop-filter: blur(10px) !important;
          padding: 24px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.05),
            0 2px 4px -1px rgba(0, 0, 0, 0.03),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .benefits-section h4 {
          margin: 0 0 14px 0;
          font-size: 15px;
          font-weight: 700;
          color: #374151;
          letter-spacing: -0.01em;
        }

        .benefits-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .benefit-item {
          font-size: 13px;
          color: #6b7280;
          line-height: 1.5;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .benefit-item::before {
          content: "✓";
          color: #10b981;
          font-weight: bold;
          font-size: 14px;
        }

        .date-picker-wrapper {
          width: 100%;
        }
        
        :global(.date-picker-wrapper .react-datepicker-wrapper) {
          width: 100% !important;
        }
        
        :global(.date-picker-wrapper .react-datepicker__input-container) {
          width: 100% !important;
        }
        
        :global(.date-picker-wrapper .react-datepicker__input-container input) {
          padding: 14px 16px !important;
          border: 2px solid rgba(229, 231, 235, 0.6) !important;
          border-radius: 10px !important;
          font-size: 15px !important;
          transition: all 0.2s ease !important;
          background: rgba(255, 255, 255, 0.8) !important;
          font-weight: 500 !important;
          width: 100% !important;
          box-sizing: border-box !important;
          font-family: inherit !important;
          margin: 0 !important;
          }

        :global(.date-picker-input) {
          padding: 14px 16px !important;
          border: 2px solid rgba(229, 231, 235, 0.6) !important;
          border-radius: 10px !important;
          font-size: 15px !important;
          transition: all 0.2s ease !important;
          background: rgba(255, 255, 255, 0.8) !important;
          font-weight: 500 !important;
          width: 100% !important;
          box-sizing: border-box !important;
          font-family: inherit !important;
          appearance: none !important;
          -webkit-appearance: none !important;
          -moz-appearance: none !important;
        }
        
        :global(.date-picker-input:focus) {
          outline: none !important;
          border-color: #059669 !important;
          background: rgba(255, 255, 255, 0.9) !important;
          box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1) !important;
          transform: translateY(-1px) !important;
          }

        :global(.date-picker-input:hover) {
          border-color: rgba(209, 213, 219, 0.8) !important;
          background: rgba(255, 255, 255, 0.9) !important;
        }
        
        /* Modern Green DatePicker Calendar Styles */
        :global(.react-datepicker) {
          border: 2px solid #059669 !important;
          border-radius: 12px !important;
          font-family: inherit !important;
          box-shadow: 0 10px 25px rgba(5, 150, 105, 0.15) !important;
          overflow: hidden !important;
          }
        :global(.react-datepicker__header) {
          background: linear-gradient(135deg, #059669, #047857) !important;
          border-bottom: none !important;
          border-radius: 10px 10px 0 0 !important;
          padding: 16px 0 !important;
        }
        :global(.react-datepicker__current-month) {
          color: white !important;
          font-weight: 600 !important;
          font-size: 18px !important;
          margin-bottom: 8px !important;
          }
        :global(.react-datepicker__day-name) {
          color: white !important;
          font-weight: 500 !important;
          width: 40px !important;
          margin: 2px !important;
        }
        :global(.react-datepicker__navigation) {
          top: 18px !important;
          width: 24px !important;
          height: 24px !important;
          border-radius: 50% !important;
          background: rgba(255, 255, 255, 0.2) !important;
          transition: all 0.2s ease !important;
        }
        :global(.react-datepicker__navigation:hover) {
          background: rgba(255, 255, 255, 0.3) !important;
          transform: scale(1.1) !important;
        }
        :global(.react-datepicker__navigation--previous) {
          border-right-color: white !important;
          left: 12px !important;
        }
        :global(.react-datepicker__navigation--next) {
          border-left-color: white !important;
          right: 12px !important;
        }
        :global(.react-datepicker__day) {
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
        :global(.react-datepicker__day:hover) {
          background: linear-gradient(135deg, #10b981, #059669) !important;
          color: white !important;
          transform: scale(1.05) !important;
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3) !important;
        }
        :global(.react-datepicker__day--selected) {
          background: linear-gradient(135deg, #059669, #047857) !important;
          color: white !important;
          font-weight: 600 !important;
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.4) !important;
        }
        :global(.react-datepicker__day--selected:hover) {
          background: linear-gradient(135deg, #047857, #065f46) !important;
          transform: scale(1.05) !important;
        }
        :global(.react-datepicker__day--today) {
          background: linear-gradient(135deg, #d1fae5, #a7f3d0) !important;
          color: #065f46 !important;
          font-weight: 600 !important;
          border: 2px solid #10b981 !important;
        }
        :global(.react-datepicker__day--disabled) {
          color: #d1d5db !important;
          cursor: not-allowed !important;
          background: #f9fafb !important;
        }
        :global(.react-datepicker__day--disabled:hover) {
          background: #f9fafb !important;
          transform: none !important;
          box-shadow: none !important;
        }
        :global(.react-datepicker__month-container) {
          background: white !important;
        }
        :global(.react-datepicker__week) {
          display: flex !important;
          justify-content: space-around !important;
        }
      `}</style>
    </div>
  );
};

export default BookingForm; 
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Plus,
  Minus,
  Shield,
  Navigation,
  Baby,
  MapPin,
  Car,
  Calendar,
  AlertTriangle,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Vehicle {
  id: string;
  name: string;
  group: string;
  code: string;
  image: string;
  category: {
    name: string;
    seasonalPricings: Array<{
      id: string;
      group: string;
      categoryId: string;
      seasonId: string;
      price3to6Days: number;
      price7to14Days: number;
      price15PlusDays: number;
      season: {
        id: string;
        name: string;
        startDate: Date;
        endDate: Date;
        type: string | null;
      };
    }>;
  };
}

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

interface GeneralSettings {
  payOnlineDiscount: number;
  payOnArrivalDiscount: number;
}

interface SearchParams {
  vehicleId?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  pickupDate?: string;
  dropoffDate?: string;
  pickupTime?: string;
  dropoffTime?: string;
  days?: string;
  paymentType?: string;
}

interface Season {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  type: string | null;
}

interface Promotion {
  id: string;
  name: string;
  code: string;
  discount: number;
  startDate: Date;
  endDate: Date;
  visible: boolean;
  type: string | null;
}

interface ExtrasClientProps {
  vehicle: Vehicle;
  rentalOptions: RentalOption[];
  generalSettings: GeneralSettings;
  searchParams: SearchParams;
  currentSeason: Season | null;
  promotions: Promotion[];
}

interface SelectedExtra {
  id: string;
  quantity: number;
  price: number;
  isFree: boolean;
}

const ExtrasClient: React.FC<ExtrasClientProps> = ({
  vehicle,
  rentalOptions,
  generalSettings,
  searchParams,
  currentSeason,
  promotions
}) => {
  const router = useRouter();
  const [selectedExtras, setSelectedExtras] = useState<Map<string, SelectedExtra>>(new Map());
  const [showPromoCode, setShowPromoCode] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromotion, setAppliedPromotion] = useState<Promotion | null>(null);
  const [paymentType, setPaymentType] = useState<'online' | 'arrival'>(
    (searchParams.paymentType as 'online' | 'arrival') || 'online'
  );

  // Calculate rental days
  const days = parseInt(searchParams.days || '3');

  // Helper function to get price for days
  const getPriceForDays = (pricing: any, days: number): number => {
    if (days <= 6) {
      return pricing.price3to6Days;
    } else if (days <= 14) {
      return pricing.price7to14Days;
    } else {
      return pricing.price15PlusDays;
    }
  };

  // Calculate base vehicle price (before discounts)
  const getBaseVehiclePrice = (): number => {
    if (!currentSeason || !vehicle) return 0;
    
    const vehiclePricing = vehicle.category.seasonalPricings.find(
      (pricing: any) => 
        pricing.seasonId === currentSeason.id && 
        pricing.group === vehicle.group
    );

    if (!vehiclePricing) return 0;

    const basePrice = getPriceForDays(vehiclePricing, days);
    return basePrice * days;
  };

  // Calculate discounted vehicle price
  const getDiscountedVehiclePrice = (): number => {
    const basePrice = getBaseVehiclePrice();
    const discount = paymentType === 'online' 
      ? generalSettings.payOnlineDiscount / 100 
      : generalSettings.payOnArrivalDiscount / 100;
    
    return basePrice * (1 - discount);
  };

  // Apply promotional code
  const applyPromoCode = () => {
    const promotion = promotions.find(p => p.code.toLowerCase() === promoCode.toLowerCase());
    if (promotion) {
      setAppliedPromotion(promotion);
    } else {
      alert('Invalid promotion code');
    }
  };

  // Calculate promotional discount
  const getPromotionalDiscount = (): number => {
    if (!appliedPromotion) return 0;
    const basePrice = getBaseVehiclePrice();
    return basePrice * (appliedPromotion.discount / 100);
  };

  // Check if location is airport (for airport fee notice)
  const isAirportPickup = searchParams.pickupLocation?.toLowerCase().includes('airport') || false;
  const isAirportDropoff = searchParams.dropoffLocation?.toLowerCase().includes('airport') || false;
  const hasAirportFee = isAirportPickup || isAirportDropoff;

  // Get price for a rental option based on vehicle group
  const getPriceForOption = (option: RentalOption): number => {
    const tier = option.pricingTiers.find(tier => 
      tier.vehicleGroups.split(',').includes(vehicle.group)
    );
    return tier?.price || 0;
  };

  // Check if an option is free based on rental days
  const isOptionFree = (option: RentalOption): boolean => {
    if (!option.freeOverDays) return false;
    return days >= option.freeOverDays;
  };

  // Calculate total cost for an option
  const calculateOptionCost = (option: RentalOption, quantity: number): number => {
    if (isOptionFree(option)) return 0;
    
    const basePrice = getPriceForOption(option);
    let totalCost = 0;

    switch (option.priceType) {
      case 'per Day':
        totalCost = basePrice * quantity * days;
        break;
      case 'per Rental':
        totalCost = basePrice * quantity;
        break;
      case 'per day per driver':
        totalCost = basePrice * quantity * days;
        break;
      default:
        totalCost = basePrice * quantity;
    }

    // Apply max cost if set
    if (option.maxCost && totalCost > option.maxCost) {
      totalCost = option.maxCost;
    }

    return totalCost;
  };

  // Handle quantity change
  const handleQuantityChange = (option: RentalOption, newQuantity: number) => {
    const updatedExtras = new Map(selectedExtras);
    
    if (newQuantity <= 0) {
      updatedExtras.delete(option.id);
    } else {
      const quantity = Math.min(newQuantity, option.maxQty);
      const price = calculateOptionCost(option, quantity);
      const isFree = isOptionFree(option);
      
      updatedExtras.set(option.id, {
        id: option.id,
        quantity,
        price,
        isFree
      });
    }
    
    setSelectedExtras(updatedExtras);
  };

  // Calculate total extras cost
  const totalExtrasCost = Array.from(selectedExtras.values()).reduce(
    (total, extra) => total + extra.price, 0
  );

  // Get icon for rental option
  const getOptionIcon = (code: string) => {
    switch (code) {
      case 'SCDW':
        return <Shield className="h-6 w-6 text-blue-600" />;
      case 'TWU':
        return <Shield className="h-6 w-6 text-green-600" />;
      case 'GPS':
        return <Navigation className="h-6 w-6 text-purple-600" />;
      case 'BABY':
      case 'BOOST':
        return <Baby className="h-6 w-6 text-pink-600" />;
      default:
        return <Car className="h-6 w-6 text-gray-600" />;
    }
  };

  // Get image for rental option
  const getOptionImage = (option: RentalOption): string | null => {
    // First check if option has a photo field from database AND it's not the old admin-icons path
    if (option.photo && !option.photo.includes('/admin-icons/')) {
      return option.photo;
    }
    
    // Use predefined images based on code
    switch (option.code) {
      case 'TWU':
        return '/TWU.png';
      case 'BABY':
        return '/baby seat.jpg';
      case 'BOOST':
        return '/booster seat.jpg';
      default:
        return null;
    }
  };

  // Handle continue to review and pay
  const handleContinue = () => {
    const extrasParams = new URLSearchParams();
    
    // Add original search params
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) extrasParams.set(key, value);
    });

    // Add payment type
    extrasParams.set('paymentType', paymentType);

    // Add selected extras
    selectedExtras.forEach((extra, optionId) => {
      extrasParams.set(`extra_${optionId}`, extra.quantity.toString());
    });

    // Add applied promotion if any
    if (appliedPromotion) {
      extrasParams.set('promoCode', appliedPromotion.code);
      extrasParams.set('promoDiscount', appliedPromotion.discount.toString());
    }

    // Add pricing breakdown for review and pay page
    extrasParams.set('basePrice', getBaseVehiclePrice().toString());
    extrasParams.set('discountedPrice', getDiscountedVehiclePrice().toString());
    extrasParams.set('extrasTotal', totalExtrasCost.toString());
    extrasParams.set('totalAmount', (getDiscountedVehiclePrice() - getPromotionalDiscount() + totalExtrasCost).toString());

    router.push(`/en/review-and-pay?${extrasParams.toString()}`);
  };

  // Navigation functions for progress steps
  const goToSearch = () => {
    window.location.href = '/en/search';
  };

  const goToVehicleSelection = () => {
    const searchUrlParams = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== 'vehicleId') {
        searchUrlParams.set(key, value);
      }
    });
    window.location.href = `/en/search?${searchUrlParams.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center space-x-8">
            {/* Step 1 - Search (Completed) */}
              <button
                onClick={goToSearch}
                className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg p-2 transition-colors cursor-pointer"
              >
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                  1
                </div>
              <span className="font-medium text-gray-900">Search</span>
              </button>
            <div className="w-16 h-0.5 bg-blue-600"></div>
              
            {/* Step 2 - Choose Vehicle (Completed) */}
              <button
                onClick={goToVehicleSelection}
                className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg p-2 transition-colors cursor-pointer"
              >
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                  2
                </div>
              <span className="font-medium text-gray-900">Choose vehicle</span>
              </button>
            <div className="w-16 h-0.5 bg-blue-600"></div>
              
              {/* Step 3 - Choose Extras (Current) */}
              <div className="flex items-center space-x-2">
              <div className="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                  3
              </div>
              <span className="font-medium text-yellow-600">Choose extras</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
              
              {/* Step 4 - Review and Pay (Future) */}
              <div className="flex items-center space-x-2">
                <div className="bg-gray-300 text-gray-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <span className="text-gray-600">Review and Pay</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Extras Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Extras</h1>
              <p className="text-gray-600">Enhance your rental experience with our optional extras</p>
            </div>

            {/* Recommended Extras Section */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommended Extras</h2>
              
              {/* Free Notice for SCDW and TWU */}
              {(() => {
                const freeProtections = rentalOptions
                  .filter(option => ['SCDW', 'TWU'].includes(option.code) && isOptionFree(option))
                  .map(option => option.name);
                
                if (freeProtections.length > 0) {
                  return (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                      <div className="flex items-start">
                        <Info className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <h3 className="text-sm font-medium text-green-800">
                            Free Protection for {days}+ Day Rentals!
                          </h3>
                          <p className="text-sm text-green-700 mt-1">
                            {freeProtections.join(' and ')} {freeProtections.length === 1 ? 'is' : 'are'} included free for this rental period.
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {rentalOptions
                  .filter(option => ['SCDW', 'TWU'].includes(option.code))
                  .map((option) => {
                    const currentQuantity = selectedExtras.get(option.id)?.quantity || 0;
                    const price = getPriceForOption(option);
                    const totalCost = calculateOptionCost(option, 1);
                    const isFree = isOptionFree(option);

                    return (
                      <div key={option.id} className="border border-gray-200 rounded-lg p-4 hover:border-teal-300 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="bg-gray-100 rounded-lg p-2 w-16 h-16 flex items-center justify-center">
                              {getOptionImage(option) ? (
                                <img
                                  src={getOptionImage(option)!}
                                  alt={option.name}
                                  width={48}
                                  height={48}
                                  className="rounded-lg object-contain"
                                />
                              ) : (
                                getOptionIcon(option.code)
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{option.name}</h3>
                              <p className="text-sm text-gray-600">{option.description}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleQuantityChange(option, currentQuantity - 1)}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                              disabled={currentQuantity <= 0}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center font-medium">{currentQuantity}</span>
                            <button
                              onClick={() => handleQuantityChange(option, currentQuantity + 1)}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                              disabled={currentQuantity >= option.maxQty}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="text-right">
                            {isFree ? (
                              <div className="text-green-600 font-semibold">FREE</div>
                            ) : (
                              <>
                                <div className="font-semibold text-gray-900">€{price.toFixed(2)}</div>
                                <div className="text-xs text-gray-500">{option.priceType}</div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Other Extras */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Extras</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rentalOptions
                  .filter(option => !['SCDW', 'TWU'].includes(option.code))
                  .map((option) => {
                    const currentQuantity = selectedExtras.get(option.id)?.quantity || 0;
                    const price = getPriceForOption(option);
                    const totalCost = calculateOptionCost(option, 1);

                    return (
                      <div key={option.id} className="border border-gray-200 rounded-lg p-4 hover:border-teal-300 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="bg-gray-100 rounded-lg p-2 w-16 h-16 flex items-center justify-center">
                              {getOptionImage(option) ? (
                                <img
                                  src={getOptionImage(option)!}
                                  alt={option.name}
                                  width={48}
                                  height={48}
                                  className="rounded-lg object-contain"
                                />
                              ) : (
                                getOptionIcon(option.code)
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{option.name}</h3>
                              <p className="text-sm text-gray-600">{option.description}</p>
                              {option.maxCost && (
                                <p className="text-xs text-blue-600">Max cost: €{option.maxCost.toFixed(2)}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleQuantityChange(option, currentQuantity - 1)}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                              disabled={currentQuantity <= 0}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center font-medium">{currentQuantity}</span>
                            <button
                              onClick={() => handleQuantityChange(option, currentQuantity + 1)}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                              disabled={currentQuantity >= option.maxQty}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">€{price.toFixed(2)}</div>
                            <div className="text-xs text-gray-500">{option.priceType}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            {/* Vehicle Summary */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Selection</h3>
              
              <div className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Image
                    src={vehicle.image || "/vehicles/vehicle-placeholder.jpg"}
                    alt={vehicle.name}
                    width={80}
                    height={60}
                    className="rounded-lg object-contain"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{vehicle.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        Group {vehicle.group}
                      </span>
                      <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        Code: {vehicle.code}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Type Selection */}
              <div className="mb-4">
                <div className="grid grid-cols-2 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setPaymentType('online')}
                    className={`text-xs py-2 px-2 rounded-md transition-colors ${
                      paymentType === 'online' 
                        ? "bg-white text-gray-900 shadow-sm" 
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Pay Online ({generalSettings.payOnlineDiscount}% OFF)
                  </button>
                  <button
                    onClick={() => setPaymentType('arrival')}
                    className={`text-xs py-2 px-2 rounded-md transition-colors ${
                      paymentType === 'arrival' 
                        ? "bg-white text-gray-900 shadow-sm" 
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Pay on Arrival ({generalSettings.payOnArrivalDiscount}% OFF)
                  </button>
                </div>
              </div>

              {/* Rental Details */}
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center justify-between">
                  <span>Rental Period:</span>
                  <span className="font-medium">{days} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Pickup:</span>
                  <span className="font-medium">{searchParams.pickupLocation}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Dropoff:</span>
                  <span className="font-medium">{searchParams.dropoffLocation}</span>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="border-t pt-4 mb-4">
                <h4 className="font-semibold text-gray-900 mb-3">Pricing Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Basic Rate ({days} days):</span>
                    <span>€{getBaseVehiclePrice().toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-green-600">
                    <span>{paymentType === 'online' ? 'Online Payment' : 'Arrival Payment'} Discount ({paymentType === 'online' ? generalSettings.payOnlineDiscount : generalSettings.payOnArrivalDiscount}%):</span>
                    <span>-€{(getBaseVehiclePrice() - getDiscountedVehiclePrice()).toFixed(2)}</span>
                  </div>
                  {appliedPromotion && (
                    <div className="flex items-center justify-between text-blue-600">
                      <span>Promo "{appliedPromotion.code}" ({appliedPromotion.discount}%):</span>
                      <span>-€{getPromotionalDiscount().toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex items-center justify-between font-medium text-gray-900">
                    <span>Vehicle Subtotal:</span>
                    <span>€{(getDiscountedVehiclePrice() - getPromotionalDiscount()).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Selected Extras */}
              {selectedExtras.size > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Selected Extras</h4>
                  <div className="space-y-2">
                    {Array.from(selectedExtras.entries()).map(([optionId, extra]) => {
                      const option = rentalOptions.find(opt => opt.id === optionId);
                      if (!option) return null;
                      
                      return (
                        <div key={optionId} className="flex items-center justify-between text-sm">
                          <span>{option.name} x{extra.quantity}</span>
                          <span className="font-medium">
                            {extra.isFree ? 'FREE' : `€${extra.price.toFixed(2)}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t mt-3 pt-3">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>Extras Subtotal:</span>
                      <span>€{totalExtrasCost.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between font-semibold text-lg">
                      <span>Total Amount Payable:</span>
                      <span className="text-teal-600">€{(getDiscountedVehiclePrice() - getPromotionalDiscount() + totalExtrasCost).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Airport Fee Notice */}
              {hasAirportFee && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                  <div className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-yellow-800">
                        <strong>Airport charge €20</strong> for ON airport deliveries
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        This fee is paid upon arrival and not included in the total.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Promo Code */}
              <div className="mt-6">
                {!showPromoCode ? (
                  <button
                    onClick={() => setShowPromoCode(true)}
                    className="text-teal-600 text-sm font-medium hover:text-teal-700"
                  >
                    + Add Promotion Code
                  </button>
                ) : (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Promotion Code
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Enter code"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                      <button 
                        onClick={applyPromoCode}
                        className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-md text-sm font-medium"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
                
                {appliedPromotion && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-800">
                          Promotion Applied: {appliedPromotion.name}
                        </p>
                        <p className="text-xs text-blue-600">
                          Code: {appliedPromotion.code} ({appliedPromotion.discount}% off basic rate)
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setAppliedPromotion(null);
                          setPromoCode('');
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleContinue}
                  className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
                >
                  Continue to Review & Pay
                </button>
                <button
                  onClick={() => router.back()}
                  className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back to Vehicle Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExtrasClient; 
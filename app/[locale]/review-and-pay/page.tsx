import React from 'react';
import { prisma } from '@/lib/prisma';
import ReviewAndPayClient from './ReviewAndPayClient';

async function getGlassmorphismSetting() {
  const settings = await prisma.generalSetting.findFirst();
  return settings?.glassmorphismEnabled ?? true;
}

async function getGeneralSettings() {
  const settings = await prisma.generalSetting.findFirst();
  return settings || {
    payOnlineDiscount: 15,
    payOnArrivalDiscount: 10,
    vatPercentage: 19,
  };
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
  promoCode?: string;
  promoDiscount?: string;
  basePrice?: string;
  discountedPrice?: string;
  extrasTotal?: string;
  totalAmount?: string;
  [key: string]: string | undefined; // For dynamic extra_* parameters
}

export default async function ReviewAndPayPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [glassmorphismEnabled, generalSettings] = await Promise.all([
    getGlassmorphismSetting(),
    getGeneralSettings(),
  ]);

  // Mock vehicle data - in real app, fetch from database using vehicleId
  const mockVehicle = {
    id: searchParams.vehicleId || '1',
    name: 'HYUNDAI I10 A/C',
    image: '/vehicles/saloon-automatic/A5 HYUNDAI i10.jpg',
    category: 'Economy',
    transmission: 'Automatic',
    seats: 4,
    doors: 5,
    ac: true,
  };

  // Mock rental options - in real app, fetch from database
  const mockRentalOptions = [
    {
      id: '1',
      name: 'Baby Seat',
      description: 'Safety seat for infants and toddlers',
      price: 5.00,
      image: '/rental-options/baby_1751039011809.jpg',
    },
    {
      id: '2',
      name: 'Booster Seat',
      description: 'Booster seat for children',
      price: 5.00,
      image: '/rental-options/boost_1751039063744.jpg',
    },
    {
      id: '3',
      name: 'Personal Accident Insurance',
      description: 'Additional personal protection',
      price: 8.00,
      image: '/rental-options/pai_1751039311794.webp',
    },
    {
      id: '4',
      name: 'Theft Waiver Upgrade',
      description: 'Enhanced theft protection',
      price: 12.00,
      image: '/rental-options/twu_1751038104826.png',
    },
  ];

  return (
    <ReviewAndPayClient
      glassmorphismEnabled={glassmorphismEnabled}
      generalSettings={generalSettings}
      searchParams={searchParams}
      vehicle={mockVehicle}
      rentalOptions={mockRentalOptions}
    />
  );
} 
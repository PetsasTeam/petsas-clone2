import { prisma } from '@/lib/prisma';
import ExtrasClient from './ExtrasClient';

interface SearchParams {
  vehicleId?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  pickupDate?: string;
  dropoffDate?: string;
  pickupTime?: string;
  dropoffTime?: string;
  days?: string;
  paymentType?: string; // 'online' or 'arrival'
}

async function getExtrasData(searchParams: SearchParams) {
  try {
    // Get the selected vehicle with category and pricing
    const vehicle = searchParams.vehicleId ? await prisma.vehicle.findUnique({
      where: { id: searchParams.vehicleId },
      include: {
        category: {
          include: {
            seasonalPricings: {
              include: {
                season: true
              }
            }
          }
        }
      }
    }) : null;

    // Get current season based on pickup date
    const pickupDate = searchParams.pickupDate ? new Date(searchParams.pickupDate) : new Date();
    
    const currentSeason = await prisma.season.findFirst({
      where: {
        startDate: {
          lte: pickupDate
        },
        endDate: {
          gte: pickupDate
        }
      }
    });

    // Get all visible rental options with their pricing tiers
    const rentalOptions = await prisma.rentalOption.findMany({
      where: {
        visible: true
      },
      include: {
        pricingTiers: true
      },
      orderBy: {
        displayOrder: 'asc'
      }
    });

    // Get all active promotions
    const promotions = await prisma.promotion.findMany({
      where: {
        visible: true,
        startDate: {
          lte: new Date()
        },
        endDate: {
          gte: new Date()
        }
      }
    });

    // Get or create general settings
    const settingsResult = await prisma.generalSetting.upsert({
      where: { id: 'default' },
      update: {},
      create: {
        maxRowsPerPage: 500,
        vatPercentage: 19.0,
        payOnArrivalDiscount: 10.0,
        payOnlineDiscount: 15.0,
        nextInvoiceNumber: "14312",
        contactEmail: 'info@petsas.com.cy',
        contactPhone: '+357 22 00 00 00',
        socialFacebook: '',
        socialInstagram: '',
        socialLinkedin: '',
        socialTwitter: '',
        glassmorphismEnabled: false,
      }
    });

    return { vehicle, rentalOptions, generalSettings: settingsResult, searchParams, currentSeason, promotions };
  } catch (error) {
    console.error("Failed to load extras data:", error);
    throw new Error("Failed to load extras data");
  }
}

export default async function ExtrasPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { vehicle, rentalOptions, generalSettings, searchParams: params, currentSeason, promotions } = await getExtrasData(searchParams);

  // Validate required parameters
  if (!searchParams.pickupLocation || !searchParams.dropoffLocation || !searchParams.pickupDate || !searchParams.dropoffDate || !searchParams.vehicleId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Missing Required Information</h1>
          <p className="text-gray-600 mb-4">
            Vehicle selection is required. Please start from the vehicle selection page.
          </p>
          <a href="/search" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Back to Search
          </a>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Vehicle Not Found</h1>
          <p className="text-gray-600 mb-4">
            The selected vehicle could not be found. Please go back and select a vehicle.
          </p>
          <a href="/search" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Back to Search
          </a>
        </div>
      </div>
    );
  }

  return (
    <ExtrasClient 
      vehicle={vehicle}
      rentalOptions={rentalOptions}
      generalSettings={generalSettings}
      searchParams={params}
      currentSeason={currentSeason}
      promotions={promotions}
    />
  );
}
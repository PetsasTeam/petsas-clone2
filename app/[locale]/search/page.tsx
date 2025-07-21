import { PrismaClient } from '../../generated/prisma';
import SearchPageClient from './SearchPageClient';

// Singleton Prisma client to prevent connection issues
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

interface SearchParams {
  pickupLocation?: string;
  dropoffLocation?: string;
  pickupDate?: string;
  dropoffDate?: string;
  pickupTime?: string;
  dropoffTime?: string;
}

interface Props {
  searchParams: SearchParams;
}

async function getSearchResults(searchParams: SearchParams) {
  try {
    // Get all visible vehicle categories with their vehicles
    const categories = await prisma.vehicleCategory.findMany({
      where: {
        visible: true
      },
      include: {
        vehicles: {
          where: {
            visible: true
          }
        },
        seasonalPricings: {
          include: {
            season: true
          }
        }
      },
      orderBy: {
        displayOrder: 'asc'
      }
    });

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

    let generalSettings = null;
    try {
      generalSettings = await prisma.generalSetting.upsert({
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
    } catch (error) {
      console.error("Failed to fetch general settings:", error);
    }

    // Get locations for the search dropdowns
    const locations = await prisma.location.findMany({
      where: { 
        visible: true 
      },
      orderBy: { displayOrder: 'asc' },
      select: {
        id: true,
        name: true,
        type: true,
        visible: true,
        isPickupPoint: true,
        isDropoffPoint: true,
      }
    });

    return { categories, currentSeason, searchParams, generalSettings, locations };
  } catch (error) {
    console.error("Database query failed:", error);
    throw new Error("Failed to load search results");
  }
}

export default async function SearchPage({ searchParams }: Props) {
  const { categories, currentSeason, searchParams: params, generalSettings, locations } = await getSearchResults(searchParams);
  
  return (
    <SearchPageClient 
      categories={categories} 
      currentSeason={currentSeason} 
      searchParams={params} 
      generalSettings={generalSettings}
      locations={locations}
    />
  );
} 
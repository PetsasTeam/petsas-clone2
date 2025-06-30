import { PrismaClient, Season, VehicleCategory, SeasonalPricing } from '../../../../../app/generated/prisma';
import EditRentalPeriodForm from './EditRentalPeriodForm';

const prisma = new PrismaClient();

async function getPeriod(id: string) {
  const period = await prisma.season.findUnique({
    where: { id },
  });
  if (!period) {
    throw new Error('Rental period not found');
  }
  return period;
}

async function getCategoriesWithPricing(seasonId: string): Promise<SeasonalPricing[]> {
    const categories = await prisma.vehicleCategory.findMany({
        orderBy: { displayOrder: 'asc' },
        include: {
            vehicles: {
                orderBy: { name: 'asc' },
            },
        },
    });

    const pricings = await prisma.seasonalPricing.findMany({
        where: { seasonId },
    });

    const pricingMap = new Map<string, SeasonalPricing>();
    pricings.forEach((p: SeasonalPricing) => pricingMap.set(`${p.categoryId}-${p.group}`, p));

    // We need to ensure a pricing entry exists for every vehicle group in this season.
    // If it doesn't, we create it. This is important for new vehicles/categories.
    const upsertPromises: any[] = [];
    categories.forEach(category => {
        category.vehicles.forEach(vehicle => {
            if (!pricingMap.has(`${category.id}-${vehicle.group}`)) {
                upsertPromises.push(
                    prisma.seasonalPricing.create({
                        data: {
                            seasonId,
                            categoryId: category.id,
                            group: vehicle.group,
                            price3to6Days: 0,
                            price7to14Days: 0,
                            price15PlusDays: 0,
                        },
                    })
                );
            }
        });
    });

    await Promise.all(upsertPromises);

    // Refetch pricings if we added any new ones
    if (upsertPromises.length > 0) {
        const allPricings = await prisma.seasonalPricing.findMany({
            where: { seasonId },
        });
        return allPricings;
    }
    
    return pricings;
}

export default async function EditRentalPeriodPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const period = await getPeriod(id);
  const pricings = await getCategoriesWithPricing(id);
  const categories = await prisma.vehicleCategory.findMany({
    include: {
        vehicles: {
            orderBy: { name: 'asc' },
        },
    },
    orderBy: {
        displayOrder: 'asc'
    }
  });

  return (
    <EditRentalPeriodForm period={period} categories={categories as (VehicleCategory & { vehicles: any[] })[]} pricings={pricings} />
  );
} 
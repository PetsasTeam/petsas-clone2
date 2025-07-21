import { PrismaClient } from '../app/generated/prisma';

const prisma = new PrismaClient();

async function restoreSummerPrices() {
  const summerSeason = await prisma.season.findFirst({
    where: { type: 'Summer' },
  });

  if (!summerSeason) {
    console.log('No summer season found. Please ensure there is a season with type "Summer".');
    return;
  }

  const categories = await prisma.vehicleCategory.findMany();

  const getCategoryId = (name: string) => categories.find(c => c.name === name)?.id;

  const saloonManual = getCategoryId('Saloon Manual Transmission');
  const saloonAuto = getCategoryId('Saloon Automatic Transmission');
  const cabrio = getCategoryId('Cabrio / Open Top');
  const peopleCarrier = getCategoryId('People Carrier/Wheelchair Accessible Vehicles');
  const suv = getCategoryId('SUV / 4WD');

  if (!saloonManual || !saloonAuto || !cabrio || !peopleCarrier || !suv) {
    console.log('One or more categories not found. Please check category names.');
    return;
  }

  const pricingData = [
    // Saloon Manual Transmission
    { categoryId: saloonManual, group: 'A3', price3to6Days: 47, price7to14Days: 36, price15PlusDays: 31 },
    { categoryId: saloonManual, group: 'B3', price3to6Days: 52, price7to14Days: 40, price15PlusDays: 36 },
    { categoryId: saloonManual, group: 'C2', price3to6Days: 57, price7to14Days: 45, price15PlusDays: 40 },
    { categoryId: saloonManual, group: 'C4', price3to6Days: 61, price7to14Days: 49, price15PlusDays: 45 },
    { categoryId: saloonManual, group: 'D1', price3to6Days: 61, price7to14Days: 49, price15PlusDays: 45 },
    { categoryId: saloonManual, group: 'D4', price3to6Days: 66, price7to14Days: 54, price15PlusDays: 49 },

    // Saloon Automatic Transmission
    { categoryId: saloonAuto, group: 'A5', price3to6Days: 57, price7to14Days: 45, price15PlusDays: 40 },
    { categoryId: saloonAuto, group: 'B5', price3to6Days: 61, price7to14Days: 49, price15PlusDays: 45 },
    { categoryId: saloonAuto, group: 'C3', price3to6Days: 66, price7to14Days: 54, price15PlusDays: 49 },
    { categoryId: saloonAuto, group: 'D5', price3to6Days: 71, price7to14Days: 58, price15PlusDays: 54 },
    { categoryId: saloonAuto, group: 'D6', price3to6Days: 76, price7to14Days: 63, price15PlusDays: 58 },
    { categoryId: saloonAuto, group: 'D7', price3to6Days: 80, price7to14Days: 67, price15PlusDays: 63 },
    { categoryId: saloonAuto, group: 'H2', price3to6Days: 114, price7to14Days: 94, price15PlusDays: 85 },
    { categoryId: saloonAuto, group: 'H8', price3to6Days: 209, price7to14Days: 180, price15PlusDays: 166 },
    { categoryId: saloonAuto, group: 'H6', price3to6Days: 285, price7to14Days: 247, price15PlusDays: 225 },
    // Assuming H7 has same as H6 or adjust if known
    { categoryId: saloonAuto, group: 'H7', price3to6Days: 285, price7to14Days: 247, price15PlusDays: 225 },

    // Cabrio / Open Top
    { categoryId: cabrio, group: 'T1', price3to6Days: 76, price7to14Days: 63, price15PlusDays: 54 },
    { categoryId: cabrio, group: 'T6', price3to6Days: 237, price7to14Days: 207, price15PlusDays: 189 },
    { categoryId: cabrio, group: 'T8', price3to6Days: 361, price7to14Days: 315, price15PlusDays: 297 },

    // People Carrier/Wheelchair Accessible Vehicles
    { categoryId: peopleCarrier, group: 'V5', price3to6Days: 100, price7to14Days: 90, price15PlusDays: 80 },
    { categoryId: peopleCarrier, group: 'V7', price3to6Days: 200, price7to14Days: 180, price15PlusDays: 160 },
    { categoryId: peopleCarrier, group: 'V8', price3to6Days: 250, price7to14Days: 230, price15PlusDays: 210 },
    { categoryId: peopleCarrier, group: 'V9', price3to6Days: 350, price7to14Days: 320, price15PlusDays: 300 },
    { categoryId: peopleCarrier, group: 'W3', price3to6Days: 170, price7to14Days: 140, price15PlusDays: 120 },
    { categoryId: peopleCarrier, group: 'W4', price3to6Days: 170, price7to14Days: 140, price15PlusDays: 120 },

    // SUV / 4WD
    { categoryId: suv, group: 'EW', price3to6Days: 76, price7to14Days: 63, price15PlusDays: 58 },
    { categoryId: suv, group: 'EC', price3to6Days: 76, price7to14Days: 63, price15PlusDays: 58 },
    { categoryId: suv, group: 'EY', price3to6Days: 95, price7to14Days: 81, price15PlusDays: 72 },
    { categoryId: suv, group: 'EH', price3to6Days: 95, price7to14Days: 81, price15PlusDays: 72 },
    { categoryId: suv, group: 'E3', price3to6Days: 114, price7to14Days: 94, price15PlusDays: 85 },
    { categoryId: suv, group: 'EQ', price3to6Days: 123, price7to14Days: 103, price15PlusDays: 90 },
    { categoryId: suv, group: 'ER', price3to6Days: 152, price7to14Days: 130, price15PlusDays: 112 },
    { categoryId: suv, group: 'E5', price3to6Days: 123, price7to14Days: 103, price15PlusDays: 90 },
    { categoryId: suv, group: 'G3', price3to6Days: 171, price7to14Days: 144, price15PlusDays: 130 },
    { categoryId: suv, group: 'G4', price3to6Days: 237, price7to14Days: 207, price15PlusDays: 189 },
    { categoryId: suv, group: 'G5', price3to6Days: 285, price7to14Days: 247, price15PlusDays: 225 },
    { categoryId: suv, group: 'G9', price3to6Days: 475, price7to14Days: 405, price15PlusDays: 378 }
  ];

  let updatedCount = 0;
  for (const data of pricingData) {
    const result = await prisma.seasonalPricing.upsert({
      where: {
        categoryId_seasonId_group: {
          categoryId: data.categoryId,
          seasonId: summerSeason.id,
          group: data.group,
        },
      },
      update: {
        price3to6Days: data.price3to6Days,
        price7to14Days: data.price7to14Days,
        price15PlusDays: data.price15PlusDays,
        basePrice3to6Days: data.price3to6Days,
        basePrice7to14Days: data.price7to14Days,
        basePrice15PlusDays: data.price15PlusDays,
      },
      create: {
        seasonId: summerSeason.id,
        categoryId: data.categoryId,
        group: data.group,
        price3to6Days: data.price3to6Days,
        price7to14Days: data.price7to14Days,
        price15PlusDays: data.price15PlusDays,
        basePrice3to6Days: data.price3to6Days,
        basePrice7to14Days: data.price7to14Days,
        basePrice15PlusDays: data.price15PlusDays,
      },
    });
    updatedCount++;
  }

  console.log(`Restored prices for ${updatedCount} entries in Summer season.`);
}

restoreSummerPrices()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
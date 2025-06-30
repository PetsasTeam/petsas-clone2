import { PrismaClient } from '../app/generated/prisma';

const prisma = new PrismaClient();

async function seedRentalOptions() {
  console.log('🌱 Seeding rental options...');

  // Create rental options with their pricing tiers
  const rentalOptionsData = [
    {
      code: 'SCDW',
      name: 'Super Collision Damage Waiver',
      displayOrder: 1,
      visible: true,
      maxQty: 1,
      priceType: 'per Day',
      maxCost: null,
      freeOverDays: 7,
      photo: '/admin-icons/scdw-icon.gif',
      description: 'Reduces your liability for damage to the rental vehicle',
      pricingTiers: [
        { vehicleGroups: 'A3,B3,C2,C4,D1,D4,A5,B5,C3,D5,D6,D7,T1,EW,EY', price: 10.00 },
        { vehicleGroups: 'H1,H2,T5,V3,V5,E3,EC,EH', price: 15.00 },
        { vehicleGroups: 'EQ,E5,G3,ER', price: 20.00 },
        { vehicleGroups: 'H6,H7,T8,T6,V7,V9,W3,V8,G4,G9,G5', price: 30.00 },
      ]
    },
    {
      code: 'TWU',
      name: 'Tyres, Windscreen, Underbody',
      displayOrder: 2,
      visible: true,
      maxQty: 1,
      priceType: 'per Day',
      maxCost: null,
      freeOverDays: null,
      photo: '/admin-icons/twu-icon.gif',
      description: 'Covers damage to tyres, windscreen, and underbody',
      pricingTiers: [
        { vehicleGroups: 'A3,B3,C2,C4,D1,D4,A5,B5,C3,D5,D6,D7,T1,EW,EY', price: 5.00 },
        { vehicleGroups: 'H1,H2,T5,V3,V5,E3,EC,EH', price: 7.00 },
        { vehicleGroups: 'EQ,E5,G3,ER', price: 10.00 },
        { vehicleGroups: 'H6,H7,T8,T6,V7,V9,W3,V8,G4,G9,G5', price: 15.00 },
      ]
    },
    {
      code: 'PAI',
      name: 'Personal Accident Insurance',
      displayOrder: 3,
      visible: true,
      maxQty: 3,
      priceType: 'per day per driver',
      maxCost: null,
      freeOverDays: null,
      photo: '/admin-icons/pai-icon.gif',
      description: 'Personal accident insurance for drivers and passengers',
      pricingTiers: [
        { vehicleGroups: 'A3,B3,C2,C4,D1,D4,A5,B5,C3,D5,D6,D7,T1,EW,EY,H1,H2,T5,V3,V5,E3,EC,EH,EQ,E5,G3,ER,H6,H7,T8,T6,V7,V9,W3,V8,G4,G9,G5', price: 3.00 },
      ]
    },
    {
      code: 'GPS',
      name: 'GPS',
      displayOrder: 4,
      visible: true,
      maxQty: 1,
      priceType: 'per Day',
      maxCost: 40.00,
      freeOverDays: null,
      photo: '/admin-icons/gps-icon.gif',
      description: 'GPS Navigation System',
      pricingTiers: [
        { vehicleGroups: 'A3,B3,C2,C4,D1,D4,A5,B5,C3,D5,D6,D7,T1,EW,EY,H1,H2,T5,V3,V5,E3,EC,EH,EQ,E5,G3,ER,H6,H7,T8,T6,V7,V9,W3,V8,G4,G9,G5', price: 5.00 },
      ]
    },
    {
      code: 'BABY',
      name: 'Baby Seat',
      displayOrder: 5,
      visible: true,
      maxQty: 3,
      priceType: 'per Rental',
      maxCost: null,
      freeOverDays: null,
      photo: '/admin-icons/baby-icon.gif',
      description: 'Child safety seat for babies (0-13 months)',
      pricingTiers: [
        { vehicleGroups: 'A3,B3,C2,C4,D1,D4,A5,B5,C3,D5,D6,D7,T1,EW,EY,H1,H2,T5,V3,V5,E3,EC,EH,EQ,E5,G3,ER,H6,H7,T8,T6,V7,V9,W3,V8,G4,G9,G5', price: 25.00 },
      ]
    },
    {
      code: 'BOOST',
      name: 'Booster Seat',
      displayOrder: 6,
      visible: true,
      maxQty: 3,
      priceType: 'per Rental',
      maxCost: null,
      freeOverDays: null,
      photo: '/admin-icons/boost-icon.gif',
      description: 'Booster seat for children (4-12 years)',
      pricingTiers: [
        { vehicleGroups: 'A3,B3,C2,C4,D1,D4,A5,B5,C3,D5,D6,D7,T1,EW,EY,H1,H2,T5,V3,V5,E3,EC,EH,EQ,E5,G3,ER,H6,H7,T8,T6,V7,V9,W3,V8,G4,G9,G5', price: 20.00 },
      ]
    },
    {
      code: 'ROOF',
      name: 'Roof Rack',
      displayOrder: 7,
      visible: true,
      maxQty: 1,
      priceType: 'per Rental',
      maxCost: null,
      freeOverDays: null,
      photo: '/admin-icons/roof-icon.gif',
      description: 'Roof rack for additional luggage',
      pricingTiers: [
        { vehicleGroups: 'A3,B3,C2,C4,D1,D4,A5,B5,C3,D5,D6,D7,T1,EW,EY,H1,H2,T5,V3,V5,E3,EC,EH,EQ,E5,G3,ER,H6,H7,T8,T6,V7,V9,W3,V8,G4,G9,G5', price: 15.00 },
      ]
    }
  ];

  for (const optionData of rentalOptionsData) {
    const { pricingTiers, ...rentalOptionFields } = optionData;
    
    // Create the rental option
    const rentalOption = await prisma.rentalOption.upsert({
      where: { code: optionData.code },
      update: rentalOptionFields,
      create: rentalOptionFields,
    });

    console.log(`✅ Created/Updated rental option: ${rentalOption.name}`);

    // Delete existing pricing tiers for this option
    await prisma.rentalOptionPricing.deleteMany({
      where: { rentalOptionId: rentalOption.id }
    });

    // Create new pricing tiers
    for (const tier of pricingTiers) {
      await prisma.rentalOptionPricing.create({
        data: {
          rentalOptionId: rentalOption.id,
          vehicleGroups: tier.vehicleGroups,
          price: tier.price,
        }
      });
    }

    console.log(`✅ Created ${pricingTiers.length} pricing tiers for ${rentalOption.name}`);
  }

  console.log('🎉 Rental options seeding completed!');
}

async function main() {
  try {
    await seedRentalOptions();
  } catch (error) {
    console.error('❌ Error seeding rental options:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

export default main; 
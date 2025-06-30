import { PrismaClient } from '../app/generated/prisma';

const prisma = new PrismaClient();

async function seedLocations() {
  console.log('🌱 Seeding locations...');

  const locationsData = [
    {
      name: 'Larnaka Airport',
      type: 'Airport',
      displayOrder: 1,
      visible: true,
      address: 'Larnaka International Airport, Larnaka',
      city: 'Larnaka',
      postcode: '7130',
      country: 'Cyprus',
      phone: '+357 24 643 576',
      email: 'larnaka@petsas.com',
      openingHours: '24/7',
      latitude: 34.8751,
      longitude: 33.6249,
      instructions: 'Meet & Greet service available at Arrivals Hall. Look for PETSAS sign.',
      facilities: 'Meet & Greet, 24/7 Operation, Fast Check-in, Free WiFi',
      isPickupPoint: true,
      isDropoffPoint: true,
      hasDelivery: false,
      deliveryRadius: null,
      deliveryFee: null,
    },
    {
      name: 'Pafos Airport',
      type: 'Airport',
      displayOrder: 2,
      visible: true,
      address: 'Pafos International Airport, Pafos',
      city: 'Pafos',
      postcode: '8061',
      country: 'Cyprus',
      phone: '+357 26 422 833',
      email: 'pafos@petsas.com',
      openingHours: '24/7',
      latitude: 34.7180,
      longitude: 32.4857,
      instructions: 'Meet & Greet service available at Arrivals Hall. Look for PETSAS sign.',
      facilities: 'Meet & Greet, 24/7 Operation, Fast Check-in, Free WiFi',
      isPickupPoint: true,
      isDropoffPoint: true,
      hasDelivery: false,
      deliveryRadius: null,
      deliveryFee: null,
    },
    {
      name: 'Pafos Office',
      type: 'Office',
      displayOrder: 3,
      visible: true,
      address: '12 Apostolou Pavlou Avenue, Pafos',
      city: 'Pafos',
      postcode: '8046',
      country: 'Cyprus',
      phone: '+357 26 934 444',
      email: 'pafos.office@petsas.com',
      openingHours: 'Mon-Sat: 8:00-19:00, Sun: 9:00-17:00',
      latitude: 34.7767,
      longitude: 32.4238,
      instructions: 'Located in the city center, near the harbor. Free parking available.',
      facilities: 'Full Service Desk, Local Support, Free Parking, Customer Lounge',
      isPickupPoint: true,
      isDropoffPoint: true,
      hasDelivery: true,
      deliveryRadius: 20,
      deliveryFee: 0,
    },
    {
      name: 'Limassol Office',
      type: 'Office',
      displayOrder: 4,
      visible: true,
      address: '45 Makarios III Avenue, Limassol',
      city: 'Limassol',
      postcode: '3025',
      country: 'Cyprus',
      phone: '+357 25 362 777',
      email: 'limassol@petsas.com',
      openingHours: 'Mon-Sat: 8:00-19:00, Sun: 9:00-17:00',
      latitude: 34.6851,
      longitude: 33.0442,
      instructions: 'Located on the main avenue, opposite the Marina. Paid parking nearby.',
      facilities: 'Full Service Desk, Local Support, Customer Lounge, Refreshments',
      isPickupPoint: true,
      isDropoffPoint: true,
      hasDelivery: true,
      deliveryRadius: 25,
      deliveryFee: 10,
    },
    {
      name: 'Ayia Napa Office',
      type: 'Office',
      displayOrder: 5,
      visible: true,
      address: '23 Nissi Avenue, Ayia Napa',
      city: 'Ayia Napa',
      postcode: '5330',
      country: 'Cyprus',
      phone: '+357 23 721 555',
      email: 'ayianapa@petsas.com',
      openingHours: 'Mon-Sun: 8:00-20:00 (Summer), 8:00-18:00 (Winter)',
      latitude: 34.9823,
      longitude: 34.0013,
      instructions: 'Located near the main square, close to popular hotels.',
      facilities: 'Full Service Desk, Local Support, Tourist Information',
      isPickupPoint: true,
      isDropoffPoint: true,
      hasDelivery: true,
      deliveryRadius: 15,
      deliveryFee: 5,
    },
    {
      name: 'Nicosia Office',
      type: 'Office',
      displayOrder: 6,
      visible: true,
      address: '89 Ledra Street, Nicosia',
      city: 'Nicosia',
      postcode: '1011',
      country: 'Cyprus',
      phone: '+357 22 456 789',
      email: 'nicosia@petsas.com',
      openingHours: 'Mon-Fri: 8:00-18:00, Sat: 9:00-15:00, Sun: Closed',
      latitude: 35.1676,
      longitude: 33.3736,
      instructions: 'Located in the old town, near the Green Line. Public parking available.',
      facilities: 'Full Service Desk, Local Support, Business Center',
      isPickupPoint: true,
      isDropoffPoint: true,
      hasDelivery: true,
      deliveryRadius: 30,
      deliveryFee: 15,
    },
    {
      name: 'Protaras Office',
      type: 'Office',
      displayOrder: 7,
      visible: true,
      address: '15 Protaras Avenue, Protaras',
      city: 'Protaras',
      postcode: '5296',
      country: 'Cyprus',
      phone: '+357 23 831 222',
      email: 'protaras@petsas.com',
      openingHours: 'Mon-Sun: 8:00-19:00 (Summer), 9:00-17:00 (Winter)',
      latitude: 35.0128,
      longitude: 34.0583,
      instructions: 'Located near Fig Tree Bay, easy access from main hotels.',
      facilities: 'Full Service Desk, Local Support, Beach Information',
      isPickupPoint: true,
      isDropoffPoint: true,
      hasDelivery: true,
      deliveryRadius: 10,
      deliveryFee: 0,
    },
    {
      name: 'Troodos Office',
      type: 'Office',
      displayOrder: 8,
      visible: false, // Seasonal location
      address: 'Troodos Square, Troodos',
      city: 'Troodos',
      postcode: '4820',
      country: 'Cyprus',
      phone: '+357 25 421 333',
      email: 'troodos@petsas.com',
      openingHours: 'Seasonal: Dec-Mar: 8:00-17:00, Closed Apr-Nov',
      latitude: 34.9263,
      longitude: 32.8740,
      instructions: 'Seasonal location for mountain activities. Winter sports equipment available.',
      facilities: 'Seasonal Service, Mountain Equipment, Local Guides',
      isPickupPoint: true,
      isDropoffPoint: true,
      hasDelivery: false,
      deliveryRadius: null,
      deliveryFee: null,
    }
  ];

  for (const locationData of locationsData) {
    const location = await prisma.location.upsert({
      where: { name: locationData.name },
      update: locationData,
      create: locationData,
    });

    console.log(`✅ Created/Updated location: ${location.name}`);
  }

  console.log('🎉 Locations seeding completed!');
}

async function main() {
  try {
    await seedLocations();
  } catch (error) {
    console.error('❌ Error seeding locations:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

export default main; 
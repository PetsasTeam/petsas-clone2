import { PrismaClient } from '../app/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction(async (tx) => {
    // Clear existing data
    await tx.booking.deleteMany();
    await tx.customer.deleteMany();
    await tx.promotion.deleteMany();
    await tx.seasonalPricing.deleteMany();
    await tx.vehicle.deleteMany();
    await tx.season.deleteMany();
    await tx.vehicleCategory.deleteMany();

    // Create Vehicle Categories
    const saloonManualCategory = await tx.vehicleCategory.create({ 
      data: { name: 'Saloon Manual Transmission', displayOrder: 1 } 
    });
    const saloonAutoCategory = await tx.vehicleCategory.create({ 
      data: { name: 'Saloon Automatic Transmission', displayOrder: 2 } 
    });
    const cabrioCategory = await tx.vehicleCategory.create({ 
      data: { name: 'Cabrio / Open Top', displayOrder: 3 } 
    });
    const peopleCarrierCategory = await tx.vehicleCategory.create({ 
      data: { name: 'People Carrier/Wheelchair Accessible Vehicles', displayOrder: 4 } 
    });
    const suvCategory = await tx.vehicleCategory.create({ 
      data: { name: 'SUV / 4WD', displayOrder: 5 } 
    });

    // Create Season for April 1st 2025 - October 31st 2025
    const season2025 = await tx.season.create({ 
      data: { 
        name: 'Summer Season 2025', 
        startDate: new Date('2025-04-01'), 
        endDate: new Date('2025-10-31'), 
        type: 'Summer' 
      } 
    });

    // Create all vehicles with their respective categories
    const vehicleData = [
      // Saloon Manual Transmission
      { group: 'A3', code: 'MBMV', name: 'HYUNDAI i10 A/C or similar', image: '/vehicles/saloon-manual/A3 hyundai i10.jpg', engineSize: '1000cc', doors: 3, seats: 4, transmission: 'Manual', bigLuggages: 0, smallLuggages: 2, hasAC: true, categoryId: saloonManualCategory.id },
      { group: 'B3', code: 'MDMV', name: 'TOYOTA AYGO A/C or similar', image: '/vehicles/saloon-manual/B3 TOYOTA AYGO.jpg', engineSize: '1000cc', doors: 5, seats: 4, transmission: 'Manual', bigLuggages: 0, smallLuggages: 2, hasAC: true, categoryId: saloonManualCategory.id },
      { group: 'C2', code: 'EDMV', name: 'TOYOTA YARIS A/C / OPEL CORSA A/C or similar', image: '/vehicles/saloon-manual/C2 TOYOTA YARIS.jpg', engineSize: '1200cc', doors: 5, seats: 5, transmission: 'Manual', bigLuggages: 1, smallLuggages: 2, hasAC: true, categoryId: saloonManualCategory.id },
      { group: 'C4', code: 'EDMD', name: 'RENAULT CLIO A/C or similar', image: '/vehicles/saloon-manual/C4 Renault Clio.png', engineSize: '1500cc', doors: 5, seats: 5, transmission: 'Manual', bigLuggages: 1, smallLuggages: 2, hasAC: true, categoryId: saloonManualCategory.id },
      { group: 'D1', code: 'CDMV', name: 'TOYOTA AURIS A/C / NISSAN NOTE A/C or similar', image: '/vehicles/saloon-manual/D1 TOYOTA AURIS.jpg', engineSize: '1400cc', doors: 5, seats: 5, transmission: 'Manual', bigLuggages: 2, smallLuggages: 1, hasAC: true, categoryId: saloonManualCategory.id },
      { group: 'D4', code: 'IDMV', name: 'OPEL ASTRA A/C / RENAULT MEGANE A/C or similar', image: '/vehicles/saloon-manual/vehicle-placeholder.jpg', engineSize: '1600cc', doors: 5, seats: 5, transmission: 'Manual', bigLuggages: 2, smallLuggages: 2, hasAC: true, categoryId: saloonManualCategory.id },
      
      // Saloon Automatic Transmission
      { group: 'A5', code: 'MBAV', name: 'HYUNDAI i10 A/C AUTO or similar', image: '/vehicles/saloon-automatic/A5 HYUNDAI i10.jpg', engineSize: '1000cc', doors: 3, seats: 4, transmission: 'Automatic', bigLuggages: 0, smallLuggages: 2, hasAC: true, categoryId: saloonAutoCategory.id },
      { group: 'B5', code: 'MDAV', name: 'TOYOTA AYGO A/C AUTO or similar', image: '/vehicles/saloon-automatic/B5 TOYOTA AYGO.jpeg', engineSize: '1000cc', doors: 5, seats: 4, transmission: 'Automatic', bigLuggages: 0, smallLuggages: 2, hasAC: true, categoryId: saloonAutoCategory.id },
      { group: 'C3', code: 'EDAV', name: 'TOYOTA YARIS A/C AUTO / OPEL CORSA A/C AUTO or similar', image: '/vehicles/saloon-automatic/C3 - TOYOTA YARIS.jpg', engineSize: '1400cc', doors: 5, seats: 5, transmission: 'Automatic', bigLuggages: 1, smallLuggages: 2, hasAC: true, categoryId: saloonAutoCategory.id },
      { group: 'D5', code: 'CDAV', name: 'NISSAN NOTE A/C AUTO or similar', image: '/vehicles/saloon-automatic/D5 -NISSAN-NOTE .png', engineSize: '1200cc', doors: 5, seats: 5, transmission: 'Automatic', bigLuggages: 2, smallLuggages: 1, hasAC: true, categoryId: saloonAutoCategory.id },
      { group: 'D6', code: 'IDAV', name: 'TOYOTA COROLLA A/C AUTO / OPEL ASTRA A/C AUTO or similar', image: '/vehicles/saloon-automatic/D6- Toyota Crolla.jpg', engineSize: '1600cc', doors: 5, seats: 5, transmission: 'Automatic', bigLuggages: 2, smallLuggages: 2, hasAC: true, categoryId: saloonAutoCategory.id },
      { group: 'D7', code: 'IDAD', name: 'VW GOLF A/C AUTO / FORD FOCUS A/C AUTO or similar', image: '/vehicles/saloon-automatic/D7 -VW Golf.jpg', engineSize: '1500cc', doors: 5, seats: 5, transmission: 'Automatic', bigLuggages: 2, smallLuggages: 2, hasAC: true, categoryId: saloonAutoCategory.id },
      { group: 'H2', code: 'SDAV', name: 'VW PASSAT A/C AUTO or similar', image: '/vehicles/saloon-automatic/H2 VW PASSAT.jpg', engineSize: '1400cc', doors: 4, seats: 5, transmission: 'Automatic', bigLuggages: 2, smallLuggages: 2, hasAC: true, categoryId: saloonAutoCategory.id },
      { group: 'H8', code: 'RDAV', name: 'BMW 3 SERIES A/C AUTO or similar', image: '/vehicles/saloon-automatic/vehicle-placeholder.jpg', engineSize: '2000cc', doors: 4, seats: 5, transmission: 'Automatic', bigLuggages: 2, smallLuggages: 2, hasAC: true, categoryId: saloonAutoCategory.id },
      { group: 'H6', code: 'PDAV', name: 'MERCEDES C180 A/C AUTO or similar', image: '/vehicles/saloon-automatic/H6 MERCEDES C180.jpg', engineSize: '1800cc', doors: 4, seats: 5, transmission: 'Automatic', bigLuggages: 2, smallLuggages: 2, hasAC: true, categoryId: saloonAutoCategory.id },
      { group: 'H7', code: 'LDAV', name: 'MERCEDES E200 A/C AUTO or similar', image: '/vehicles/saloon-automatic/H7 MERCEDES E200.jpg', engineSize: '2000cc', doors: 4, seats: 5, transmission: 'Automatic', bigLuggages: 2, smallLuggages: 2, hasAC: true, categoryId: saloonAutoCategory.id },
      
      // Cabrio / Open Top
      { group: 'T1', code: 'NXAV', name: 'TOYOTA AYGO CABRIO A/C AUTO or similar', image: '/vehicles/cabrio/T1 Toyota Aygo cabrio.jpg', engineSize: '1000cc', doors: 2, seats: 4, transmission: 'Automatic', bigLuggages: 1, smallLuggages: 1, hasAC: true, categoryId: cabrioCategory.id },
      { group: 'T6', code: 'JTAV', name: 'AUDI A3 CABRIO A/C AUTO or similar', image: '/vehicles/cabrio/T6 AUDI A3 Cabrio.jpg', engineSize: '1600cc', doors: 2, seats: 4, transmission: 'Automatic', bigLuggages: 1, smallLuggages: 1, hasAC: true, categoryId: cabrioCategory.id },
      { group: 'T8', code: 'PTAV', name: 'MERCEDES C CLASS CABRIO A/C AUTO or similar', image: '/vehicles/cabrio/T8 MERCEDES C CLASS CABRIO 2018.jpg', engineSize: '2000cc', doors: 2, seats: 4, transmission: 'Automatic', bigLuggages: 1, smallLuggages: 1, hasAC: true, categoryId: cabrioCategory.id },
      
      // People Carrier/Wheelchair Accessible Vehicles
      { group: 'V5', code: 'LVAR', name: 'TOYOTA VERSO A/C AUTO or similar', image: '/vehicles/people-carrier/V5 Toyota Verso.jpg', engineSize: '2000cc', doors: 5, seats: 7, transmission: 'Automatic', bigLuggages: 4, smallLuggages: 3, hasAC: true, categoryId: peopleCarrierCategory.id },
      { group: 'V7', code: 'FVMD', name: 'FORD TRANSIT TOURNEO A/C or similar', image: '/vehicles/people-carrier/V7 FORD TRANSIT TOURNEO.jpg', engineSize: '2200cc', doors: 5, seats: 9, transmission: 'Manual', bigLuggages: 6, smallLuggages: 3, hasAC: true, categoryId: peopleCarrierCategory.id },
      { group: 'V8', code: 'GVAD', name: 'TOYOTA PROACE A/C AUTO or similar', image: '/vehicles/people-carrier/V8 Toyota-Proace.jpg', engineSize: '2000cc', doors: 5, seats: 8, transmission: 'Automatic', bigLuggages: 4, smallLuggages: 3, hasAC: true, categoryId: peopleCarrierCategory.id },
      { group: 'V9', code: 'PVAD', name: 'MERCEDES VITO TOURER A/C AUTO or similar', image: '/vehicles/people-carrier/V9 Mercedes Vito Tourer.png', engineSize: '2200cc', doors: 5, seats: 9, transmission: 'Automatic', bigLuggages: 6, smallLuggages: 3, hasAC: true, categoryId: peopleCarrierCategory.id },
      { group: 'W3', code: 'UVAV', name: 'TOYOTA VOXY A/C AUTO or Similar 5 + 1 Wheelchair', image: '/vehicles/people-carrier/W3 Toyota Voxy.jpg', engineSize: '2000cc', doors: 5, seats: 6, transmission: 'Automatic', bigLuggages: 4, smallLuggages: 3, hasAC: true, categoryId: peopleCarrierCategory.id },
      { group: 'W4', code: 'OVAV', name: 'TOYOTA REGIUS ACE (HIACE) A/C AUTO or similar 6+1 Wheelchair', image: '/vehicles/people-carrier/vehicle-placeholder.jpg', engineSize: '2000cc', doors: 5, seats: 9, transmission: 'Automatic', bigLuggages: 6, smallLuggages: 3, hasAC: true, categoryId: peopleCarrierCategory.id },
      
      // SUV / 4WD
      { group: 'EW', code: 'IWMV', name: 'TOYOTA AURIS ESTATE A/C 2WD or similar', image: '/vehicles/suv-4wd/EW TOYOTA AURIS ESTATE.jpg', engineSize: '1400cc', doors: 5, seats: 5, transmission: 'Manual', bigLuggages: 4, smallLuggages: 1, hasAC: true, categoryId: suvCategory.id },
      { group: 'EC', code: 'CFAV', name: 'NISSAN JUKE A/C 2WD AUTO or similar', image: '/vehicles/suv-4wd/EC Nissan Juke .png', engineSize: '1600cc', doors: 5, seats: 5, transmission: 'Automatic', bigLuggages: 0, smallLuggages: 2, hasAC: true, categoryId: suvCategory.id },
      { group: 'EY', code: 'IWAV', name: 'KIA CEED ESTATE A/C 2WD AUTO or similar', image: '/vehicles/suv-4wd/EY KIA CEED ESTATE.jpg', engineSize: '1500cc', doors: 5, seats: 5, transmission: 'Automatic', bigLuggages: 4, smallLuggages: 2, hasAC: true, categoryId: suvCategory.id },
      { group: 'EH', code: 'CFAH', name: 'TOYOTA C-HR A/C 2WD AUTO or similar', image: '/vehicles/suv-4wd/EH Toyota CH-R.jpg', engineSize: '1800cc', doors: 5, seats: 5, transmission: 'Automatic', bigLuggages: 2, smallLuggages: 2, hasAC: true, categoryId: suvCategory.id },
      { group: 'E3', code: 'IFDV', name: 'SUBARU XV A/C 4WD AUTO or similar', image: '/vehicles/suv-4wd/E3 SUBARU XV.png', engineSize: '1600cc', doors: 5, seats: 5, transmission: 'Automatic', bigLuggages: 1, smallLuggages: 2, hasAC: true, categoryId: suvCategory.id },
      { group: 'EQ', code: 'FQND', name: 'TOYOTA HILUX D-CABIN A/C 4WD or similar', image: '/vehicles/suv-4wd/EQ TOYOTA HILUX DOUBLE CABIN.jpg', engineSize: '2500cc', doors: 4, seats: 5, transmission: 'Manual', bigLuggages: 12, smallLuggages: 10, hasAC: true, categoryId: suvCategory.id },
      { group: 'ER', code: 'RQBD', name: 'TOYOTA HILUX D-CABIN A/C 4WD AUTO or similar', image: '/vehicles/suv-4wd/ER Toyota Hilux Double cabin.jpg', engineSize: '2400cc', doors: 4, seats: 5, transmission: 'Automatic', bigLuggages: 12, smallLuggages: 10, hasAC: true, categoryId: suvCategory.id },
      { group: 'E5', code: 'SFDR', name: 'TOYOTA RAV4 A/C 4WD AUTO or similar', image: '/vehicles/suv-4wd/E5 TOYOTA RAV4.jpg', engineSize: '2000cc', doors: 5, seats: 5, transmission: 'Automatic', bigLuggages: 2, smallLuggages: 2, hasAC: true, categoryId: suvCategory.id },
      { group: 'G3', code: 'FFBR', name: 'NISSAN QASHQAI A/C 4WD AUTO or similar', image: '/vehicles/suv-4wd/G3 NISSAN QASHQAI.jpg', engineSize: '2000cc', doors: 5, seats: 7, transmission: 'Automatic', bigLuggages: 1, smallLuggages: 2, hasAC: true, categoryId: suvCategory.id },
      { group: 'G4', code: 'GFBD', name: 'MITSUBISHI OUTLANDER A/C 4WD AUTO or similar', image: '/vehicles/suv-4wd/G4 MITSUBISHI OUTLANDER.jpg', engineSize: '2200cc', doors: 5, seats: 7, transmission: 'Automatic', bigLuggages: 1, smallLuggages: 2, hasAC: true, categoryId: suvCategory.id },
      { group: 'G5', code: 'PFBD', name: 'HYUNDAI SANTA FE A/C AUTO 4WD or similar', image: '/vehicles/suv-4wd/G5 HYUNDAI SANTA FE.jpg', engineSize: '2200cc', doors: 5, seats: 7, transmission: 'Automatic', bigLuggages: 1, smallLuggages: 2, hasAC: true, categoryId: suvCategory.id },
      { group: 'G9', code: 'WFBD', name: 'AUDI Q7 A/C 4WD AUTO / TOYOTA LANDCRUISER A/C 4WD AUTO or similar', image: '/vehicles/suv-4wd/G9 Audi Q7.png', engineSize: '3000cc', doors: 5, seats: 7, transmission: 'Automatic', bigLuggages: 1, smallLuggages: 2, hasAC: true, categoryId: suvCategory.id }
    ];

    // Insert all vehicles
    for (const vehicle of vehicleData) {
      await tx.vehicle.create({ data: vehicle });
    }

    // Create Seasonal Pricing based on the provided table
    const pricingData = [
      // Saloon Manual Transmission
      { categoryId: saloonManualCategory.id, group: 'A3', price3to6Days: 47, price7to14Days: 36, price15PlusDays: 31 },
      { categoryId: saloonManualCategory.id, group: 'B3', price3to6Days: 52, price7to14Days: 40, price15PlusDays: 36 },
      { categoryId: saloonManualCategory.id, group: 'C2', price3to6Days: 57, price7to14Days: 45, price15PlusDays: 40 },
      { categoryId: saloonManualCategory.id, group: 'C4', price3to6Days: 61, price7to14Days: 49, price15PlusDays: 45 },
      { categoryId: saloonManualCategory.id, group: 'D1', price3to6Days: 61, price7to14Days: 49, price15PlusDays: 45 },
      { categoryId: saloonManualCategory.id, group: 'D4', price3to6Days: 66, price7to14Days: 54, price15PlusDays: 49 },

      // Saloon Automatic Transmission
      { categoryId: saloonAutoCategory.id, group: 'A5', price3to6Days: 57, price7to14Days: 45, price15PlusDays: 40 },
      { categoryId: saloonAutoCategory.id, group: 'B5', price3to6Days: 61, price7to14Days: 49, price15PlusDays: 45 },
      { categoryId: saloonAutoCategory.id, group: 'C3', price3to6Days: 66, price7to14Days: 54, price15PlusDays: 49 },
      { categoryId: saloonAutoCategory.id, group: 'D5', price3to6Days: 71, price7to14Days: 58, price15PlusDays: 54 },
      { categoryId: saloonAutoCategory.id, group: 'D6', price3to6Days: 76, price7to14Days: 63, price15PlusDays: 58 },
      { categoryId: saloonAutoCategory.id, group: 'D7', price3to6Days: 80, price7to14Days: 67, price15PlusDays: 63 },
      { categoryId: saloonAutoCategory.id, group: 'H2', price3to6Days: 114, price7to14Days: 94, price15PlusDays: 85 },
      { categoryId: saloonAutoCategory.id, group: 'H8', price3to6Days: 209, price7to14Days: 180, price15PlusDays: 166 },
      { categoryId: saloonAutoCategory.id, group: 'H6', price3to6Days: 285, price7to14Days: 247, price15PlusDays: 225 },

      // Cabrio / Open Top
      { categoryId: cabrioCategory.id, group: 'T1', price3to6Days: 76, price7to14Days: 63, price15PlusDays: 54 },
      { categoryId: cabrioCategory.id, group: 'T6', price3to6Days: 237, price7to14Days: 207, price15PlusDays: 189 },
      { categoryId: cabrioCategory.id, group: 'T8', price3to6Days: 361, price7to14Days: 315, price15PlusDays: 297 },

      // People Carrier/Wheelchair Accessible Vehicles
      { categoryId: peopleCarrierCategory.id, group: 'V5', price3to6Days: 100, price7to14Days: 90, price15PlusDays: 80 },
      { categoryId: peopleCarrierCategory.id, group: 'V7', price3to6Days: 200, price7to14Days: 180, price15PlusDays: 160 },
      { categoryId: peopleCarrierCategory.id, group: 'V8', price3to6Days: 250, price7to14Days: 230, price15PlusDays: 210 },
      { categoryId: peopleCarrierCategory.id, group: 'V9', price3to6Days: 350, price7to14Days: 320, price15PlusDays: 300 },
      { categoryId: peopleCarrierCategory.id, group: 'W3', price3to6Days: 170, price7to14Days: 140, price15PlusDays: 120 },
      { categoryId: peopleCarrierCategory.id, group: 'W4', price3to6Days: 170, price7to14Days: 140, price15PlusDays: 120 },

      // SUV / 4WD
      { categoryId: suvCategory.id, group: 'EW', price3to6Days: 76, price7to14Days: 63, price15PlusDays: 58 },
      { categoryId: suvCategory.id, group: 'EC', price3to6Days: 76, price7to14Days: 63, price15PlusDays: 58 },
      { categoryId: suvCategory.id, group: 'EY', price3to6Days: 95, price7to14Days: 81, price15PlusDays: 72 },
      { categoryId: suvCategory.id, group: 'EH', price3to6Days: 95, price7to14Days: 81, price15PlusDays: 72 },
      { categoryId: suvCategory.id, group: 'E3', price3to6Days: 114, price7to14Days: 94, price15PlusDays: 85 },
      { categoryId: suvCategory.id, group: 'EQ', price3to6Days: 123, price7to14Days: 103, price15PlusDays: 90 },
      { categoryId: suvCategory.id, group: 'ER', price3to6Days: 152, price7to14Days: 130, price15PlusDays: 112 },
      { categoryId: suvCategory.id, group: 'E5', price3to6Days: 123, price7to14Days: 103, price15PlusDays: 90 },
      { categoryId: suvCategory.id, group: 'G3', price3to6Days: 171, price7to14Days: 144, price15PlusDays: 130 },
      { categoryId: suvCategory.id, group: 'G4', price3to6Days: 237, price7to14Days: 207, price15PlusDays: 189 },
      { categoryId: suvCategory.id, group: 'G5', price3to6Days: 285, price7to14Days: 247, price15PlusDays: 225 },
      { categoryId: suvCategory.id, group: 'G9', price3to6Days: 475, price7to14Days: 405, price15PlusDays: 378 }
    ];

    // Insert seasonal pricing
    for (const pricing of pricingData) {
      await tx.seasonalPricing.create({
        data: {
          ...pricing,
          seasonId: season2025.id
        }
      });
    }

    // Create sample customers
    const customer1 = await tx.customer.create({ 
      data: { 
        firstName: 'John', 
        lastName: 'Doe', 
        email: 'john.doe@example.com', 
        phone: '+357 99123456' 
      } 
    });
    
    const customer2 = await tx.customer.create({ 
      data: { 
        firstName: 'Maria', 
        lastName: 'Petrou', 
        email: 'maria.petrou@example.com', 
        phone: '+357 99654321' 
      } 
    });

    // Create promotions
    const promotionsData = [
      {
        name: 'WEDDING ELENI AND MARTIN DISCOUNT QUOTE',
        code: 'elenimartin',
        discount: 10.00,
        startDate: new Date('2022-02-17'),
        endDate: new Date('2022-06-16'),
        visible: false,
        type: 'Wedding'
      },
      {
        name: 'CHRISTENING - MARINOS STASIS',
        code: 'PETSAS0907',
        discount: 15.00,
        startDate: new Date('2023-05-23'),
        endDate: new Date('2023-07-21'),
        visible: false,
        type: 'Christening'
      },
      {
        name: 'SUMMER23',
        code: 'SUMMER23',
        discount: 10.00,
        startDate: new Date('2023-06-07'),
        endDate: new Date('2023-07-31'),
        visible: true,
        type: 'Seasonal'
      },
      {
        name: 'OCEANMAN - OPEN WATER SWIMMING',
        code: 'OCEANMAN24',
        discount: 10.00,
        startDate: new Date('2024-12-01'),
        endDate: new Date('2025-12-31'),
        visible: true,
        type: 'Event'
      },
      {
        name: 'CIOF2024',
        code: 'CIOF2024',
        discount: 25.00,
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-22'),
        visible: false,
        type: 'Festival'
      },
      {
        name: 'YARA AND OMAR\'S WEDDING',
        code: 'YARAOMAR',
        discount: 10.00,
        startDate: new Date('2025-04-28'),
        endDate: new Date('2025-07-19'),
        visible: true,
        type: 'Wedding'
      },
      {
        name: 'WEDDING 2024 - THALIA\'S WEDDING',
        code: 'WEDDING24',
        discount: 15.00,
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-09-30'),
        visible: true,
        type: 'Wedding'
      },
      {
        name: 'FELLAS EVENT',
        code: 'FELLAS',
        discount: 10.00,
        startDate: new Date('2024-04-04'),
        endDate: new Date('2024-07-31'),
        visible: false,
        type: 'Event'
      },
      {
        name: 'SUMMER24',
        code: 'SUMMER24',
        discount: 10.00,
        startDate: new Date('2024-04-11'),
        endDate: new Date('2024-10-31'),
        visible: true,
        type: 'Seasonal'
      },
      {
        name: 'VIP24',
        code: 'VIP24',
        discount: 10.00,
        startDate: new Date('2024-06-13'),
        endDate: new Date('2024-09-30'),
        visible: true,
        type: 'VIP'
      },
      {
        name: 'APHRODITI\'S WEDDING',
        code: 'WEDDING25',
        discount: 15.00,
        startDate: new Date('2025-09-20'),
        endDate: new Date('2025-10-20'),
        visible: true,
        type: 'Wedding'
      },
      {
        name: 'ZOE & VARUN WEDDING',
        code: 'Z&V-W2025',
        discount: 15.00,
        startDate: new Date('2025-05-24'),
        endDate: new Date('2025-05-31'),
        visible: true,
        type: 'Wedding'
      }
    ];

    // Insert promotions
    for (const promotion of promotionsData) {
      await tx.promotion.create({ data: promotion });
    }

    console.log(`Created ${vehicleData.length} vehicles across 5 categories`);
    console.log(`Created ${pricingData.length} pricing entries for Summer Season 2025`);
    console.log(`Created ${promotionsData.length} promotions`);
    console.log('Sample customers and initial data created successfully');
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
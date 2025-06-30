import { PrismaClient } from '../app/generated/prisma';

const prisma = new PrismaClient();

async function seedPromotions() {
  console.log('Seeding promotions...');

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

  // Clear existing promotions
  await prisma.promotion.deleteMany();

  // Insert promotions
  for (const promotion of promotionsData) {
    await prisma.promotion.create({ data: promotion });
  }

  console.log(`Created ${promotionsData.length} promotions`);
}

export default seedPromotions;

if (require.main === module) {
  seedPromotions()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
} 
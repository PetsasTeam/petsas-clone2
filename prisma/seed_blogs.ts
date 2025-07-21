import { PrismaClient } from '../app/generated/prisma';

const prisma = new PrismaClient();

const blogPosts = [
  {
    title: 'Flexible Travel in Cyprus – Discover the Island on Your Own Terms',
    slug: 'flexible-travel-cyprus',
    summary: '2025 is all about flexible travel. No fixed itineraries, no rushing around – just the freedom to explore at your own pace. And in Cyprus, there’s no better way to do that than by renting a car with Petsas Car Rental.',
    content: `2025 is all about flexible travel. No fixed itineraries, no rushing around – just the freedom to explore at your own pace. And in Cyprus, there’s no better way to do that than by renting a car with Petsas Car Rental.\n\n(Full article content goes here. Please update with the full text if available.)`,
    imageUrl: '/content/blog_1751065702615.jpg',
    category: 'RENTAL TIPS',
    tags: ['flexible travel', 'cyprus', 'car rental', 'tips'],
    published: true,
    createdAt: new Date('2025-05-14'),
    updatedAt: new Date('2025-05-14'),
  },
  {
    title: 'Explore the Wonders of Cyprus – Top Attractions & Experiences with Petsas Car Rental',
    slug: 'explore-wonders-cyprus',
    summary: 'With a Petsas rental car at your disposal, you can dive into the heart of Cyprus, exploring its natural beauty, ancient history, and mouth-watering cuisine.',
    content: `With a Petsas rental car at your disposal, you can dive into the heart of Cyprus, exploring its natural beauty, ancient history, and mouth-watering cuisine.\n\n(Full article content goes here. Please update with the full text if available.)`,
    imageUrl: '/content/blog_1751123672920.png',
    category: 'RENTAL TIPS',
    tags: ['attractions', 'experiences', 'cyprus', 'car rental'],
    published: true,
    createdAt: new Date('2025-04-07'),
    updatedAt: new Date('2025-04-07'),
  },
  {
    title: 'Embark on the Ultimate Cyprus Journey with Petsas Car Rental',
    slug: 'ultimate-cyprus-journey',
    summary: 'If you are planning a trip to Cyprus, you\'re in for something special – and there’s no better way to explore the island than with a rental car from Petsas.',
    content: `If you are planning a trip to Cyprus, you\'re in for something special – and there’s no better way to explore the island than with a rental car from Petsas.\n\n(Full article content goes here. Please update with the full text if available.)`,
    imageUrl: '/content/blog_1751123892127.jpg',
    category: 'RENTAL TIPS',
    tags: ['journey', 'cyprus', 'car rental', 'travel'],
    published: true,
    createdAt: new Date('2025-03-29'),
    updatedAt: new Date('2025-03-29'),
  },
  {
    title: 'Petsas: Your Trusted Partner for Car Leasing in Cyprus',
    slug: 'trusted-partner-car-leasing-cyprus',
    summary: 'Petsas Car Leasing offers flexible car leasing options for both business and personal needs in Cyprus. We provide high-quality, tailored solutions to meet your requirements.',
    content: `Petsas Car Leasing offers flexible car leasing options for both business and personal needs in Cyprus. We provide high-quality, tailored solutions to meet your requirements.\n\n(Full article content goes here. Please update with the full text if available.)`,
    imageUrl: '/content/blog_1751123941592.png',
    category: 'ANNOUNCEMENTS',
    tags: ['leasing', 'cyprus', 'business', 'personal'],
    published: true,
    createdAt: new Date('2024-08-19'),
    updatedAt: new Date('2024-08-19'),
  },
  {
    title: 'Convenient Car Rentals at Larnaca and Paphos Airports with Petsas',
    slug: 'convenient-car-rentals-larnaca-paphos',
    summary: 'Petsas Car Rentals is your trusted choice for car rentals at both Larnaca International Airport and Paphos International Airport. With over 60 years of experience as a family-run business, we offer a wide range of vehicles and personalised service that stand out from international chains.',
    content: `Petsas Car Rentals is your trusted choice for car rentals at both Larnaca International Airport and Paphos International Airport. With over 60 years of experience as a family-run business, we offer a wide range of vehicles and personalised service that stand out from international chains.\n\n(Full article content goes here. Please update with the full text if available.)`,
    imageUrl: '/content/blog_1751123974322.png',
    category: 'ANNOUNCEMENTS',
    tags: ['car rental', 'larnaca', 'paphos', 'airport'],
    published: true,
    createdAt: new Date('2024-08-18'),
    updatedAt: new Date('2024-08-18'),
  },
  {
    title: 'Discover Cyprus with Petsas: Your Trusted Car Rental Service',
    slug: 'discover-cyprus-petsas',
    summary: 'At Andreas Petsas and Sons Public Ltd, we excel in providing top-quality car rentals in Cyprus. With locations in Nicosia, Limassol, Paphos, Ayia Napa and offices at Larnaca and Paphos International Airports, we ensure easy access and 24/7 service.',
    content: `At Andreas Petsas and Sons Public Ltd, we excel in providing top-quality car rentals in Cyprus. With locations in Nicosia, Limassol, Paphos, Ayia Napa and offices at Larnaca and Paphos International Airports, we ensure easy access and 24/7 service.\n\n(Full article content goes here. Please update with the full text if available.)`,
    imageUrl: '/content/blog_1751125926493.webp',
    category: 'ANNOUNCEMENTS',
    tags: ['car rental', 'cyprus', 'service', 'locations'],
    published: true,
    createdAt: new Date('2024-07-20'),
    updatedAt: new Date('2024-07-20'),
  },
  {
    title: 'Drive in Style with Petsas Rent a Car!',
    slug: 'drive-in-style-petsas',
    summary: 'Introducing our premium range of luxurious vehicles, perfect for making your journey in Cyprus unforgettable. Whether you\'re here for business or leisure, Petsas Rent a Car offers top-notch vehicles to match your style and comfort needs.',
    content: `Introducing our premium range of luxurious vehicles, perfect for making your journey in Cyprus unforgettable. Whether you\'re here for business or leisure, Petsas Rent a Car offers top-notch vehicles to match your style and comfort needs.\n\n(Full article content goes here. Please update with the full text if available.)`,
    imageUrl: '/content/blog_1751126320326.png',
    category: 'ANNOUNCEMENTS',
    tags: ['luxury', 'vehicles', 'style', 'cyprus'],
    published: true,
    createdAt: new Date('2024-07-19'),
    updatedAt: new Date('2024-07-19'),
  },
];

async function main() {
  for (const post of blogPosts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: post,
      create: post,
    });
    console.log(`Seeded: ${post.title}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
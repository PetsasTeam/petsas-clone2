# Petsas Car Rental Clone

A modern car rental website built with Next.js, featuring a comprehensive admin system for managing vehicles, bookings, and categories.

## Features

### Frontend (Customer-Facing)
- Multi-language support (English/Russian)
- Vehicle guide with filtering and search
- Booking system with location and date selection
- Responsive design for all devices

### Admin System
- **Vehicle Categories Management**: 
  - ✅ **General Tab**: Edit category name, display order, and visibility
  - ✅ **Groups Tab**: Manage individual vehicles within categories
  - ✅ **Visibility Control**: Hide/show categories on public website
  - ✅ **Display Order**: Control the order categories appear to customers
- **Vehicle Management**: Individual vehicle CRUD operations
- **Booking Management**: Track reservations and payments
- **Customer Management**: Customer database and profiles

## Recent Updates

### General Tab Functionality (Vehicle Categories)
The General tab in vehicle category editing is now fully functional:

1. **Category Name**: Change how the category appears to customers
2. **Display Order**: Control the order categories appear on the website (lower numbers = higher priority)
3. **Visibility**: Toggle whether the category appears on the public website
4. **Auto-Save**: Changes are saved to database and immediately reflected on the frontend

### Frontend Integration
- Vehicle guide page now respects category visibility settings
- Categories are ordered by displayOrder field
- Only visible vehicles from visible categories are shown to customers
- Admin changes are immediately reflected on the public website

## Technical Implementation

### Database Schema
- `VehicleCategory.visible`: Boolean flag for category visibility
- `VehicleCategory.displayOrder`: Integer for sorting categories
- `Vehicle.visible`: Boolean flag for individual vehicle visibility

### Admin Actions
- `updateCategory()`: Server action for saving category changes
- Real-time updates with Next.js revalidation
- Form validation and error handling

## Getting Started

First, run the development server:

```bash
npm install
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Admin System Navigation

1. **Dashboard**: Overview statistics and recent activity
2. **System Setup**: 
   - Vehicle Categories (with functional General tab)
   - Rental Options
   - Locations
   - Pricing
3. **Vehicle Management**: Individual vehicle operations
4. **Booking Management**: Reservation tracking
5. **Customer Management**: Customer database

import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { vehicleId } = await request.json();

    if (!vehicleId) {
      return NextResponse.json(
        { error: 'Missing vehicle ID' },
        { status: 400 }
      );
    }

    // Get vehicle details
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: { category: true }
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    // Delete the current image file if it exists and is not a placeholder
    if (vehicle.image && !vehicle.image.includes('placeholder')) {
      try {
        const imagePath = join(process.cwd(), 'public', vehicle.image);
        await unlink(imagePath);
      } catch (error) {
        console.warn('Could not delete image file:', error);
        // Continue even if file deletion fails
      }
    }

    // Determine placeholder image based on category
    let placeholderPath = '';
    const categoryName = vehicle.category.name.toLowerCase();
    
    if (categoryName.includes('saloon manual')) {
      placeholderPath = '/vehicles/saloon-manual/vehicle-placeholder.jpg';
    } else if (categoryName.includes('saloon automatic')) {
      placeholderPath = '/vehicles/saloon-automatic/vehicle-placeholder.jpg';
    } else if (categoryName.includes('cabrio')) {
      placeholderPath = '/vehicles/cabrio/vehicle-placeholder.jpg';
    } else if (categoryName.includes('people carrier')) {
      placeholderPath = '/vehicles/people-carrier/vehicle-placeholder.jpg';
    } else if (categoryName.includes('suv') || categoryName.includes('4wd')) {
      placeholderPath = '/vehicles/suv-4wd/vehicle-placeholder.jpg';
    } else {
      placeholderPath = '/vehicles/vehicle-placeholder.jpg';
    }

    // Update the vehicle record to use placeholder
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { image: placeholderPath }
    });

    return NextResponse.json({
      success: true,
      imagePath: placeholderPath,
      message: 'Image removed successfully'
    });

  } catch (error) {
    console.error('Remove error:', error);
    return NextResponse.json(
      { error: 'Failed to remove image' },
      { status: 500 }
    );
  }
} 
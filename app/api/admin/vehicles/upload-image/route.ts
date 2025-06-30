import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const vehicleId = formData.get('vehicleId') as string;

    if (!file || !vehicleId) {
      return NextResponse.json(
        { error: 'Missing file or vehicle ID' },
        { status: 400 }
      );
    }

    // Get vehicle details to determine category folder
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

    // Determine the category folder based on vehicle category
    let categoryFolder = '';
    const categoryName = vehicle.category.name.toLowerCase();
    
    if (categoryName.includes('saloon manual')) {
      categoryFolder = 'saloon-manual';
    } else if (categoryName.includes('saloon automatic')) {
      categoryFolder = 'saloon-automatic';
    } else if (categoryName.includes('cabrio')) {
      categoryFolder = 'cabrio';
    } else if (categoryName.includes('people carrier')) {
      categoryFolder = 'people-carrier';
    } else if (categoryName.includes('suv') || categoryName.includes('4wd')) {
      categoryFolder = 'suv-4wd';
    } else {
      categoryFolder = 'other';
    }

    // Create filename: Group + Vehicle Name + timestamp
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${vehicle.group}_${vehicle.name.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.${fileExtension}`;
    
    // Create the directory path
    const uploadDir = join(process.cwd(), 'public', 'vehicles', categoryFolder);
    
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, which is fine
    }

    // Write the file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = join(uploadDir, fileName);
    
    await writeFile(filePath, buffer);

    // Update the vehicle record in the database
    const imagePath = `/vehicles/${categoryFolder}/${fileName}`;
    
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { image: imagePath }
    });

    return NextResponse.json({
      success: true,
      imagePath: imagePath,
      message: 'Image uploaded successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
} 
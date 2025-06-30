import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const rentalOptionId = formData.get('rentalOptionId') as string;

    if (!file || !rentalOptionId) {
      return NextResponse.json(
        { error: 'Missing file or rental option ID' },
        { status: 400 }
      );
    }

    // Get rental option details
    const rentalOption = await prisma.rentalOption.findUnique({
      where: { id: rentalOptionId }
    });

    if (!rentalOption) {
      return NextResponse.json(
        { error: 'Rental option not found' },
        { status: 404 }
      );
    }

    // Create filename: Code + timestamp + extension
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${rentalOption.code.toLowerCase()}_${timestamp}.${fileExtension}`;
    
    // Create the directory path for rental option images
    const uploadDir = join(process.cwd(), 'public', 'rental-options');
    
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

    // Update the rental option record in the database
    const imagePath = `/rental-options/${fileName}`;
    
    await prisma.rentalOption.update({
      where: { id: rentalOptionId },
      data: { photo: imagePath }
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
 
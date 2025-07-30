import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { z } from 'zod';

// Validation schema
const FindCustomerSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedFields = FindCustomerSchema.safeParse(body);
    
    if (!validatedFields.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid email address',
          errors: validatedFields.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { email } = validatedFields.data;

    // Find customer by email
    const customer = await prisma.customer.findUnique({
      where: { email },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        dateOfBirth: true,
        address: true,
        verified: true,
        createdAt: true,
        // Exclude password from response
      },
    });

    if (!customer) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Customer not found' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Customer found successfully',
      customer,
    });

  } catch (error) {
    console.error('Find customer error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
} 
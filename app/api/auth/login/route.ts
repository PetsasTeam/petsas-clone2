import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Validation schema
const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedFields = LoginSchema.safeParse(body);
    
    if (!validatedFields.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed',
          errors: validatedFields.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { email, password } = validatedFields.data;

    // Find user by email
    const customer = await prisma.customer.findUnique({
      where: { email },
    });

    if (!customer) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid email or password' 
        },
        { status: 401 }
      );
    }

    // Check if password exists (for users created before password field)
    if (!customer.password) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'This account does not have a password yet. You can set a password to upgrade your guest account to a full account.',
          type: 'NO_PASSWORD',
          customer: {
            email: customer.email,
            firstName: customer.firstName,
            lastName: customer.lastName,
            hasPassword: false
          }
        },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, customer.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid email or password' 
        },
        { status: 401 }
      );
    }

    // Remove password from response
    const { password: _, ...customerWithoutPassword } = customer;

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      customer: customerWithoutPassword,
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
} 
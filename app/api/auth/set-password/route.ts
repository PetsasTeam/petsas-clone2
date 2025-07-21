import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../generated/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { sendMail } from '../../../../lib/mail';

const prisma = new PrismaClient();

// Validation schema
const SetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Set password request for email:', body.email);
    
    // Validate input
    const validatedFields = SetPasswordSchema.safeParse(body);
    
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

    // Find customer by email
    const customer = await prisma.customer.findUnique({
      where: { email },
    });

    if (!customer) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'No account found with this email address' 
        },
        { status: 404 }
      );
    }

    // Check if customer already has a password
    if (customer.password) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'This account already has a password. Please use the login page or reset your password if you forgot it.' 
        },
        { status: 409 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update customer with password
    const updatedCustomer = await prisma.customer.update({
      where: { id: customer.id },
      data: {
        password: hashedPassword,
        verified: true, // Mark as verified since they're upgrading
      },
    });

    // Send account upgrade confirmation email
    try {
      const upgradeEmailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Set Successfully - Petsas Car Rentals</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4CAF50, #45a049); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🚗 PETSAS</div>
            <h1>Password Set Successfully!</h1>
          </div>
          <div class="content">
            <div class="success">
              <h3>🔐 Your Account Now Has a Password</h3>
              <p>You can now login securely to access all premium features.</p>
            </div>
            
            <h2>Hello ${customer.firstName} ${customer.lastName}!</h2>
            <p>Great news! You have successfully set a password for your Petsas Car Rentals account. Your guest account has been upgraded to a full account with enhanced features.</p>
            
            <h3>What You Can Do Now:</h3>
            <ul>
              <li><strong>Secure Login:</strong> Access your account anytime with your email and password</li>
              <li><strong>View Booking History:</strong> See all your past and upcoming reservations</li>
              <li><strong>Faster Checkout:</strong> Your details are saved for quicker future bookings</li>
              <li><strong>Exclusive Member Offers:</strong> Receive special discounts and promotions</li>
              <li><strong>Priority Customer Support:</strong> Enhanced service for account holders</li>
              <li><strong>Manage Profile:</strong> Update your information anytime</li>
            </ul>

            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/en/login" class="button">Login to Your Account</a>
            </div>

            <h3>Account Security Tips:</h3>
            <ul>
              <li>Keep your password secure and don't share it with anyone</li>
              <li>Use a strong, unique password for your account</li>
              <li>Log out when using shared computers</li>
              <li>Contact us immediately if you notice any suspicious activity</li>
            </ul>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Petsas Car Rentals. All rights reserved.</p>
            <p>Professional car rental services across Cyprus for over 60 years.</p>
          </div>
        </body>
        </html>
      `;

      const upgradeEmailText = `
        Password Set Successfully - Petsas Car Rentals

        Hello ${customer.firstName} ${customer.lastName}!

        Great news! You have successfully set a password for your Petsas Car Rentals account.

        What You Can Do Now:
        - Secure Login: Access your account anytime with your email and password
        - View Booking History: See all your past and upcoming reservations
        - Faster Checkout: Your details are saved for quicker future bookings
        - Exclusive Member Offers: Receive special discounts and promotions
        - Priority Customer Support: Enhanced service for account holders
        - Manage Profile: Update your information anytime

        Login to your account: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/en/login

        Account Security Tips:
        - Keep your password secure and don't share it with anyone
        - Use a strong, unique password for your account
        - Log out when using shared computers
        - Contact us immediately if you notice any suspicious activity

        © ${new Date().getFullYear()} Petsas Car Rentals. All rights reserved.
      `;

      await sendMail({
        to: email,
        subject: `Password Set Successfully - Petsas Car Rentals`,
        text: upgradeEmailText,
        html: upgradeEmailHtml,
      });

      console.log(`Password set confirmation email sent to ${email}`);
    } catch (emailError) {
      console.error('Failed to send password set confirmation email:', emailError);
    }

    // Remove password from response
    const { password: _, ...customerWithoutPassword } = updatedCustomer;

    return NextResponse.json({
      success: true,
      message: 'Password set successfully! Your account has been upgraded. You can now login with your email and password.',
      customer: customerWithoutPassword,
    });

  } catch (error) {
    console.error('Set password error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
} 
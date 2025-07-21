import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../generated/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { sendMail } from '../../../../lib/mail';

const prisma = new PrismaClient();

// Validation schema
const RegisterSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  password: z.string().optional(), // Allow empty password for guest customers
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
}).refine((data) => {
  // If password is provided, it must be at least 6 characters
  if (data.password && data.password.length > 0) {
    return data.password.length >= 6;
  }
  return true;
}, {
  message: 'Password must be at least 6 characters',
  path: ['password'],
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedFields = RegisterSchema.safeParse(body);
    
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

    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      dateOfBirth,
      address,
    } = validatedFields.data;

    // Check if user already exists
    const existingUser = await prisma.customer.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Detect data conflicts between new data and existing customer
      const conflicts = [];
      
      if (existingUser.firstName.toLowerCase() !== firstName.toLowerCase()) {
        conflicts.push({
          field: 'firstName',
          existing: existingUser.firstName,
          new: firstName
        });
      }
      
      if (existingUser.lastName.toLowerCase() !== lastName.toLowerCase()) {
        conflicts.push({
          field: 'lastName', 
          existing: existingUser.lastName,
          new: lastName
        });
      }
      
      if (existingUser.phone !== phone) {
        conflicts.push({
          field: 'phone',
          existing: existingUser.phone,
          new: phone
        });
      }
      
      // Check date of birth if provided
      if (dateOfBirth && existingUser.dateOfBirth) {
        const existingDate = existingUser.dateOfBirth.toISOString().split('T')[0];
        const newDate = new Date(dateOfBirth).toISOString().split('T')[0];
        if (existingDate !== newDate) {
          conflicts.push({
            field: 'dateOfBirth',
            existing: existingDate,
            new: newDate
          });
        }
      }

      if (conflicts.length > 0) {
        // Data conflicts detected - return detailed information
        return NextResponse.json(
          { 
            success: false, 
            message: 'Email already exists with different information',
            type: 'DATA_CONFLICT',
            conflicts,
            existingCustomer: {
              id: existingUser.id,
              firstName: existingUser.firstName,
              lastName: existingUser.lastName,
              phone: existingUser.phone,
              email: existingUser.email,
              hasPassword: !!existingUser.password
            }
          },
          { status: 409 }
        );
      } else {
        // Same data - check if this is a guest wanting to create an account
        if (!existingUser.password && password && password.length > 0) {
          // Guest customer wants to upgrade to full account
          console.log('Converting guest customer to full account');
          
          const hashedPassword = await bcrypt.hash(password, 12);
          
          // Update existing customer with password
          const updatedCustomer = await prisma.customer.update({
            where: { id: existingUser.id },
            data: {
              password: hashedPassword,
              verified: true, // Mark as verified since they're creating an account
            },
          });

          // Send account upgrade email
          try {
            const upgradeEmailHtml = `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Account Upgraded - Petsas Car Rentals</title>
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
                  <h1>Account Upgraded Successfully!</h1>
                </div>
                <div class="content">
                  <div class="success">
                    <h3>✅ Your Guest Account Has Been Upgraded</h3>
                    <p>You can now login with your email and password to access additional features.</p>
                  </div>
                  
                  <h2>Hello ${firstName} ${lastName}!</h2>
                  <p>Great news! Your guest account has been successfully upgraded to a full Petsas Car Rentals account. You now have access to all premium features.</p>
                  
                  <h3>What's New:</h3>
                  <ul>
                    <li><strong>Secure Login:</strong> Access your account anytime with email and password</li>
                    <li><strong>Booking History:</strong> View all your past and upcoming reservations</li>
                    <li><strong>Faster Checkout:</strong> Your details are saved for quicker bookings</li>
                    <li><strong>Exclusive Offers:</strong> Receive special discounts and promotions</li>
                    <li><strong>Priority Support:</strong> Enhanced customer service for account holders</li>
                  </ul>

                  <div style="text-align: center;">
                    <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/en/login" class="button">Login to Your Account</a>
                  </div>

                  <h3>Your Account Details:</h3>
                  <ul>
                    <li><strong>Email:</strong> ${email}</li>
                    <li><strong>Name:</strong> ${firstName} ${lastName}</li>
                    <li><strong>Phone:</strong> ${phone}</li>
                    <li><strong>Account Type:</strong> Full Account (upgraded from Guest)</li>
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
              Account Upgraded Successfully - Petsas Car Rentals

              Hello ${firstName} ${lastName}!

              Great news! Your guest account has been successfully upgraded to a full Petsas Car Rentals account.

              What's New:
              - Secure Login: Access your account anytime with email and password
              - Booking History: View all your past and upcoming reservations
              - Faster Checkout: Your details are saved for quicker bookings
              - Exclusive Offers: Receive special discounts and promotions
              - Priority Support: Enhanced customer service for account holders

              Your Account Details:
              - Email: ${email}
              - Name: ${firstName} ${lastName}
              - Phone: ${phone}
              - Account Type: Full Account (upgraded from Guest)

              Login to your account: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/en/login

              © ${new Date().getFullYear()} Petsas Car Rentals. All rights reserved.
            `;

            await sendMail({
              to: email,
              subject: `Account Upgraded Successfully - Petsas Car Rentals`,
              text: upgradeEmailText,
              html: upgradeEmailHtml,
            });

            console.log(`Account upgrade email sent successfully to ${email}`);
          } catch (emailError) {
            console.error('Failed to send account upgrade email:', emailError);
          }

          // Remove password from response
          const { password: _, ...customerWithoutPassword } = updatedCustomer;

          return NextResponse.json({
            success: true,
            message: 'Guest account upgraded successfully! You can now login with your password.',
            customer: customerWithoutPassword,
            type: 'ACCOUNT_UPGRADED'
          });
        } else {
          // Same data - just return existing customer
          return NextResponse.json(
            { 
              success: false, 
              message: 'Customer already exists with same information',
              type: 'EXACT_MATCH',
              existingCustomer: {
                id: existingUser.id,
                firstName: existingUser.firstName,
                lastName: existingUser.lastName,
                phone: existingUser.phone,
                email: existingUser.email,
                hasPassword: !!existingUser.password
              }
            },
            { status: 409 }
          );
        }
      }
    }

    // Hash password only if provided (for account creation)
    const hashedPassword = password && password.length > 0 ? await bcrypt.hash(password, 12) : null;

    // Create new customer
    const customer = await prisma.customer.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        address,
        verified: false, // Email verification can be added later
      },
    });

    // Send welcome email
    try {
      const welcomeEmailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Petsas Car Rentals</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4CAF50, #45a049); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🚗 PETSAS</div>
            <h1>Welcome to Petsas Car Rentals!</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName} ${lastName}!</h2>
            <p>Thank you for registering with Petsas Car Rentals. Your account has been successfully created and you can now start booking vehicles for your travel needs in Cyprus.</p>
            
            <h3>Your Account Details:</h3>
            <ul>
              <li><strong>Name:</strong> ${firstName} ${lastName}</li>
              <li><strong>Email:</strong> ${email}</li>
              <li><strong>Phone:</strong> ${phone}</li>
              ${address ? `<li><strong>Address:</strong> ${address}</li>` : ''}
            </ul>

            <h3>What's Next?</h3>
            <p>You can now:</p>
            <ul>
              <li>Browse our extensive fleet of vehicles</li>
              <li>Make reservations online with special discounts</li>
              <li>Access your booking history and manage reservations</li>
              <li>Enjoy our premium customer service</li>
            </ul>

            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/en/login" class="button">Login to Your Account</a>
            </div>

            <h3>Need Help?</h3>
            <p>If you have any questions or need assistance, our customer support team is here to help:</p>
            <ul>
              <li>📧 Email: support@petsas.com.cy</li>
              <li>📞 Phone: +357 22 456 450</li>
              <li>🌐 Website: www.petsas.com.cy</li>
            </ul>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Petsas Car Rentals. All rights reserved.</p>
            <p>Professional car rental services across Cyprus for over 60 years.</p>
          </div>
        </body>
        </html>
      `;

      const welcomeEmailText = `
        Welcome to Petsas Car Rentals!

        Hello ${firstName} ${lastName}!

        Thank you for registering with Petsas Car Rentals. Your account has been successfully created and you can now start booking vehicles for your travel needs in Cyprus.

        Your Account Details:
        - Name: ${firstName} ${lastName}
        - Email: ${email}
        - Phone: ${phone}
        ${address ? `- Address: ${address}` : ''}

        What's Next?
        You can now:
        - Browse our extensive fleet of vehicles
        - Make reservations online with special discounts
        - Access your booking history and manage reservations
        - Enjoy our premium customer service

        Login to your account: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/en/login

        Need Help?
        If you have any questions or need assistance, our customer support team is here to help:
        - Email: support@petsas.com.cy
        - Phone: +357 22 456 450
        - Website: www.petsas.com.cy

        © ${new Date().getFullYear()} Petsas Car Rentals. All rights reserved.
        Professional car rental services across Cyprus for over 60 years.
      `;

      await sendMail({
        to: email,
        subject: `Welcome to Petsas Car Rentals, ${firstName}!`,
        text: welcomeEmailText,
        html: welcomeEmailHtml,
      });

      console.log(`Welcome email sent successfully to ${email}`);
    } catch (emailError) {
      // Log the error but don't fail the registration
      console.error('Failed to send welcome email:', emailError);
    }

    // Remove password from response
    const { password: _, ...customerWithoutPassword } = customer;

    return NextResponse.json({
      success: true,
      message: 'Registration successful! A welcome email has been sent to your email address.',
      customer: customerWithoutPassword,
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
} 
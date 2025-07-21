# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Database Commands
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:reset` - Reset database and run migrations
- `npm run db:seed` - Seed database with initial data

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS with glassmorphism effects
- **Internationalization**: next-intl (English/Russian)
- **Authentication**: Custom implementation with bcrypt
- **Payment**: JCC Payment Gateway integration

### Project Structure
```
app/
├── [locale]/                 # Internationalized routes (en/ru)
│   ├── page.tsx             # Homepage
│   ├── search/              # Vehicle search/booking
│   ├── blog/                # Blog system
│   ├── dashboard/           # Customer dashboard
│   ├── payment/             # Payment success/failure pages
│   └── auth pages/          # Login, register, etc.
├── admin/                   # Admin dashboard
│   ├── layout.tsx           # Admin layout with sidebar
│   ├── setup/               # System configuration
│   ├── vehicles/            # Vehicle management
│   ├── bookings/            # Booking management
│   └── customers/           # Customer management
├── api/                     # API routes
│   ├── admin/               # Admin API endpoints
│   ├── auth/                # Authentication endpoints
│   ├── bookings/            # Booking management
│   └── payment/             # JCC payment integration
└── components/              # Reusable components
    ├── admin/               # Admin-specific components
    ├── home/                # Homepage components
    └── layout/              # Layout components
```

### Database Schema
Key entities:
- **VehicleCategory**: Vehicle types with display order and visibility
- **Vehicle**: Individual vehicles with specifications
- **Booking**: Customer reservations with payment status
- **Customer**: Customer accounts with authentication
- **Location**: Pickup/dropoff locations
- **RentalOption**: Additional rental options (GPS, insurance, etc.)
- **Post**: Blog posts with multilingual support
- **SiteContent**: Dynamic content management
- **SeasonalPricing**: Seasonal pricing tiers

### Internationalization
- Uses next-intl for i18n
- Supports English (`en`) and Russian (`ru`)
- Locale messages in `locales/[locale]/common.json`
- Pathnames configured in `i18n.ts`
- Admin interface is English-only

### Admin System
- Comprehensive dashboard at `/admin`
- Server actions pattern for form handling (files ending in `actions.ts`)
- Real-time updates with Next.js revalidation
- Modular setup: categories, vehicles, bookings, customers, content
- Role-based access (admin-only areas)

### Payment Integration
- JCC Payment Gateway integration
- Test/production mode switching
- Apple Pay & Google Pay support
- Payment verification and status tracking
- Complete booking lifecycle management

## Key Conventions

### File Organization
- Server actions in `actions.ts` files
- Client components with `Client.tsx` suffix
- API routes follow REST conventions
- Database queries use Prisma client from `lib/prisma.ts`

### Database
- Prisma client generated to `app/generated/prisma`
- Use `prisma` export from `lib/prisma.ts`
- Database URL configured via `DATABASE_URL` environment variable

### Styling
- Tailwind CSS with custom configuration
- Glassmorphism effects controlled by `glassmorphismEnabled` setting
- Responsive design with mobile-first approach
- Custom components in `components/` directory

### State Management
- React state for client-side interactions
- Server actions for form submissions
- No external state management library

## Environment Variables

### Required for Development
```bash
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### JCC Payment Integration
```bash
JCC_TEST_LOGIN="your_test_login"
JCC_TEST_PASSWORD="your_test_password"
JCC_TEST_MODE="true"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### Production
```bash
JCC_TEST_MODE="false"
JCC_PROD_LOGIN="your_production_login"
JCC_PROD_PASSWORD="your_production_password"
NEXT_PUBLIC_BASE_URL="https://yourdomain.com"
```

## Testing

### JCC Payment Testing
- Use test card: `4111 1111 1111 1111`
- Test environment automatically enabled with `JCC_TEST_MODE="true"`
- Test complete booking flow via `/search`

### Database Testing
- Use `npm run prisma:reset` to reset test data
- Seed files in `prisma/` directory
- Clean seed available via `prisma/seed_clean.ts`

## Important Notes

### Security
- Admin routes require authentication
- Payment processing is PCI DSS compliant via JCC
- Database credentials never exposed to client
- Server actions handle sensitive operations

### Performance
- Image optimization for vehicle photos
- Lazy loading for admin tables
- Efficient database queries with Prisma
- Static generation where possible

### Content Management
- Dynamic content via `SiteContent` model
- Blog system with multilingual support
- Image upload handling for various entities
- Rich text editing with React Quill

## Documentation References
- JCC Payment Integration: `docs/jcc_payment_integration.md`
- JCC Quick Start: `docs/jcc_quick_start.md`
- Database migrations: `prisma/migrations/`

## Conversation Summary

### Initial User Query - Guest Checkout Data Conflicts
User asked about handling scenarios where someone who previously guest-checked out enters the same email address but with different personal information (name, surname, DOB). The assistant analyzed the current system behavior and found it would use old customer data instead of new data entered, causing confusion.

### Solution 1 - Data Conflict Detection System
The assistant implemented a comprehensive 3-tier approach:
- **Backend**: Modified `app/api/auth/register/route.ts` to detect conflicts between new and existing customer data (firstName, lastName, phone, dateOfBirth)
- **API**: Created `app/api/auth/update-customer/route.ts` endpoint for updating existing customer information
- **Frontend**: Added conflict resolution modal in `ReviewAndPayClient.tsx` showing side-by-side data comparison with three options: "This is me - update my information", "Login to verify identity", or "Use different email"
- **Security**: Follows GDPR compliance and prevents unauthorized access to existing accounts

### User Query - Guest-to-Account Conversion
User asked about handling guests who want to create password-protected accounts later. The assistant implemented:
- **Register API Enhancement**: Logic to upgrade guest accounts (password: null) to full accounts when same data + password provided
- **New Endpoint**: `app/api/auth/set-password/route.ts` for existing guests to add passwords
- **Login API Update**: Better messaging for guests without passwords
- **Email Templates**: Account upgrade confirmation emails with company branding

### User Query - Payment Logging per JCC Guidelines
User requested recording failed payment attempts with failure reasons per JCC guidelines. The assistant implemented:
- **Database Schema**: Added `PaymentLog` model with comprehensive fields (booking info, customer data, JCC responses, error codes, processing times, IP addresses, user agents)
- **Database Migration**: Created and ran Prisma migration, regenerated client
- **Payment APIs**: Updated both `app/api/payment/verify/route.ts` and `app/api/payment/create-order/route.ts` with detailed logging
- **Admin Dashboard**: Created `app/admin/payment-logs/` with filtering, statistics, and detailed failure analysis
- **Email Updates**: Updated templates to use actual logo file with attachment support in `lib/mail.ts`

### Critical Issue - Test Mode Fallback Problem
User reported failed payments being recorded as successful. The assistant identified:
- **Root Cause**: `JCC_TEST_MODE=true` in `.env.local` was triggering fallback logic that assumed payment success for any JCC API failure
- **Fix**: Modified fallback logic to be more restrictive (only for API connectivity issues, not payment failures)
- **Configuration**: Commented out `JCC_TEST_MODE` in environment file
- **Logging**: Added clear warnings when fallback is used

### Final Issue - Validation Error
After payment logging changes, user encountered validation error about missing `vehicleId` in booking creation. The assistant diagnosed:
- **Root Cause**: Unrelated to payment logging - `vehicleId` was missing from `searchParams` in booking form submission
- **Analysis**: Found the issue in `ReviewAndPayClient.tsx` where `searchParams.vehicleId` was undefined
- **Solution**: Added validation on component mount, fallback logic using `vehicle.id`, enhanced error handling with specific messages, and automatic redirection to search page for missing parameters

### Critical Issue - Failed Payment Bookings Showing as Confirmed
User reported that failed payments were still showing bookings as "Confirmed" in the admin dashboard. The assistant identified and fixed:

#### Root Cause
The booking creation flow was flawed:
1. **Booking Created First**: When user clicks "CHECKOUT", booking is immediately created with `status: 'Confirmed'`
2. **Payment Attempted**: User redirected to JCC payment page  
3. **Payment Fails**: User enters invalid card details, payment fails
4. **Booking Remains Confirmed**: Even though payment failed, booking status remained "Confirmed"

#### The Fix
**Modified `app/api/bookings/create/route.ts`**:
```typescript
// Before (problematic):
status: 'Confirmed',

// After (fixed):
status: paymentType === 'online' ? 'Pending' : 'Confirmed', // Online payments start as Pending
```

**Status Consistency Updates**:
- Fixed `app/admin/page.tsx` - Changed `'CONFIRMED'` to `'Confirmed'` 
- Fixed `app/admin/bookings/BookingsClient.tsx` - Changed `'confirmed'` to `'Confirmed'`
- Ensured all status values use proper case consistently

#### How It Works Now
1. **Online Payment Bookings**: Created with `status: 'Pending'` initially
2. **Payment Verification**: 
   - ✅ Success: `status` updated to `'Confirmed'` 
   - ❌ Failure: `status` updated to `'Failed'`
3. **Pay on Arrival**: Still created with `status: 'Confirmed'` (no payment required)

#### Testing the Fix
To verify the fix:
1. Create a booking with online payment
2. Enter invalid credit card details
3. Payment should fail 
4. Check admin dashboard - booking should show as "Pending" (not "Confirmed")
5. If payment verification completes, it should update to "Failed"

This ensures failed payments don't leave confirmed bookings in the system, maintaining data integrity and accurate reporting.

### Additional Fix - Failed Payments Remaining as "Pending"
User reported that failed payments (wrong credentials) were showing as "Pending" instead of "Failed" in the admin dashboard.

#### Root Cause
The payment verification endpoint (`app/api/payment/verify/route.ts`) was logging failed payments but not updating the booking status to "Failed" in the database. When JCC verification failed, it would just return an error response, leaving the booking stuck in "Pending" status.

#### The Fix Applied
**Modified `app/api/payment/verify/route.ts`:**
- Added database update when payment verification fails
- Now updates both `paymentStatus` and `status` to "Failed" when JCC verification fails
- Added logging to track when booking status is updated due to payment failure

```typescript
// This is a real payment failure or we're in production mode
console.error('❌ JCC verification failed - payment was not successful:', jccVerification.error);

// Update booking status to Failed when payment verification fails
await prisma.booking.update({
  where: { id: bookingId },
  data: {
    paymentStatus: 'Failed',
    status: 'Failed',
  },
});

console.log(`📝 Updated booking ${bookingId} status to 'Failed' due to payment verification failure`);
```

### Transaction ID Display Enhancement
User requested that JCC transaction IDs be visible for successful payments. The system was already designed to store transaction IDs but had two issues:

#### Issues Found and Fixed:
1. **Storage Issue**: Payment verification wasn't storing the JCC order ID in the `transactionId` field
2. **Visibility Issue**: Transaction ID was only shown in expanded details view

#### Fixes Applied:
**Enhanced `app/api/payment/verify/route.ts`:**
- Now stores JCC order ID in `transactionId` field when payments are successful
- Transaction ID is stored for all successful payment verifications

**Enhanced `app/admin/bookings/BookingsClient.tsx`:**
- Added "Transaction ID" column to main bookings table
- Displays JCC transaction ID in monospace font for successful payments
- Shows "No transaction" for bookings without transaction IDs (Pay on Arrival)
- Transaction ID is visible at a glance without expanding rows

#### How It Works:
- **Successful Online Payments**: Display JCC order ID in the Transaction ID column
- **Pay on Arrival**: Shows "No transaction" since no online payment was processed
- **Failed Payments**: Shows "No transaction" since payment didn't complete

### Invoice Counter System Enhancement
User requested that only successful payments should receive invoice numbers, with counter starting from P000001 format and reset functionality.

#### Issues Fixed:
1. **Incorrect Invoice Assignment**: Bookings were getting invoice numbers immediately upon creation, before payment verification
2. **Wrong Format**: Invoice numbers were using simple numeric format instead of P000001 format
3. **No Reset Functionality**: Admin couldn't reset the invoice counter
4. **Missing Display**: Invoice counter wasn't visible in general settings

#### Implementation:
**Modified Invoice Generation Flow:**
- **Before**: Invoice assigned during booking creation (regardless of payment status)
- **After**: Invoice assigned only after successful payment verification

**Enhanced `app/api/bookings/create/route.ts`:**
- Removed invoice number generation from booking creation
- Bookings now created without invoice numbers (will be assigned later)
- Only successful payments get invoice numbers

**Enhanced `app/api/payment/verify/route.ts`:**
- Added invoice number generation for successful payments only
- New format: P000001, P000002, etc.
- Automatic counter increment after successful payment
- Invoice numbers stored in `invoiceNo` field

**Enhanced `app/admin/setup/general/GeneralSettingsForm.tsx`:**
- Added "Invoice Settings" section to general settings
- Display current invoice counter in P000001 format
- Shows next invoice number that will be assigned
- Added "Reset" button with confirmation dialog
- Admin can reset counter to P000001 (with confirmation)

**Updated Database Schema:**
- Changed `nextInvoiceNumber` default from "14312" to "1"
- Created migration to update invoice counter starting point
- Fixed seed file to properly initialize general settings

#### How It Works Now:
1. **Booking Creation**: No invoice number assigned (field remains null)
2. **Payment Verification**: 
   - ✅ Success: Generate invoice number (P000001, P000002, etc.) and increment counter
   - ❌ Failure: No invoice number assigned
3. **Admin Interface**: 
   - View current counter in general settings
   - Reset counter with confirmation dialog
   - Track invoice progression

#### Testing Results:
- ✅ Seed file working correctly
- ✅ Invoice counter displays in general settings
- ✅ Reset functionality with confirmation dialog
- ✅ Invoice format: P000001, P000002, etc.
- ✅ Only successful payments receive invoice numbers

### Action Buttons and Stats Fixes
User reported that action buttons and stats weren't working properly in the admin bookings dashboard.

#### Issues Fixed:
1. **Missing Action Handlers**: View, Edit, and Print buttons had no onClick handlers
2. **Incorrect Stats Calculation**: Stats were looking for "Completed" status but bookings use "Confirmed"
3. **Non-functional New Booking Button**: Button had no navigation functionality

#### Implementation:
**Enhanced `app/admin/bookings/BookingsClient.tsx`:**
- Added `handleView()` - toggles expanded row to show/hide booking details
- Added `handleEdit()` - shows alert (placeholder for future edit functionality)
- Added `handlePrint()` - generates professional printable booking details
- Connected all action buttons to their respective handlers

**Fixed `app/admin/bookings/page.tsx`:**
- Corrected stats calculation from `status === 'Completed'` to `status === 'Confirmed'`
- Updated UI label from "Completed" to "Confirmed" to match actual booking status
- Added onClick handler to "New Booking" button for navigation

**Print Functionality:**
- Professional HTML template with company branding
- Includes all booking details (ID, invoice, transaction ID, customer info, vehicle details)
- Opens in new window for printing
- Properly formatted with CSS styling

#### How It Works Now:
- **👁️ View Button**: Expands/collapses booking details row
- **✏️ Edit Button**: Shows placeholder alert (ready for future implementation)
- **🖨️ Print Button**: Opens printable booking details in new window
- **🗑️ Delete Button**: Confirms deletion and removes booking (existing functionality)
- **📊 Stats**: Now correctly show confirmed bookings instead of non-existent "completed" status
- **➕ New Booking**: Navigates to booking creation page

#### Testing Results:
- ✅ All action buttons now functional
- ✅ Stats display correct values (Confirmed bookings now show properly)
- ✅ Print functionality generates professional documents
- ✅ View button properly toggles expanded details
- ✅ New Booking button navigates correctly

### Homepage Search Engine Performance Optimization
User requested optimization of the homepage search engine to load faster without affecting appearance or functionality.

#### Performance Issues Identified:
1. **Client-side API Call**: BookingForm component was making `/api/locations` call on every page load
2. **Network Delay**: Extra round-trip to server causing loading delays
3. **Loading State**: Form showed loading spinner while fetching locations
4. **Database Query**: API endpoint queried database on every request
5. **Waterfall Loading**: Form couldn't render until API call completed

#### Optimizations Implemented:
**Server-side Data Fetching:**
- Added `getLocations()` function to homepage server component
- Locations now fetched during server-side rendering (SSR)
- Uses `Promise.all()` to fetch locations in parallel with other data

**Next.js Caching:**
- Implemented `unstable_cache` with 1-hour cache duration
- Cached locations data with `['homepage-locations']` key
- Tagged with `['locations']` for selective revalidation
- Cache reduces database queries and improves response times

**Client Component Optimization:**
- BookingForm now initializes with prop locations when available
- Eliminated loading state when locations are provided as props
- Fallback to API call only when locations aren't pre-loaded
- Immediate form rendering without waiting for API response

**API Route Caching:**
- Added cache headers to `/api/locations` endpoint
- `Cache-Control: public, s-maxage=300, stale-while-revalidate=600`
- Improves performance for other pages that still use the API

#### Performance Improvements:
- **Faster Initial Load**: No client-side API call on homepage
- **Eliminated Loading State**: Form renders immediately with data
- **Reduced Database Queries**: Cached locations for 1 hour
- **Better UX**: Instant form availability without loading spinners
- **Maintained Functionality**: All features work exactly the same
- **Preserved Appearance**: No visual changes to the form

#### Technical Implementation:
```typescript
// Server-side caching with 1-hour duration
const getLocations = unstable_cache(
  async () => { /* fetch locations */ },
  ['homepage-locations'],
  { revalidate: 3600, tags: ['locations'] }
);

// Client-side immediate initialization
const [locationOptions, setLocationOptions] = useState(() => {
  if (propLocations) {
    // Use provided locations immediately
    return transformedLocations;
  }
  return [];
});
```

#### Results:
- ✅ Homepage search loads instantly
- ✅ No loading spinners for location dropdowns
- ✅ Reduced server load with caching
- ✅ Maintained all functionality
- ✅ Zero visual changes to user interface

### Failed Payment Status Update Fix
User reported that failed payments remained stuck as "Pending" instead of updating to "Failed" status in the admin dashboard.

#### Root Cause Analysis:
1. **Missing Status Update**: Payment failure page didn't call verification endpoint to update booking status
2. **One-way Flow**: Only successful payments were calling the verification endpoint
3. **JCC Redirect Issue**: Failed payments redirected to failure page but booking status wasn't updated
4. **Order Number Issue**: Payment creation was using `booking.invoiceNo` (null) instead of booking ID

#### Issues Fixed:
**Enhanced Payment Failure Page:**
- Added automatic status update when payment fails
- Calls payment verification endpoint with orderId when available
- Fallback to direct status update API when no orderId
- Ensures failed payments properly update booking status to "Failed"

**New API Endpoint:**
- Created `/api/payment/update-status` for direct booking status updates
- Handles cases where JCC doesn't provide orderId in failure redirect
- Validates booking exists before updating status
- Logs status changes for tracking

**Payment Creation Fixes:**
- Fixed order number generation to use booking ID instead of null invoice number
- Updated payment description to use booking ID instead of invoice number
- Removed invoice number from JCC jsonParams until payment succeeds

#### Technical Implementation:
```typescript
// Payment failure page now updates status
const updateBookingStatus = async () => {
  if (orderId) {
    // Try JCC verification first
    await fetch('/api/payment/verify', { /* ... */ });
  } else {
    // Fallback to direct update
    await fetch('/api/payment/update-status', { /* ... */ });
  }
};

// Order number generation fix
const orderNumber = `${bookingShort}${timestamp}`;
```

#### How It Works Now:
1. **Payment Attempt**: User redirected to JCC payment gateway
2. **Payment Fails**: JCC redirects to failure page with bookingId
3. **Status Update**: Failure page automatically calls verification or update API
4. **Database Update**: Booking status updated from "Pending" to "Failed"
5. **Admin Dashboard**: Shows accurate "Failed" status instead of "Pending"

#### Results:
- ✅ Failed payments now show "Failed" status in admin dashboard
- ✅ No more bookings stuck in "Pending" state after payment failure
- ✅ Proper error handling for both verification and direct update scenarios
- ✅ Fixed order number generation for JCC integration
- ✅ Comprehensive logging for payment failure tracking

### Order Number Format Fix
User encountered "Order number is invalid" error when attempting to create payment orders with JCC.

#### Root Cause:
The order number format was not compliant with JCC requirements:
- **Old format**: `BOOKING-${booking.id}-${Date.now()}` (too long, contains hyphens)
- **Issue**: JCC systems have restrictions on order number length and allowed characters

#### Solution Applied:
**Updated Order Number Generation:**
- **New format**: `${bookingShort}${timestamp}` (16 characters, alphanumeric only)
- **bookingShort**: First 8 characters of booking ID (special characters removed)
- **timestamp**: Last 8 digits of current timestamp for uniqueness

#### Technical Implementation:
```typescript
// Generate JCC-compliant order number
const timestamp = Date.now().toString().slice(-8);
const bookingShort = booking.id.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8);
const orderNumber = `${bookingShort}${timestamp}`;
```

#### Examples:
- **Old (problematic)**: `BOOKING-cmd4lffb-abcd-1234-efgh-567890123456-1752601234567`
- **New (compliant)**: `cmd4lffb12345678`

#### Results:
- ✅ Order numbers now comply with JCC format requirements
- ✅ Payment setup no longer fails with "Order number is invalid" error
- ✅ Maintained uniqueness and traceability
- ✅ Shorter, more efficient order number format

### Key Technical Implementations
- **Payment Logging**: Comprehensive tracking of all payment attempts with JCC response data, error codes, processing times, and customer information
- **Data Conflict Resolution**: Professional modal with side-by-side comparison and user choice options
- **Guest Account Upgrades**: Seamless conversion from guest to full account with password protection
- **Form Validation**: Robust parameter checking with helpful error messages and navigation guidance
- **Admin Interface**: Payment logs dashboard with filtering capabilities and detailed failure analysis
- **Email System**: Company-branded templates with logo attachments and proper formatting
- **Booking Status Logic**: Proper handling of payment-dependent booking statuses to prevent false confirmations
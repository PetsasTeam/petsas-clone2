# JCC Payment Gateway Integration

## Overview
This document explains how to integrate JCC Secure Payments with your Next.js car rental application.

## Integration Features
- ✅ **Web SDK Payment Integration** - Redirects users to JCC's secure payment page
- ✅ **Apple Pay & Google Pay Support** - Automatically available through JCC
- ✅ **PCI DSS Compliant** - Card data handled by JCC, not your server
- ✅ **Payment Verification** - Automatic payment status verification
- ✅ **Success/Failure Pages** - Complete user experience
- ✅ **Booking Integration** - Updates booking status based on payment results

## Files Created/Modified

### New Files Created:
- `lib/jcc-payment.ts` - Core JCC payment utilities
- `app/api/payment/create-order/route.ts` - Create payment orders
- `app/api/payment/verify/route.ts` - Verify payment status
- `app/[locale]/payment/success/page.tsx` - Payment success page
- `app/[locale]/payment/success/PaymentSuccessClient.tsx` - Success page client component
- `app/[locale]/payment/failure/page.tsx` - Payment failure page

### Modified Files:
- `app/[locale]/review-and-pay/ReviewAndPayClient.tsx` - Added JCC payment flow

## Environment Variables Setup

Add these environment variables to your `.env.local` file:

```bash
# JCC Payment Gateway Configuration

# Test Environment (for development)
JCC_TEST_LOGIN="your_jcc_test_login"
JCC_TEST_PASSWORD="your_jcc_test_password"

# Production Environment (for live site)
JCC_PROD_LOGIN="your_jcc_production_login" 
JCC_PROD_PASSWORD="your_jcc_production_password"

# Set to 'true' to force test mode even in production
JCC_TEST_MODE="true"

# Application URLs (used for payment redirects)
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

## Getting JCC Credentials

### Test Environment:
1. Contact JCC to request test credentials
2. You'll receive:
   - Test Login (username)
   - Test Password
   - Access to JCC sandbox environment

### Production Environment:
1. Complete JCC merchant application process
2. Provide business documentation
3. Sign merchant agreement
4. Receive production credentials

## Payment Flow

### 1. User Journey
```
Customer fills booking form
       ↓
Selects "Pay Online"
       ↓  
Clicks "CHECKOUT"
       ↓
Booking created in database (status: Pending)
       ↓
JCC payment order created
       ↓
User redirected to JCC payment page
       ↓
User completes payment on JCC
       ↓
JCC redirects back to success/failure page
       ↓
Payment status verified with JCC API
       ↓
Booking status updated in database
```

### 2. Technical Flow
```
ReviewAndPayClient.handleSubmit()
       ↓
POST /api/bookings/create (creates booking)
       ↓
POST /api/payment/create-order (creates JCC order)
       ↓
window.location.href = JCC payment URL
       ↓
User completes payment
       ↓
JCC redirects to /payment/success or /payment/failure
       ↓
POST /api/payment/verify (verifies with JCC)
       ↓
Database updated with final payment status
```

## API Endpoints

### POST /api/payment/create-order
Creates a payment order with JCC.

**Request:**
```json
{
  "bookingId": "booking_id",
  "amount": 99.99,
  "currency": "EUR",
  "customerEmail": "customer@example.com",
  "customerPhone": "+35799123456",
  "customerFirstName": "John",
  "customerLastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "paymentUrl": "https://gateway.jcc.com.cy/payment?mdOrder=12345",
  "orderId": "jcc_order_id",
  "orderNumber": "INV-12345-1640995200000"
}
```

### POST /api/payment/verify
Verifies payment status with JCC.

**Request:**
```json
{
  "orderId": "jcc_order_id",
  "bookingId": "booking_id"
}
```

**Response:**
```json
{
  "success": true,
  "paymentStatus": "Paid",
  "bookingStatus": "Confirmed",
  "jccStatus": "2",
  "amount": 9999,
  "currency": "EUR",
  "booking": {
    "id": "booking_id",
    "invoiceNo": "12345",
    "status": "Confirmed",
    "paymentStatus": "Paid"
  }
}
```

## JCC Payment Status Codes

| JCC Status | Meaning | Our Status |
|------------|---------|------------|
| 0 | Not Paid | Failed |
| 1 | Pre-authorized | Pre-authorized |
| 2 | Paid | Paid |

## Testing

### Test Cards (JCC Sandbox)
Use these test card numbers in the JCC sandbox environment:

**Successful Payment:**
- Card: 4111 1111 1111 1111
- Expiry: Any future date
- CVV: 123

**Failed Payment:**
- Card: 4000 0000 0000 0002
- Expiry: Any future date  
- CVV: 123

### Test Process
1. Set `JCC_TEST_MODE="true"` in environment
2. Use test credentials
3. Complete a booking with "Pay Online"
4. Use test card numbers
5. Verify payment status updates correctly

## Security Notes

1. **Never commit credentials** - Add `.env.local` to `.gitignore`
2. **Server-side only** - JCC credentials are only used on server
3. **HTTPS required** - Production must use HTTPS for security
4. **PCI DSS compliance** - Card data never touches your server

## Error Handling

### Common Issues and Solutions:

**"JCC credentials not configured"**
- Check environment variables are set correctly
- Ensure `.env.local` file exists and is loaded

**"Failed to create payment order"**
- Verify JCC credentials are correct
- Check network connectivity to JCC API
- Ensure amount is in correct format (number, not string)

**"Payment verification failed"**
- Check if JCC order ID is valid
- Verify booking exists in database
- Check JCC API status

**"Missing payment information"**
- Ensure success/failure URLs include bookingId and orderId parameters
- Check URL parameters are being passed correctly

## Production Deployment

1. **Environment Variables:**
   ```bash
   JCC_TEST_MODE="false"
   JCC_PROD_LOGIN="your_production_login"
   JCC_PROD_PASSWORD="your_production_password"
   NEXT_PUBLIC_BASE_URL="https://yourdomain.com"
   ```

2. **SSL Certificate:** Ensure your site uses HTTPS
3. **Domain Verification:** Register your domain with JCC
4. **Test thoroughly** with small amounts before going live

## Support

### JCC Support:
- Website: https://gateway.jcc.com.cy/developer/
- Documentation: https://gateway.jcc.com.cy/developer/
- Support: Contact JCC technical support

### Integration Questions:
Check the JCC developer documentation for API details and additional features.

## Future Enhancements

Possible improvements for later:

1. **Web SDK Core** - Custom payment form with more control
2. **Mobile SDK** - Native mobile app integration  
3. **Recurring Payments** - For subscription-based services
4. **Refund API** - Automated refund processing
5. **Webhook Integration** - Real-time payment notifications
6. **Multi-currency** - Support multiple currencies
7. **Installment Payments** - JCC installment payment feature

## Troubleshooting

### Development Issues:

**Payment page doesn't load:**
- Check console for JavaScript errors
- Verify JCC payment URL is valid
- Ensure popup blockers aren't interfering

**Redirects don't work:**
- Check `NEXT_PUBLIC_BASE_URL` environment variable
- Verify success/failure page routes exist
- Test redirect URLs manually

**Database not updating:**
- Check payment verification API logs
- Verify database connection
- Ensure Prisma schema includes required fields

### Production Issues:

**Payments failing in production:**
- Verify production credentials with JCC
- Check domain is registered with JCC
- Ensure HTTPS is properly configured
- Test with small amounts first 
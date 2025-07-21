# JCC Payment Integration - Quick Start Guide

## 🚀 Get Started in 5 Steps

### Step 1: Environment Variables
Create/update your `.env.local` file with:

```bash
# JCC Test Credentials (get these from JCC)
JCC_TEST_LOGIN="your_test_login"
JCC_TEST_PASSWORD="your_test_password"
JCC_TEST_MODE="true"

# Your app URL for payment redirects
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### Step 2: Get JCC Test Credentials
Contact JCC support to request test credentials:
- Email: [JCC Support Email]
- Website: https://gateway.jcc.com.cy/developer/
- Request: Sandbox/test merchant account for development

### Step 3: Test the Integration
1. Start your development server: `npm run dev`
2. Navigate to booking flow: http://localhost:3000/en/search
3. Complete a booking with "Pay Online" selected
4. You'll be redirected to JCC payment page
5. Use test card: `4111 1111 1111 1111`, expiry: any future date, CVV: `123`

### Step 4: Verify Everything Works
After payment, check:
- ✅ Redirected to success page: `/payment/success`
- ✅ Booking status updated to "Paid" in admin dashboard
- ✅ Customer receives booking confirmation

### Step 5: Production Setup
When ready for live payments:
1. Get production credentials from JCC
2. Update environment variables:
   ```bash
   JCC_TEST_MODE="false"
   JCC_PROD_LOGIN="your_production_login"
   JCC_PROD_PASSWORD="your_production_password"
   NEXT_PUBLIC_BASE_URL="https://yourdomain.com"
   ```
3. Test with small amounts first!

## 🔍 Quick Test Checklist

- [ ] Environment variables configured
- [ ] JCC test credentials obtained
- [ ] Booking flow completes successfully
- [ ] Payment redirects to JCC page
- [ ] Test card payment succeeds
- [ ] Success page displays correctly
- [ ] Booking status updates in database
- [ ] Admin dashboard shows payment status

## 🛟 Quick Troubleshooting

**"JCC credentials not configured"**
→ Check your `.env.local` file has the JCC variables

**Payment page doesn't load**
→ Verify `NEXT_PUBLIC_BASE_URL` matches your local development URL

**Booking not created**
→ Check console logs and ensure database connection works

**Need Help?**
→ See full documentation in `docs/jcc_payment_integration.md`

## 💳 Test Cards

| Purpose | Card Number | Expiry | CVV | Result |
|---------|-------------|--------|-----|--------|
| Success | 4111 1111 1111 1111 | Any future | 123 | Payment succeeds |
| Failure | 4000 0000 0000 0002 | Any future | 123 | Payment fails |

## 🎯 What's Included

The integration provides:
- **Secure payment processing** via JCC
- **Apple Pay & Google Pay** support (automatic)
- **Payment verification** and status updates
- **Success/failure handling** with user-friendly pages
- **Admin dashboard** integration
- **Complete audit trail** of payments

Ready to start? Follow Step 1 above! 🚀 
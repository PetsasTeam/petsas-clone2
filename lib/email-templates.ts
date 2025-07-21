// Professional Email Templates for Petsas Car Rentals
// Based on the company's existing PDF invoicing format

interface BookingEmailData {
  booking: {
    id: string;
    invoiceNo: string;
    orderNumber: string; // Added orderNumber to the interface
    status: string;
    paymentStatus: string;
    paymentType: string;
    totalPrice: number;
    startDate: string;
    endDate: string;
    customer: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      dateOfBirth?: string;
    };
    vehicle: {
      name: string;
      code: string;
      image?: string;
    };
  };
  bookingDetails: {
    pickupLocation: string;
    dropoffLocation: string;
    pickupTime: string;
    dropoffTime: string;
    selectedExtras?: Array<{
      id: string;
      name: string;
      quantity: number;
      price: number;
    }>;
    flightInfo?: {
      flightNo?: string;
      airline?: string;
      arrivalTime?: string;
    };
    comments?: string;
    promotionCode?: string;
    discountAmount?: number;
    vatAmount?: number;
  };
}

export function generateBookingConfirmationEmail(data: BookingEmailData): { html: string; text: string } {
  const { booking, bookingDetails } = data;
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString || '09:00';
  };

  // Calculate rental days
  const startDate = new Date(booking.startDate);
  const endDate = new Date(booking.endDate);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Calculate pricing breakdown (matching the screenshot)
  const extrasTotal = bookingDetails.selectedExtras?.reduce((sum, extra) => 
    sum + (extra.price * extra.quantity), 0) || 0;
  
  // VAT calculation (19%)
  const totalWithoutVat = booking.totalPrice / 1.19;
  const vatAmount = booking.totalPrice - totalWithoutVat;
  
  // Discount calculation
  const discountAmount = bookingDetails.discountAmount || 0;
  const totalBeforeDiscount = booking.totalPrice + discountAmount;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmation - Petsas Car Rentals</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, Helvetica, sans-serif;
            line-height: 1.4;
            color: #333;
            background-color: #f5f5f5;
        }
        
        .email-container {
            max-width: 800px;
            margin: 20px auto;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        
        .header {
            background: white;
            padding: 30px;
            border-bottom: 2px solid #059669;
            width: 100%;
        }
        
        .header-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .header-table td {
            vertical-align: top;
            padding: 0;
        }
        
        .logo-section {
            width: 50%;
            text-align: left;
        }
        
        .logo {
            width: 80px;
            height: 80px;
            background: url('cid:logo') center/contain no-repeat;
            margin-right: 20px;
            border-radius: 50%;
            display: inline-block;
            vertical-align: top;
        }
        
        .company-info {
            display: inline-block;
            vertical-align: top;
            margin-top: 10px;
        }
        
        .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #059669;
            margin-bottom: 5px;
            display: block;
        }
        
        .company-subtitle {
            font-size: 16px;
            color: #666;
            display: block;
        }
        
        .booking-header {
            width: 50%;
            text-align: right;
        }
        
        .booking-title {
            font-size: 28px;
            font-weight: bold;
            color: #059669;
            margin-bottom: 10px;
            display: block;
        }
        
        .booking-number {
            font-size: 16px;
            color: #666;
            display: block;
        }
        
        .content {
            padding: 40px;
        }
        
        .greeting {
            font-size: 16px;
            margin-bottom: 20px;
            color: #333;
        }
        
        .reservation-intro {
            margin-bottom: 30px;
            color: #333;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 40px;
        }
        
        .info-section {
            border: 1px solid #ddd;
            padding: 0;
        }
        
        .info-section h3 {
            background: #f8f9fa;
            color: #333;
            font-size: 16px;
            margin: 0;
            padding: 12px 15px;
            font-weight: bold;
            border-bottom: 1px solid #ddd;
        }
        
        .info-content {
            padding: 15px;
        }
        
        .info-row {
            display: flex;
            margin-bottom: 8px;
            padding: 2px 0;
        }
        
        .info-label {
            font-weight: 600;
            color: #333;
            min-width: 80px;
            margin-right: 10px;
        }
        
        .info-value {
            color: #333;
            flex: 1;
        }
        
        .booking-details-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
            border: 1px solid #ddd;
        }
        
        .booking-details-table th {
            background: #f8f9fa;
            color: #333;
            padding: 12px 15px;
            text-align: center;
            font-weight: bold;
            border: 1px solid #ddd;
        }
        
        .booking-details-table td {
            padding: 12px 15px;
            border: 1px solid #ddd;
            text-align: center;
        }
        
        .booking-details-table .item-name {
            text-align: left;
        }
        
        .booking-details-table .price {
            text-align: right;
        }
        
        .totals-section {
            margin: 30px 0;
            border: 1px solid #ddd;
        }
        
        .totals-header {
            background: #f8f9fa;
            padding: 12px 15px;
            font-weight: bold;
            text-align: center;
            border-bottom: 1px solid #ddd;
        }
        
        .totals-content {
            padding: 15px;
        }
        
        .totals-table {
            width: 100%;
            margin-bottom: 0;
        }
        
        .totals-table td {
            padding: 5px 0;
            border: none;
        }
        
        .totals-table .label {
            text-align: right;
            padding-right: 20px;
            font-weight: 600;
        }
        
        .totals-table .amount {
            text-align: right;
            font-weight: bold;
        }
        
        .totals-table .total-row td {
            border-top: 1px solid #333;
            padding-top: 10px;
            font-weight: bold;
            font-size: 16px;
        }
        
        .vat-info {
            text-align: right;
            font-style: italic;
            color: #666;
            margin-top: 10px;
            font-size: 14px;
        }
        
        .important-notes {
            background: #fff9e6;
            border: 1px solid #ffd700;
            border-radius: 4px;
            padding: 20px;
            margin: 30px 0;
            color: #b8860b;
        }
        
        .important-notes p {
            margin-bottom: 10px;
            font-size: 14px;
            line-height: 1.5;
        }
        
        .important-notes .highlight {
            color: #d2691e;
            font-weight: bold;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
        }
        
        @media (max-width: 600px) {
            .header-table {
                display: block !important;
                width: 100% !important;
            }
            
            .header-table td {
                display: block !important;
                width: 100% !important;
                text-align: center !important;
                padding: 10px 0 !important;
            }
            
            .logo-section {
                margin-bottom: 20px;
            }
            
            .booking-header {
                text-align: center !important;
            }
            
            .info-grid {
                grid-template-columns: 1fr;
                gap: 20px;
            }
            
            .content {
                padding: 20px;
            }
            
            .booking-details-table th,
            .booking-details-table td {
                padding: 8px 5px;
                font-size: 14px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header with Logo -->
        <div class="header">
            <table class="header-table">
                <tr>
                    <td class="logo-section">
                        <div class="logo"></div>
                        <div class="company-info">
                            <div class="company-name">PETSAS RENT A CAR</div>
                        </div>
                    </td>
                    <td class="booking-header">
                        <div class="booking-title">BOOKING CONFIRMED</div>
                        <div class="booking-number">Order No.: ${booking.orderNumber || booking.invoiceNo || 'N/A'}</div>
                    </td>
                </tr>
            </table>
        </div>
        
        <!-- Content -->
        <div class="content">
            <div class="greeting">
                Dear Customer,
            </div>
            
            <div class="reservation-intro">
                Thank you for reserving with us.<br>
                Your reservation details are as follows:
            </div>
            
            <!-- Information Grid -->
            <div class="info-grid">
                <!-- Customer Info -->
                <div class="info-section">
                    <h3>Customer Info</h3>
                    <div class="info-content">
                        <div class="info-row">
                            <span class="info-label">Name:</span>
                            <span class="info-value">${booking.customer.firstName} ${booking.customer.lastName}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Address:</span>
                            <span class="info-value">-</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Phone:</span>
                            <span class="info-value">${booking.customer.phone}</span>
                        </div>
                        ${booking.customer.dateOfBirth ? `
                        <div class="info-row">
                            <span class="info-label">Birthday:</span>
                            <span class="info-value">${formatDate(booking.customer.dateOfBirth)}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                <!-- Booking Info -->
                <div class="info-section">
                    <h3>Booking Info</h3>
                    <div class="info-content">
                        <div class="info-row">
                            <span class="info-label">Pick up:</span>
                            <span class="info-value">${bookingDetails.pickupLocation} on ${formatDate(booking.startDate)} | ${formatTime(bookingDetails.pickupTime)} (${bookingDetails.pickupLocation})</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Drop off:</span>
                            <span class="info-value">${bookingDetails.dropoffLocation} on ${formatDate(booking.endDate)} | ${formatTime(bookingDetails.dropoffTime)} (${bookingDetails.dropoffLocation})</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Payment Method:</span>
                            <span class="info-value">${booking.paymentType}</span>
                        </div>
                        ${bookingDetails.flightInfo?.flightNo ? `
                        <div class="info-row">
                            <span class="info-label">Flight:</span>
                            <span class="info-value">${bookingDetails.flightInfo.flightNo}</span>
                        </div>
                        ` : ''}
                        ${bookingDetails.comments ? `
                        <div class="info-row">
                            <span class="info-label">Comments:</span>
                            <span class="info-value">${bookingDetails.comments}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
            
            <!-- Booking Details Table -->
            <table class="booking-details-table">
                <thead>
                    <tr>
                        <th>ITEM</th>
                        <th>QTY</th>
                        <th>PRICE</th>
                        <th>TOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="item-name">${booking.vehicle.name}</td>
                        <td>1</td>
                        <td class="price">€${(totalWithoutVat - extrasTotal).toFixed(2)}</td>
                        <td class="price">€${(totalWithoutVat - extrasTotal).toFixed(2)}</td>
                    </tr>
                    ${bookingDetails.selectedExtras?.map(extra => `
                    <tr>
                        <td class="item-name">${extra.name}</td>
                        <td>${extra.quantity}</td>
                        <td class="price">€${extra.price.toFixed(2)}</td>
                        <td class="price">€${(extra.price * extra.quantity).toFixed(2)}</td>
                    </tr>
                    `).join('') || ''}
                </tbody>
            </table>
            
            <!-- Totals Section -->
            <div class="totals-section">
                <div class="totals-header">TOTALS</div>
                <div class="totals-content">
                    <table class="totals-table">
                        <tr>
                            <td class="label">Total (before discount):</td>
                            <td class="amount">€${totalBeforeDiscount.toFixed(2)}</td>
                        </tr>
                        ${discountAmount > 0 ? `
                        <tr>
                            <td class="label">*Discount on vehicle rental rate (${Math.round((discountAmount/totalBeforeDiscount)*100)}%):</td>
                            <td class="amount">-€${discountAmount.toFixed(2)}</td>
                        </tr>
                        ` : ''}
                        <tr class="total-row">
                            <td class="label">TOTAL:</td>
                            <td class="amount">€${booking.totalPrice.toFixed(2)}</td>
                        </tr>
                    </table>
                    <div class="vat-info">Total VAT included: €${vatAmount.toFixed(2)}</div>
                </div>
            </div>
            
            <!-- Important Notes -->
            <div class="important-notes">
                <p><span class="highlight">* The discount is applicable on basic rate only.</span></p>
                <p><span class="highlight">Please note that a fee of € 20 is applicable, if pick up of vehicle is either from Larnaka or Pafos Airport.</span></p>
                <p>The cost of fuel is not included in the price. Our company's policy is to provide the vehicle with a full tank of fuel which is refundable if the vehicle is returned with full tank.</p>
                <p><span class="highlight">The company reserves the right to refuse to clients the waiver option of Super Collision Damage Waiver (SCDW) for rental periods of less than 7 days and in such a case shall refund the corresponding amount to the credit/debit card used for payment.</span></p>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            © 2025 Andreas Petsas & Sons Public Ltd, Disclaimer | Privacy Policy | Cookie Policy<br>
            Registration Number E8171 - VAT Registration Number 10008171 N
        </div>
    </div>
</body>
</html>`;

  // Generate plain text version
  const text = `
ANDREAS PETSAS & SONS PUBLIC LTD
BOOKING CONFIRMATION

Dear Customer,

Thank you for reserving with us.
Your reservation details are as follows:

BOOKING NUMBER: ${booking.orderNumber || booking.invoiceNo}
DATE: ${formatDate(new Date().toISOString())}

CUSTOMER INFO:
Name: ${booking.customer.firstName} ${booking.customer.lastName}
Phone: ${booking.customer.phone}
${booking.customer.dateOfBirth ? `Birthday: ${formatDate(booking.customer.dateOfBirth)}` : ''}

BOOKING INFO:
Pick up: ${bookingDetails.pickupLocation} on ${formatDate(booking.startDate)} | ${formatTime(bookingDetails.pickupTime)}
Drop off: ${bookingDetails.dropoffLocation} on ${formatDate(booking.endDate)} | ${formatTime(bookingDetails.dropoffTime)}
Payment Method: ${booking.paymentType}
${bookingDetails.flightInfo?.flightNo ? `Flight: ${bookingDetails.flightInfo.flightNo}` : ''}
${bookingDetails.comments ? `Comments: ${bookingDetails.comments}` : ''}

BOOKING DETAILS:
${booking.vehicle.name} - €${(totalWithoutVat - extrasTotal).toFixed(2)}
${bookingDetails.selectedExtras?.map(extra => `${extra.name} (${extra.quantity}) - €${(extra.price * extra.quantity).toFixed(2)}`).join('\n') || ''}

TOTALS:
${discountAmount > 0 ? `Total (before discount): €${totalBeforeDiscount.toFixed(2)}` : ''}
${discountAmount > 0 ? `Discount: -€${discountAmount.toFixed(2)}` : ''}
TOTAL: €${booking.totalPrice.toFixed(2)}
Total VAT included: €${vatAmount.toFixed(2)}

IMPORTANT NOTES:
* The discount is applicable on basic rate only.
* Please note that a fee of € 20 is applicable, if pick up of vehicle is either from Larnaka or Pafos Airport.
* The cost of fuel is not included in the price.

© 2025 Andreas Petsas & Sons Public Ltd
Registration Number E8171 - VAT Registration Number 10008171 N
  `;

  return { html, text };
}

export function generatePaymentConfirmationEmail(data: BookingEmailData): { html: string; text: string } {
  const { booking, bookingDetails } = data;
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString || '09:00';
  };

  // Calculate rental days
  const startDate = new Date(booking.startDate);
  const endDate = new Date(booking.endDate);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Calculate pricing breakdown (matching the screenshot)
  const extrasTotal = bookingDetails.selectedExtras?.reduce((sum, extra) => 
    sum + (extra.price * extra.quantity), 0) || 0;
  
  // VAT calculation (19%)
  const totalWithoutVat = booking.totalPrice / 1.19;
  const vatAmount = booking.totalPrice - totalWithoutVat;
  
  // Discount calculation
  const discountAmount = bookingDetails.discountAmount || 0;
  const totalBeforeDiscount = booking.totalPrice + discountAmount;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Confirmation - Petsas Car Rentals</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, Helvetica, sans-serif;
            line-height: 1.4;
            color: #333;
            background-color: #f5f5f5;
        }
        
        .email-container {
            max-width: 800px;
            margin: 20px auto;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        
        .header {
            background: white;
            padding: 30px;
            border-bottom: 2px solid #059669;
            width: 100%;
        }
        
        .header-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .header-table td {
            vertical-align: top;
            padding: 0;
        }
        
        .logo-section {
            width: 50%;
            text-align: left;
        }
        
        .logo {
            width: 80px;
            height: 80px;
            background: url('cid:logo') center/contain no-repeat;
            margin-right: 20px;
            border-radius: 50%;
            display: inline-block;
            vertical-align: top;
        }
        
        .company-info {
            display: inline-block;
            vertical-align: top;
            margin-top: 10px;
        }
        
        .company-name {
            font-size: 20px;
            font-weight: bold;
            color: #000000;
            margin-bottom: 5px;
            display: block;
            line-height: 1.2;
        }
        
        .booking-header {
            width: 50%;
            text-align: right;
        }
        
        .booking-title {
            font-size: 28px;
            font-weight: bold;
            color: #059669;
            margin-bottom: 10px;
            display: block;
        }
        
        .booking-number {
            font-size: 16px;
            color: #666;
            display: block;
        }
        
        .content {
            padding: 40px;
        }
        
        .greeting {
            font-size: 16px;
            margin-bottom: 20px;
            color: #333;
        }
        
        .payment-success {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .payment-success h2 {
            color: #155724;
            font-size: 24px;
            margin-bottom: 10px;
        }
        
        .payment-success p {
            color: #155724;
            font-size: 16px;
        }
        
        .reservation-intro {
            margin-bottom: 30px;
            color: #333;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 40px;
        }
        
        .info-section {
            border: 1px solid #ddd;
            padding: 0;
        }
        
        .info-section h3 {
            background: #f8f9fa;
            color: #333;
            font-size: 16px;
            margin: 0;
            padding: 12px 15px;
            font-weight: bold;
            border-bottom: 1px solid #ddd;
        }
        
        .info-content {
            padding: 15px;
        }
        
        .info-row {
            display: flex;
            margin-bottom: 8px;
            padding: 2px 0;
        }
        
        .info-label {
            font-weight: 600;
            color: #333;
            min-width: 80px;
            margin-right: 10px;
        }
        
        .info-value {
            color: #333;
            flex: 1;
        }
        
        .booking-details-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
            border: 1px solid #ddd;
        }
        
        .booking-details-table th {
            background: #f8f9fa;
            color: #333;
            padding: 12px 15px;
            text-align: center;
            font-weight: bold;
            border: 1px solid #ddd;
        }
        
        .booking-details-table td {
            padding: 12px 15px;
            border: 1px solid #ddd;
            text-align: center;
        }
        
        .booking-details-table .item-name {
            text-align: left;
        }
        
        .booking-details-table .price {
            text-align: right;
        }
        
        .totals-section {
            margin: 30px 0;
            border: 1px solid #ddd;
        }
        
        .totals-header {
            background: #f8f9fa;
            padding: 12px 15px;
            font-weight: bold;
            text-align: center;
            border-bottom: 1px solid #ddd;
        }
        
        .totals-content {
            padding: 15px;
        }
        
        .totals-table {
            width: 100%;
            margin-bottom: 0;
        }
        
        .totals-table td {
            padding: 5px 0;
            border: none;
        }
        
        .totals-table .label {
            text-align: right;
            padding-right: 20px;
            font-weight: 600;
        }
        
        .totals-table .amount {
            text-align: right;
            font-weight: bold;
        }
        
        .totals-table .total-row td {
            border-top: 1px solid #333;
            padding-top: 10px;
            font-weight: bold;
            font-size: 16px;
        }
        
        .vat-info {
            text-align: right;
            font-style: italic;
            color: #666;
            margin-top: 10px;
            font-size: 14px;
        }
        
        .important-notes {
            background: #fff9e6;
            border: 1px solid #ffd700;
            border-radius: 4px;
            padding: 20px;
            margin: 30px 0;
            color: #b8860b;
        }
        
        .important-notes p {
            margin-bottom: 10px;
            font-size: 14px;
            line-height: 1.5;
        }
        
        .important-notes .highlight {
            color: #d2691e;
            font-weight: bold;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
        }
        
        @media (max-width: 600px) {
            .header-table {
                display: block !important;
                width: 100% !important;
            }
            
            .header-table td {
                display: block !important;
                width: 100% !important;
                text-align: center !important;
                padding: 10px 0 !important;
            }
            
            .logo-section {
                margin-bottom: 20px;
            }
            
            .booking-header {
                text-align: center !important;
            }
            
            .info-grid {
                grid-template-columns: 1fr;
                gap: 20px;
            }
            
            .content {
                padding: 20px;
            }
            
            .booking-details-table th,
            .booking-details-table td {
                padding: 8px 5px;
                font-size: 14px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header with Logo -->
        <div class="header">
            <table class="header-table">
                <tr>
                    <td class="logo-section">
                        <div class="logo"></div>
                        <div class="company-info">
                            <div class="company-name">PETSAS RENT A CAR</div>
                        </div>
                    </td>
                    <td class="booking-header">
                        <div class="booking-title">PAYMENT CONFIRMED</div>
                        <div class="booking-number">Order No.: ${booking.orderNumber || booking.invoiceNo || 'N/A'}</div>
                    </td>
                </tr>
            </table>
        </div>
        
        <!-- Content -->
        <div class="content">
            <div class="greeting">
                Dear ${booking.customer.firstName} ${booking.customer.lastName},
            </div>
            
            <!-- Payment Success Banner -->
            <div class="payment-success">
                <h2>✅ Payment Successful!</h2>
                <p>Your payment has been processed successfully and your booking is now confirmed.</p>
            </div>
            
            <div class="reservation-intro">
                Thank you for your payment. Your booking is now confirmed.<br>
                Your booking details are as follows:
            </div>
            
            <!-- Information Grid -->
            <div class="info-grid">
                <!-- Customer Info -->
                <div class="info-section">
                    <h3>Customer Info</h3>
                    <div class="info-content">
                        <div class="info-row">
                            <span class="info-label">Name:</span>
                            <span class="info-value">${booking.customer.firstName} ${booking.customer.lastName}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Email:</span>
                            <span class="info-value">${booking.customer.email}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Phone:</span>
                            <span class="info-value">${booking.customer.phone}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Booking Info -->
                <div class="info-section">
                    <h3>Booking Info</h3>
                    <div class="info-content">
                        <div class="info-row">
                            <span class="info-label">Pick up:</span>
                            <span class="info-value">${bookingDetails.pickupLocation} on ${formatDate(booking.startDate)} | ${formatTime(bookingDetails.pickupTime)}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Drop off:</span>
                            <span class="info-value">${bookingDetails.dropoffLocation} on ${formatDate(booking.endDate)} | ${formatTime(bookingDetails.dropoffTime)}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Payment Method:</span>
                            <span class="info-value">${booking.paymentType}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Payment Status:</span>
                            <span class="info-value" style="color: #059669; font-weight: bold;">PAID ✅</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Booking Details Table -->
            <table class="booking-details-table">
                <thead>
                    <tr>
                        <th>ITEM</th>
                        <th>QTY</th>
                        <th>PRICE</th>
                        <th>TOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="item-name">${booking.vehicle.name}</td>
                        <td>1</td>
                        <td class="price">€${(totalWithoutVat - extrasTotal).toFixed(2)}</td>
                        <td class="price">€${(totalWithoutVat - extrasTotal).toFixed(2)}</td>
                    </tr>
                    ${bookingDetails.selectedExtras?.map(extra => `
                    <tr>
                        <td class="item-name">${extra.name}</td>
                        <td>${extra.quantity}</td>
                        <td class="price">€${extra.price.toFixed(2)}</td>
                        <td class="price">€${(extra.price * extra.quantity).toFixed(2)}</td>
                    </tr>
                    `).join('') || ''}
                </tbody>
            </table>
            
            <!-- Totals Section -->
            <div class="totals-section">
                <div class="totals-header">TOTALS</div>
                <div class="totals-content">
                    <table class="totals-table">
                        <tr>
                            <td class="label">Total (before discount):</td>
                            <td class="amount">€${totalBeforeDiscount.toFixed(2)}</td>
                        </tr>
                        ${discountAmount > 0 ? `
                        <tr>
                            <td class="label">*Discount on vehicle rental rate (${Math.round((discountAmount/totalBeforeDiscount)*100)}%):</td>
                            <td class="amount">-€${discountAmount.toFixed(2)}</td>
                        </tr>
                        ` : ''}
                        <tr class="total-row">
                            <td class="label">TOTAL PAID:</td>
                            <td class="amount">€${booking.totalPrice.toFixed(2)}</td>
                        </tr>
                    </table>
                    <div class="vat-info">Total VAT included: €${vatAmount.toFixed(2)}</div>
                </div>
            </div>
            
            <!-- Important Notes -->
            <div class="important-notes">
                <p><span class="highlight">* The discount is applicable on basic rate only.</span></p>
                <p><span class="highlight">Please note that a fee of € 20 is applicable, if pick up of vehicle is either from Larnaka or Pafos Airport.</span></p>
                <p>The cost of fuel is not included in the price. Our company's policy is to provide the vehicle with a full tank of fuel which is refundable if the vehicle is returned with full tank.</p>
                <p><span class="highlight">Please bring this confirmation and a valid driving license when collecting your vehicle.</span></p>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            © 2025 Andreas Petsas & Sons Public Ltd, Disclaimer | Privacy Policy | Cookie Policy<br>
            Registration Number E8171 - VAT Registration Number 10008171 N
        </div>
    </div>
</body>
</html>`;

  // Generate plain text version
  const text = `
ANDREAS PETSAS & SONS PUBLIC LTD
PAYMENT CONFIRMATION

Dear ${booking.customer.firstName} ${booking.customer.lastName},

✅ PAYMENT SUCCESSFUL!
Your payment has been processed successfully and your booking is now confirmed.

Thank you for your payment. Your booking is now confirmed.
Your booking details are as follows:

ORDER NUMBER: ${booking.orderNumber}
DATE: ${formatDate(new Date().toISOString())}

CUSTOMER INFO:
Name: ${booking.customer.firstName} ${booking.customer.lastName}
Email: ${booking.customer.email}
Phone: ${booking.customer.phone}

BOOKING INFO:
Pick up: ${bookingDetails.pickupLocation} on ${formatDate(booking.startDate)} | ${formatTime(bookingDetails.pickupTime)}
Drop off: ${bookingDetails.dropoffLocation} on ${formatDate(booking.endDate)} | ${formatTime(bookingDetails.dropoffTime)}
Payment Method: ${booking.paymentType}
Payment Status: PAID ✅

BOOKING DETAILS:
${booking.vehicle.name} - €${(totalWithoutVat - extrasTotal).toFixed(2)}
${bookingDetails.selectedExtras?.map(extra => `${extra.name} (${extra.quantity}) - €${(extra.price * extra.quantity).toFixed(2)}`).join('\n') || ''}

TOTALS:
${discountAmount > 0 ? `Total (before discount): €${totalBeforeDiscount.toFixed(2)}` : ''}
${discountAmount > 0 ? `Discount: -€${discountAmount.toFixed(2)}` : ''}
TOTAL PAID: €${booking.totalPrice.toFixed(2)}
Total VAT included: €${vatAmount.toFixed(2)}

IMPORTANT NOTES:
* The discount is applicable on basic rate only.
* Please note that a fee of € 20 is applicable, if pick up of vehicle is either from Larnaka or Pafos Airport.
* The cost of fuel is not included in the price.
* Please bring this confirmation and a valid driving license when collecting your vehicle.

© 2025 Andreas Petsas & Sons Public Ltd
Registration Number E8171 - VAT Registration Number 10008171 N
  `;

  return { html, text };
} 
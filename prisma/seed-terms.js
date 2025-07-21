const { PrismaClient } = require('../app/generated/prisma');
const prisma = new PrismaClient();

const termsContent = [
  {
    key: 'terms-intro',
    type: 'richtext',
    value: 'All Rentals are subject to the Terms and Conditions printed on the Rental Agreement.',
    altText: 'Terms Introduction',
    group: 'Legal',
    linkUrl: null,
  },
  {
    key: 'terms-short-rental-includes',
    type: 'richtext',
    value: `<ul>
      <li>Full Insurance (Third Party, Passengers, Collision Damage Waiver (CDW), Accidental damage to rented vehicle with excess: <br/>
        <b>EURO €700</b> - For Groups A3, A5, B3, B5, C2, C3, C4<br/>
        <b>EURO €1,000</b> - For Groups D1, D4, D5, D6, D7, EW, EY, T1<br/>
        <b>EURO €1,500</b> - For Groups E3, EH, H1, H2, T5, V3, V5, EC<br/>
        <b>EURO €2,500</b> - For Groups E5, EQ, ER, H6, V7, T6, W3, W4<br/>
        <b>EURO €3,500</b> - For Groups G3, G4, G5, H7, T8<br/>
        <b>EURO €5,000</b> - For Groups G9, H9, V8, V9
      </li>
      <li>Vehicle Theft Protection (not contents) with NO EXCESS</li>
      <li>Free delivery and collection within town/holiday resorts limits (same location)</li>
      <li>Unlimited Mileage</li>
      <li>Maintenance, oil and greasing</li>
      <li>VAT 19% inclusive</li>
      <li>No extra charge for additional driver</li>
    </ul>`,
    altText: 'Short Rental Includes',
    group: 'Legal',
    linkUrl: null,
  },
  {
    key: 'terms-short-rental-excludes',
    type: 'richtext',
    value: `<ul>
      <li>Fuel</li>
      <li>Additional requested items</li>
      <li>Super Collision Damage Waiver (S.C.D.W) Optional:<br/>
        <b>EURO €10.00</b> extra per day - For Groups A3, B3, C2, C4, D1, D4, A5, B5, C3, D5, D6, D7, T1, EW, EY<br/>
        <b>EURO €15.00</b> extra per day - For Groups H1, H2, T5, V3, V5, EC, EH, E3<br/>
        <b>EURO €20.00</b> extra per day - For Groups EQ, E5, G3, ER<br/>
        <b>EURO €30.00</b> extra per day - For Groups H6, H7, T6, T8, V7, V8, V9, W3, G4, G9
      </li>
      <li>Young drivers surcharge</li>
      <li>Additional Damage Waiver (Tyres, Windscreen, Underbody) Optional:<br/>
        <b>EURO €5.00</b> extra per day - For Groups A3, A5, B3, B5, C2, C3, C4, D1, D4, D5, D6, D7, EW, EY, T1<br/>
        <b>EURO €10.00</b> extra per day - For Groups E3, E5, EC, EH, EQ, ER, G3, G4, G5, G9, H1, H2, H6, H7, T5, T6, T8, V3, V5, V7, V8, V9, W3
      </li>
      <li>One way drop off charge for rentals under 3 days</li>
      <li>Airport charge EURO €20 for ON airport deliveries</li>
    </ul>`,
    altText: 'Short Rental Excludes',
    group: 'Legal',
    linkUrl: null,
  },
  {
    key: 'terms-long-rental-includes',
    type: 'richtext',
    value: `<ul>
      <li>Full Insurance with NO EXCESS (Third Party, Passengers, Accidental damage to rented vehicle including tyres, CDW, SCDW)</li>
      <li>Vehicle Theft Protection (not contents) with NO EXCESS</li>
      <li>Free delivery and collection 24 hours anywhere</li>
      <li>Unlimited Mileage</li>
      <li>Maintenance, oil and greasing</li>
      <li>VAT 19% inclusive</li>
      <li>No extra charge for additional driver/s</li>
    </ul>`,
    altText: 'Long Rental Includes',
    group: 'Legal',
    linkUrl: null,
  },
  {
    key: 'terms-long-rental-excludes',
    type: 'richtext',
    value: `<ul>
      <li>Fuel</li>
      <li>Additional requested items</li>
      <li>Young drivers surcharge</li>
      <li>Airport charge EURO €20 for ON airport deliveries</li>
    </ul>`,
    altText: 'Long Rental Excludes',
    group: 'Legal',
    linkUrl: null,
  },
  {
    key: 'terms-general-info',
    type: 'richtext',
    value: `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      <div class="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h4 class="font-semibold text-gray-900 mb-3 text-base">Prepayments:</h4>
        <p class="text-gray-600 text-sm leading-relaxed">For Car Groups H7, H9, T8, V8, V9, W3 and G9, a prepayment equal to 35% of the total amount of the booking is mandatory for "Pay on arrival" bookings. The customer will be notified by email for payment method options.</p>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h4 class="font-semibold text-gray-900 mb-3 text-base">Fuel:</h4>
        <p class="text-gray-600 text-sm leading-relaxed">A deposit payable for a full tank of fuel on delivery of car, is refundable if the car is returned with a full tank.</p>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h4 class="font-semibold text-gray-900 mb-3 text-base">Driver Requirements:</h4>
        <p class="text-gray-600 text-sm leading-relaxed">For drivers under 25 years of age who have had a full driving licence under 3 years at the time of rental, we must be advised at time of reservation in order to arrange insurance coverage for them.</p>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h4 class="font-semibold text-gray-900 mb-3 text-base">Car Type:</h4>
        <p class="text-gray-600 text-sm leading-relaxed">Cars listed are examples only. The right is reserved to supply an alternative car in the same or higher group when the reserved car is not available.</p>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h4 class="font-semibold text-gray-900 mb-3 text-base">Special Requests:</h4>
        <p class="text-gray-600 text-sm leading-relaxed">Child seats, booster seats, roof racks, navigation systems and other additional items may be provided on request at extra cost.</p>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h4 class="font-semibold text-gray-900 mb-3 text-base">Cancellation Policy:</h4>
        <p class="text-gray-600 text-sm leading-relaxed">Cancellations made 2 days or more prior to the rental pickup are free of charge, for all others a cancellation fee may apply. Especially for Car Groups H7, H9, T8, V8, V9, W3, W4 and G9, a cancellation fee equal to 35% of the total amount of the booking is applied for cancellations made at any point in time.</p>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h4 class="font-semibold text-gray-900 mb-3 text-base">Crossing to the Occupied Areas:</h4>
        <p class="text-gray-600 text-sm leading-relaxed">Additional insurance cover is required! E-mail us for further information.</p>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h4 class="font-semibold text-gray-900 mb-3 text-base">SCDW Charge for Short-term Rentals:</h4>
        <p class="text-gray-600 text-sm leading-relaxed">The Company reserves the right to refuse to clients the waiver option of Super Collision Damage Waiver (SCDW) for rental periods of less than 7 days and in such a case shall refund the corresponding amount to the credit/debit card used for payment.</p>
      </div>
    </div>`,
    altText: 'General Information',
    group: 'Legal',
    linkUrl: null,
  },
  {
    key: 'terms-additional-services',
    type: 'richtext',
    value: `<ul>
      <li>Young drivers charges for drivers under 25 years old with less than 3 years full licence available on request.</li>
      <li>Child/booster seat @ EURO €15.00 per rental.</li>
      <li>Roof/Ski Rack @ EURO €20.00 per rental.</li>
      <li>GPS from @ EURO €5 per day, Weekly EURO €25 with maximum charge per rental EURO €40.</li>
    </ul>`,
    altText: 'Additional Services',
    group: 'Legal',
    linkUrl: null,
  },
  {
    key: 'terms-payment-methods',
    type: 'richtext',
    value: `<ul>
      <li>For online payments, we accept Visa and Mastercard.</li>
      <li>For payments made locally, we accept all major credit and debit cards.</li>
    </ul>`,
    altText: 'Payment Methods',
    group: 'Legal',
    linkUrl: null,
  },
  {
    key: 'terms-company-info',
    type: 'richtext',
    value: '© 2025 Andreas Petsas & Sons Public Ltd, Disclaimer | Privacy Policy | Cookie Policy<br/>Registration Number E8171 - VAT Registration Number 10008171 N',
    altText: 'Company Information',
    group: 'Legal',
    linkUrl: null,
  },
];

async function main() {
  for (const item of termsContent) {
    await prisma.siteContent.upsert({
      where: { key: item.key },
      update: item,
      create: item,
    });
    console.log(`Seeded: ${item.key}`);
  }
  await prisma.$disconnect();
}

main(); 
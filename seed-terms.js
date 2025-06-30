const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedTerms() {
  try {
    const existing = await prisma.siteContent.findUnique({ 
      where: { key: 'terms-and-conditions' } 
    });
    
    if (existing) {
      console.log('Terms and Conditions already exist');
      return;
    }

    const termsContent = `<div class="prose prose-lg max-w-none">
      <h1 class="text-4xl font-bold mb-8">Terms and Conditions</h1>
      
      <h2 class="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
      <p class="mb-4">Welcome to Petsas Car Rental. These terms and conditions outline the rules and regulations for the use of our car rental services operated by Andreas Petsas and Sons Public Ltd.</p>
      
      <h2 class="text-2xl font-semibold mt-8 mb-4">2. Rental Agreement</h2>
      <p class="mb-4">By renting a vehicle from us, you agree to comply with all terms and conditions set forth in this agreement. This agreement becomes effective upon the signing of the rental contract.</p>
      
      <h2 class="text-2xl font-semibold mt-8 mb-4">3. Driver Requirements</h2>
      <ul class="list-disc pl-6 mb-4">
        <li>All drivers must be at least 21 years old</li>
        <li>Must possess a valid driving license for a minimum of 1 year</li>
        <li>International driving permit may be required for non-EU licenses</li>
        <li>Additional drivers must be declared and meet the same requirements</li>
      </ul>
      
      <h2 class="text-2xl font-semibold mt-8 mb-4">4. Vehicle Use</h2>
      <p class="mb-4">The rented vehicle must be used in accordance with traffic laws and regulations of Cyprus. The vehicle may not be used for commercial purposes unless specifically agreed, racing or competitive driving, or transportation of illegal goods.</p>
      
      <h2 class="text-2xl font-semibold mt-8 mb-4">5. Insurance Coverage</h2>
      <p class="mb-4">Comprehensive insurance is included with all rentals of 7 days or more, with unlimited mileage. Our insurance coverage includes Collision Damage Waiver (CDW), Theft Protection, Third Party Liability, and Personal Accident Insurance (available as optional extra).</p>
      
      <h2 class="text-2xl font-semibold mt-8 mb-4">6. Damage and Liability</h2>
      <p class="mb-4">The renter is responsible for any damage to the vehicle during the rental period, including collision damage not covered by insurance, interior damage, lost or damaged keys, and traffic violations and fines.</p>
      
      <h2 class="text-2xl font-semibold mt-8 mb-4">7. Payment Terms</h2>
      <p class="mb-4">Payment can be made by credit card or cash. We offer pay on arrival discount, pay online discount, and flexible payment options for long-term rentals.</p>
      
      <h2 class="text-2xl font-semibold mt-8 mb-4">8. Cancellation Policy</h2>
      <p class="mb-4">Cancellations must be made at least 24 hours before the scheduled pickup time. Late cancellations may incur charges.</p>
      
      <h2 class="text-2xl font-semibold mt-8 mb-4">9. Contact Information</h2>
      <p class="mb-4">For any questions, concerns, or to make a reservation, please contact us at our offices in Nicosia, Limassol, Paphos, Ayia Napa, or at Larnaca and Paphos International Airports.</p>
      
      <p class="mt-8 text-sm text-gray-600">Last updated: ${new Date().toLocaleDateString('en-GB')}</p>
    </div>`;

    await prisma.siteContent.create({
      data: {
        key: 'terms-and-conditions',
        type: 'richtext',
        value: termsContent,
        altText: 'Terms and Conditions',
        group: 'Legal',
        linkUrl: null,
      },
    });

    console.log('Terms and Conditions seeded successfully');
  } catch (error) {
    console.error('Error seeding Terms and Conditions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTerms(); 
 
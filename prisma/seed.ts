import { PrismaClient } from "../app/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");
  
  // Ensure general settings exist with correct invoice counter
  const existingSettings = await prisma.generalSetting.findFirst();
  
  if (!existingSettings) {
    console.log("📋 Creating initial general settings...");
    await prisma.generalSetting.create({
      data: {
        maxRowsPerPage: 500,
        vatPercentage: 19.0,
        payOnArrivalDiscount: 10.0,
        payOnlineDiscount: 15.0,
        nextInvoiceNumber: "1", // Start from 1 for P000001 format
        contactEmail: 'info@petsas.com.cy',
        contactPhone: '+357 22 00 00 00',
        glassmorphismEnabled: true,
        socialFacebook: '',
        socialInstagram: '',
        socialLinkedin: '',
        socialTwitter: '',
      },
    });
    console.log("✅ General settings created successfully");
  } else {
    console.log("📋 General settings already exist");
    console.log(`Current invoice counter: ${existingSettings.nextInvoiceNumber}`);
  }
  
  console.log("🌱 Database seed completed successfully");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
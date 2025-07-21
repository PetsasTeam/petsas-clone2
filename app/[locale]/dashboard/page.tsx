import { PrismaClient } from '../../generated/prisma';
import DashboardClient from './DashboardClient';

const prisma = new PrismaClient();

export default async function DashboardPage() {
  // Get glassmorphism setting
  const generalSettings = await prisma.generalSetting.findFirst();
  const glassmorphismEnabled = generalSettings?.glassmorphismEnabled ?? true;

  return (
    <DashboardClient 
      glassmorphismEnabled={glassmorphismEnabled}
    />
  );
} 
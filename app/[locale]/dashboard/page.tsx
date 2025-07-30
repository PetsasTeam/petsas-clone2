import { prisma } from '../../../lib/prisma';
import DashboardClient from './DashboardClient';



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
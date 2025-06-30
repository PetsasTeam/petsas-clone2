 

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function updateGeneralSettings(formData: FormData) {
  const maxRowsPerPage = parseInt(formData.get('maxRowsPerPage') as string) || 500;
  const vatPercentage = parseFloat(formData.get('vatPercentage') as string) || 19.0;
  const payOnArrivalDiscount = parseFloat(formData.get('payOnArrivalDiscount') as string) || 10.0;
  const payOnlineDiscount = parseFloat(formData.get('payOnlineDiscount') as string) || 15.0;
  const nextInvoiceNumber = formData.get('nextInvoiceNumber') as string || '14312';
  const glassmorphismEnabled = formData.get('glassmorphismEnabled') === 'true';

  // Check if settings exist
  const existingSettings = await prisma.generalSetting.findFirst();

  if (existingSettings) {
    // Update existing settings
    await prisma.generalSetting.update({
      where: { id: existingSettings.id },
      data: {
        maxRowsPerPage,
        vatPercentage,
        payOnArrivalDiscount,
        payOnlineDiscount,
        nextInvoiceNumber,
        glassmorphismEnabled,
      },
    });
  } else {
    // Create new settings
    await prisma.generalSetting.create({
      data: {
        maxRowsPerPage,
        vatPercentage,
        payOnArrivalDiscount,
        payOnlineDiscount,
        nextInvoiceNumber,
        glassmorphismEnabled,
      },
    });
  }

  revalidatePath('/admin/setup/general');
  revalidatePath('/'); // Revalidate homepage to reflect glassmorphism changes
  redirect('/admin/setup/general');
} 
 
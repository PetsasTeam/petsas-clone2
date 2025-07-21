'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function updateGeneralSettings(formData: FormData) {
  const maxRowsPerPage = parseInt(formData.get('maxRowsPerPage') as string) || 500;
  const vatPercentage = parseFloat(formData.get('vatPercentage') as string) || 19.0;
  const payOnArrivalDiscount = parseFloat(formData.get('payOnArrivalDiscount') as string) || 10.0;
  const payOnlineDiscount = parseFloat(formData.get('payOnlineDiscount') as string) || 15.0;
  const nextInvoiceNumber = formData.get('nextInvoiceNumber') as string || '1';
  const nextOrderNumber = formData.get('nextOrderNumber') as string || '1';
  const glassmorphismEnabled = formData.get('glassmorphismEnabled') === 'true';

  // Use upsert to prevent duplicate records due to race conditions
  // First get the existing record ID if it exists
  const existingSettings = await prisma.generalSetting.findFirst();
  
  if (existingSettings) {
    // Update existing record
    await prisma.generalSetting.update({
      where: { id: existingSettings.id },
      data: {
        maxRowsPerPage,
        vatPercentage,
        payOnArrivalDiscount,
        payOnlineDiscount,
        nextInvoiceNumber,
        nextOrderNumber,
        glassmorphismEnabled,
      },
    });
  } else {
    // Create new record only if none exists
    await prisma.generalSetting.create({
      data: {
        maxRowsPerPage,
        vatPercentage,
        payOnArrivalDiscount,
        payOnlineDiscount,
        nextInvoiceNumber,
        nextOrderNumber,
        glassmorphismEnabled,
        contactEmail: 'info@petsas.com.cy',
        contactPhone: '+357 22 00 00 00',
        socialFacebook: '',
        socialInstagram: '',
        socialLinkedin: '',
        socialTwitter: '',
      },
    });
  }

  revalidatePath('/admin/setup/general');
  revalidatePath('/'); // Revalidate homepage to reflect glassmorphism changes
  redirect('/admin/setup/general');
} 
 
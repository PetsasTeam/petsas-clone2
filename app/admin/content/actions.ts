'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createSiteContent(formData: FormData) {
  const key = formData.get('key') as string;
  const type = formData.get('type') as string;
  const value = formData.get('value') as string;
  const altText = formData.get('altText') as string | null;
  const linkUrl = formData.get('linkUrl') as string | null;
  const group = formData.get('group') as string;

  if (!key || !type || !value || !group) {
    throw new Error('Missing required fields for creating site content.');
  }

  await prisma.siteContent.create({
    data: {
      key,
      type,
      value,
      altText,
      linkUrl,
      group,
    },
  });

  revalidatePath('/admin/content');
  redirect('/admin/content');
}

export async function updateSiteContent(formData: FormData) {
  const id = formData.get('id') as string;
  const key = formData.get('key') as string;
  const type = formData.get('type') as string;
  const value = formData.get('value') as string;
  const altText = formData.get('altText') as string | null;
  const linkUrl = formData.get('linkUrl') as string | null;
  const group = formData.get('group') as string;

  if (!id) {
    throw new Error('ID is required for updating site content.');
  }

  await prisma.siteContent.update({
    where: { id },
    data: {
      key,
      type,
      value,
      altText,
      linkUrl,
      group,
    },
  });

  revalidatePath('/admin/content');
  revalidatePath('/'); // Revalidate homepage as well
  redirect('/admin/content');
}
 
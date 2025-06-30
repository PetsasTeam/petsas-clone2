'use server';

import { PrismaClient } from '../../../generated/prisma';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

// Validation schema for promotion data
const PromotionSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  code: z.string().min(1, 'Code is required.'),
  discount: z.coerce.number().min(0, 'Discount must be 0 or greater.').max(100, 'Discount cannot exceed 100%.'),
  startDate: z.coerce.date({ required_error: 'Start date is required.' }),
  endDate: z.coerce.date({ required_error: 'End date is required.' }),
  visible: z.boolean().optional().default(true),
  type: z.string().optional(),
}).refine(data => data.endDate > data.startDate, {
  message: 'End date must be after start date.',
  path: ['endDate'],
});

export type State = {
  errors?: {
    name?: string[];
    code?: string[];
    discount?: string[];
    startDate?: string[];
    endDate?: string[];
    visible?: string[];
    type?: string[];
    general?: string[];
  };
  message?: string | null;
};

// Get promotion by ID
export async function getPromotionById(id: string) {
  try {
    const promotion = await prisma.promotion.findUnique({
      where: { id },
    });
    
    if (!promotion) {
      throw new Error('Promotion not found');
    }
    
    return promotion;
  } catch (error) {
    console.error('Error fetching promotion:', error);
    throw new Error('Failed to fetch promotion');
  }
}

// Create a new promotion
export async function createPromotion(prevState: State, formData: FormData): Promise<State> {
  const validatedFields = PromotionSchema.safeParse({
    name: formData.get('name'),
    code: formData.get('code'),
    discount: formData.get('discount'),
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate'),
    visible: formData.get('visible') === 'on',
    type: formData.get('type'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to create promotion. Please check the fields.',
    };
  }

  const { name, code, discount, startDate, endDate, visible, type } = validatedFields.data;

  // Check if promotion code already exists
  try {
    const existingPromotion = await prisma.promotion.findUnique({
      where: { code },
    });

    if (existingPromotion) {
      return {
        errors: {
          code: ['This promotion code already exists.'],
        },
        message: 'Promotion code must be unique.',
      };
    }

    await prisma.promotion.create({
      data: {
        name,
        code,
        discount,
        startDate,
        endDate,
        visible: visible ?? true,
        type: type || null,
      },
    });
  } catch (error) {
    console.error('Error creating promotion:', error);
    return {
      message: 'Database Error: Failed to create promotion.',
    };
  }

  revalidatePath('/admin/setup/promotions');
  redirect('/admin/setup/promotions');
}

// Update an existing promotion
export async function updatePromotion(id: string, prevState: State, formData: FormData): Promise<State> {
  const validatedFields = PromotionSchema.safeParse({
    name: formData.get('name'),
    code: formData.get('code'),
    discount: formData.get('discount'),
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate'),
    visible: formData.get('visible') === 'on',
    type: formData.get('type'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to update promotion. Please check the fields.',
    };
  }

  const { name, code, discount, startDate, endDate, visible, type } = validatedFields.data;

  // Check if promotion code already exists (excluding current promotion)
  try {
    const existingPromotion = await prisma.promotion.findFirst({
      where: { 
        code,
        id: { not: id }
      },
    });

    if (existingPromotion) {
      return {
        errors: {
          code: ['This promotion code already exists.'],
        },
        message: 'Promotion code must be unique.',
      };
    }

    await prisma.promotion.update({
      where: { id },
      data: {
        name,
        code,
        discount,
        startDate,
        endDate,
        visible: visible ?? true,
        type: type || null,
      },
    });
  } catch (error) {
    console.error('Error updating promotion:', error);
    return {
      message: 'Database Error: Failed to update promotion.',
    };
  }

  revalidatePath('/admin/setup/promotions');
  redirect('/admin/setup/promotions');
}

// Delete a promotion
export async function deletePromotion(id: string) {
  try {
    await prisma.promotion.delete({
      where: { id },
    });
    
    revalidatePath('/admin/setup/promotions');
    return { success: true };
  } catch (error) {
    console.error('Error deleting promotion:', error);
    throw new Error('Failed to delete promotion');
  }
}

// Toggle promotion visibility
export async function togglePromotionVisibility(id: string, visible: boolean) {
  try {
    await prisma.promotion.update({
      where: { id },
      data: { visible },
    });
    
    revalidatePath('/admin/setup/promotions');
    return { success: true };
  } catch (error) {
    console.error('Error toggling promotion visibility:', error);
    throw new Error('Failed to update promotion visibility');
  }
}

// Bulk operations
export async function bulkDeletePromotions(ids: string[]) {
  try {
    await prisma.promotion.deleteMany({
      where: { id: { in: ids } },
    });
    
    revalidatePath('/admin/setup/promotions');
    return { success: true };
  } catch (error) {
    console.error('Error bulk deleting promotions:', error);
    throw new Error('Failed to delete promotions');
  }
}

export async function bulkTogglePromotionVisibility(ids: string[], visible: boolean) {
  try {
    await prisma.promotion.updateMany({
      where: { id: { in: ids } },
      data: { visible },
    });
    
    revalidatePath('/admin/setup/promotions');
    return { success: true };
  } catch (error) {
    console.error('Error bulk toggling promotion visibility:', error);
    throw new Error('Failed to update promotion visibility');
  }
} 
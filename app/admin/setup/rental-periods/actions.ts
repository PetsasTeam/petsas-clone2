"use server";

import { PrismaClient } from '../../../generated/prisma';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

const PeriodSchemaBase = z.object({
  name: z.string().min(1, 'Name is required.'),
  startDate: z.coerce.date({ required_error: 'Start date is required.' }),
  endDate: z.coerce.date({ required_error: 'End date is required.' }),
  type: z.string().optional(),
  copyFromId: z.string().optional(),
});

export async function getAllSeasons() {
  try {
    const seasons = await prisma.season.findMany({
      orderBy: {
        startDate: 'desc',
      },
      include: {
        seasonalPricings: true,
      },
    });
    return seasons;
  } catch (error) {
    console.error('Error fetching seasons:', error);
    return [];
  }
}

export async function getSeasonById(id: string) {
  try {
    const season = await prisma.season.findUnique({
      where: { id },
      include: {
        seasonalPricings: true,
      },
    });
    return season;
  } catch (error) {
    console.error('Error fetching season:', error);
    return null;
  }
}

const CreatePeriodSchema = PeriodSchemaBase.refine(data => data.endDate > data.startDate, {
  message: 'End date must be after start date.',
  path: ['endDate'],
});

const UpdatePeriodSchema = PeriodSchemaBase.refine(data => data.endDate > data.startDate, {
    message: 'End date must be after start date.',
    path: ['endDate'],
});

export type State = {
  errors?: {
    name?: string[];
    startDate?: string[];
    endDate?: string[];
    overlap?: string[];
    copyFromId?: string[];
  };
  message?: string | null;
};

export async function createRentalPeriod(prevState: State, formData: FormData) {
  const validatedFields = CreatePeriodSchema.safeParse({
    name: formData.get('name'),
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate'),
    type: formData.get('type'),
    copyFromId: formData.get('copyFromId'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to create period. Please check the fields.',
    };
  }

  const { name, startDate, endDate, type, copyFromId } = validatedFields.data;

  const overlappingPeriod = await prisma.season.findFirst({
    where: {
      startDate: { lte: endDate },
      endDate: { gte: startDate },
    },
  });

  if (overlappingPeriod) {
    return {
      errors: {
        overlap: [`This period overlaps with an existing period: "${overlappingPeriod.name}" (${overlappingPeriod.startDate.toLocaleDateString()} - ${overlappingPeriod.endDate.toLocaleDateString()})`],
      },
      message: 'Date range overlaps with an existing period.',
    }
  }

  try {
    // Create the new season
    const newSeason = await prisma.season.create({
      data: {
        name,
        startDate,
        endDate,
        type: type || null,
      },
    });

    // If copying from an existing season, copy the pricing data
    if (copyFromId) {
      const sourceSeasonPricing = await prisma.seasonalPricing.findMany({
        where: {
          seasonId: copyFromId,
        },
      });

      if (sourceSeasonPricing.length > 0) {
        await prisma.seasonalPricing.createMany({
          data: sourceSeasonPricing.map(pricing => ({
            categoryId: pricing.categoryId,
            seasonId: newSeason.id,
            group: pricing.group,
            price3to6Days: pricing.price3to6Days,
            price7to14Days: pricing.price7to14Days,
            price15PlusDays: pricing.price15PlusDays,
          })),
        });
      }
    }
  } catch (e) {
    console.error(e);
    return { message: 'Database Error: Failed to create rental period.' };
  }

  revalidatePath('/admin/setup/rental-periods');
  redirect('/admin/setup/rental-periods');
}

export async function updateRentalPeriod(id: string, prevState: State, formData: FormData) {
    const validatedFields = UpdatePeriodSchema.safeParse({
      name: formData.get('name'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      type: formData.get('type'),
    });
  
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Failed to update period. Please check the fields.',
      };
    }
    
    const { name, startDate, endDate, type } = validatedFields.data;
  
    const overlappingPeriod = await prisma.season.findFirst({
      where: {
        id: { not: id },
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
    });
  
    if (overlappingPeriod) {
      return {
          errors: {
              overlap: [`This period overlaps with an existing period: "${overlappingPeriod.name}" (${overlappingPeriod.startDate.toLocaleDateString()} - ${overlappingPeriod.endDate.toLocaleDateString()})`],
          },
          message: 'Date range overlaps with an existing period.',
      }
    }
  
    try {
      await prisma.season.update({
        where: { id },
        data: {
          name,
          startDate,
          endDate,
          type: type || null,
        },
      });
    }
    catch (e) {
      return { message: 'Database Error: Failed to update rental period.' };
    }
  
    revalidatePath('/admin/setup/rental-periods');
    redirect('/admin/setup/rental-periods');
}

export async function deleteRentalPeriod(id: string) {
  try {
    // First, delete all associated pricing records
    await prisma.seasonalPricing.deleteMany({
      where: { seasonId: id },
    });
    // Then, delete the season itself
    await prisma.season.delete({
      where: { id },
    });
  } catch (e) {
    console.error(e)
    throw new Error('Database Error: Failed to delete rental period.');
  }
  revalidatePath('/admin/setup/rental-periods');
  redirect('/admin/setup/rental-periods');
}
  
export async function updatePricing(formData: FormData) {
    const rates: { id: string; price3to6Days: number; price7to14Days: number; price15PlusDays: number }[] = [];
    
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('price-')) {
        const [, id, rateType] = key.split('-');
        const price = Number(value);
        
        let rate = rates.find(r => r.id === id);
        if (!rate) {
          rate = { id, price3to6Days: 0, price7to14Days: 0, price15PlusDays: 0 };
          rates.push(rate);
        }
  
        if (rateType === '3to6') {
          rate.price3to6Days = price;
        } else if (rateType === '7to14') {
          rate.price7to14Days = price;
        } else if (rateType === '15plus') {
          rate.price15PlusDays = price;
        }
      }
    }
  
    try {
      await prisma.$transaction(
        rates.map(rate => 
          prisma.seasonalPricing.update({
            where: { id: rate.id },
            data: {
              price3to6Days: rate.price3to6Days,
              price7to14Days: rate.price7to14Days,
              price15PlusDays: rate.price15PlusDays,
            },
          })
        )
      );
      revalidatePath('/admin/setup/rental-periods');
      return { message: 'Pricing updated successfully.' };
    } catch (e) {
      console.error(e);
      return { message: 'Database Error: Failed to update pricing.' };
    }
}
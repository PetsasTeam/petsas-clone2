'use server';

import { PrismaClient } from '../../../generated/prisma';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

// Types for the rental option data
interface RentalOptionData {
  code: string;
  name: string;
  displayOrder: number;
  visible: boolean;
  maxQty: number;
  priceType: string;
  maxCost?: number | null;
  freeOverDays?: number | null;
  photo?: string | null;
  description?: string | null;
}

interface PricingTierData {
  vehicleGroups: string;
  price: number;
}

// Get all rental options with their pricing tiers
export async function getRentalOptions() {
  try {
    const rentalOptions = await prisma.rentalOption.findMany({
      include: {
        pricingTiers: {
          orderBy: { price: 'asc' }
        }
      },
      orderBy: { displayOrder: 'asc' }
    });
    return { success: true, data: rentalOptions };
  } catch (error) {
    console.error('Error fetching rental options:', error);
    return { success: false, error: 'Failed to fetch rental options' };
  }
}

// Get a single rental option by ID
export async function getRentalOption(id: string) {
  try {
    const rentalOption = await prisma.rentalOption.findUnique({
      where: { id },
      include: {
        pricingTiers: {
          orderBy: { price: 'asc' }
        }
      }
    });
    
    if (!rentalOption) {
      return { success: false, error: 'Rental option not found' };
    }
    
    return { success: true, data: rentalOption };
  } catch (error) {
    console.error('Error fetching rental option:', error);
    return { success: false, error: 'Failed to fetch rental option' };
  }
}

// Create a new rental option
export async function createRentalOption(data: RentalOptionData, pricingTiers: PricingTierData[]) {
  try {
    const rentalOption = await prisma.rentalOption.create({
      data: {
        ...data,
        pricingTiers: {
          create: pricingTiers
        }
      },
      include: {
        pricingTiers: true
      }
    });
    
    revalidatePath('/admin/setup/rental-options');
    return { success: true, data: rentalOption };
  } catch (error) {
    console.error('Error creating rental option:', error);
    return { success: false, error: 'Failed to create rental option' };
  }
}

// Update a rental option
export async function updateRentalOption(id: string, data: RentalOptionData, pricingTiers: PricingTierData[]) {
  try {
    // Update the rental option and replace pricing tiers
    const rentalOption = await prisma.$transaction(async (tx) => {
      // Delete existing pricing tiers
      await tx.rentalOptionPricing.deleteMany({
        where: { rentalOptionId: id }
      });
      
      // Update the rental option with new pricing tiers
      return await tx.rentalOption.update({
        where: { id },
        data: {
          ...data,
          pricingTiers: {
            create: pricingTiers
          }
        },
        include: {
          pricingTiers: true
        }
      });
    });
    
    revalidatePath('/admin/setup/rental-options');
    revalidatePath(`/admin/setup/rental-options/${id}`);
    return { success: true, data: rentalOption };
  } catch (error) {
    console.error('Error updating rental option:', error);
    return { success: false, error: 'Failed to update rental option' };
  }
}

// Delete a rental option
export async function deleteRentalOption(id: string) {
  try {
    await prisma.rentalOption.delete({
      where: { id }
    });
    
    revalidatePath('/admin/setup/rental-options');
    return { success: true };
  } catch (error) {
    console.error('Error deleting rental option:', error);
    return { success: false, error: 'Failed to delete rental option' };
  }
}

// Toggle visibility of a rental option
export async function toggleRentalOptionVisibility(id: string, visible: boolean) {
  try {
    await prisma.rentalOption.update({
      where: { id },
      data: { visible }
    });
    
    revalidatePath('/admin/setup/rental-options');
    return { success: true };
  } catch (error) {
    console.error('Error toggling visibility:', error);
    return { success: false, error: 'Failed to toggle visibility' };
  }
}

// Bulk operations
export async function bulkDeleteRentalOptions(ids: string[]) {
  try {
    await prisma.rentalOption.deleteMany({
      where: { id: { in: ids } }
    });
    
    revalidatePath('/admin/setup/rental-options');
    return { success: true };
  } catch (error) {
    console.error('Error bulk deleting rental options:', error);
    return { success: false, error: 'Failed to delete rental options' };
  }
}

export async function bulkToggleVisibility(ids: string[], visible: boolean) {
  try {
    await prisma.rentalOption.updateMany({
      where: { id: { in: ids } },
      data: { visible }
    });
    
    revalidatePath('/admin/setup/rental-options');
    return { success: true };
  } catch (error) {
    console.error('Error bulk toggling visibility:', error);
    return { success: false, error: 'Failed to update visibility' };
  }
}

// Update display order
export async function updateRentalOptionOrder(id: string, direction: 'up' | 'down') {
  try {
    const optionToMove = await prisma.rentalOption.findUnique({ where: { id } });
    if (!optionToMove) throw new Error('Rental option not found');

    const currentOrder = optionToMove.displayOrder;
    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;

    // Find the option that's currently in the target position
    const otherOption = await prisma.rentalOption.findFirst({ 
      where: { displayOrder: newOrder } 
    });

    await prisma.$transaction(async (tx) => {
      // Move the other option out of the way
      if (otherOption) {
        await tx.rentalOption.update({
          where: { id: otherOption.id },
          data: { displayOrder: currentOrder },
        });
      }
      
      // Move the selected option to the new position
      await tx.rentalOption.update({
        where: { id: optionToMove.id },
        data: { displayOrder: newOrder },
      });
    });

    revalidatePath('/admin/setup/rental-options');
    return { success: true };
  } catch (error) {
    console.error('Error updating display order:', error);
    return { success: false, error: 'Failed to update display order' };
  }
} 
'use server';

import { PrismaClient } from '../../../generated/prisma';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

interface CategoryUpdateData {
  name: string;
  displayOrder: number;
  visible: boolean;
}

export async function updateCategory(id: string, data: CategoryUpdateData) {
  try {
    await prisma.vehicleCategory.update({
      where: { id },
      data: {
        name: data.name,
        displayOrder: data.displayOrder,
        visible: data.visible,
      },
    });
    revalidatePath(`/admin/setup/vehicle-categories`);
    revalidatePath(`/admin/setup/vehicle-categories/${id}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to update category.' };
  }
}

export async function deleteCategory(id: string) {
  try {
    await prisma.vehicleCategory.delete({
      where: { id },
    });
    revalidatePath('/admin/setup/vehicle-categories');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete category.' };
  }
}

export async function toggleCategoryVisibility(id: string, visible: boolean) {
  try {
    await prisma.vehicleCategory.update({
      where: { id },
      data: { visible },
    });
    revalidatePath('/admin/setup/vehicle-categories');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to toggle visibility.' };
  }
}

export async function updateCategoryOrder(id: string, direction: 'up' | 'down') {
  // This is a simplified implementation. A real-world scenario might be more complex
  // to handle edge cases and race conditions.
  try {
    const categoryToMove = await prisma.vehicleCategory.findUnique({ where: { id } });
    if (!categoryToMove) throw new Error('Category not found');

    const currentOrder = categoryToMove.displayOrder;
    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;

    // Find the category that's currently in the target position
    const otherCategory = await prisma.vehicleCategory.findFirst({ where: { displayOrder: newOrder } });

    await prisma.$transaction(async (tx) => {
      // Move the other category out of the way
      if (otherCategory) {
        await tx.vehicleCategory.update({
          where: { id: otherCategory.id },
          data: { displayOrder: currentOrder },
        });
      }
      
      // Move the selected category to the new position
      await tx.vehicleCategory.update({
        where: { id: categoryToMove.id },
        data: { displayOrder: newOrder },
      });
    });

    revalidatePath('/admin/setup/vehicle-categories');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to update display order.' };
  }
}

export async function deleteVehicle(id: string) {
  try {
    const vehicle = await prisma.vehicle.findUnique({ where: { id }});
    if (!vehicle) throw new Error('Vehicle not found');

    await prisma.vehicle.delete({
      where: { id },
    });
    // Revalidate the specific category page
    revalidatePath(`/admin/setup/vehicle-categories/${vehicle.categoryId}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to delete vehicle.' };
  }
}

export async function deleteBooking(id: string) {
  try {
    await prisma.booking.delete({
      where: { id },
    });
    revalidatePath('/admin/bookings');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to delete booking.' };
  }
}

export async function updateVehicle(id: string, categoryId: string, data: { 
  name: string; 
  group: string; 
  visible: boolean;
  engineSize: string;
  doors: number;
  seats: number;
  transmission: string;
  hasAC: boolean;
  adults: number;
  children: number;
  bigLuggages: number;
  smallLuggages: number;
}) {
  try {
    await prisma.vehicle.update({
      where: { id },
      data: {
        name: data.name,
        group: data.group,
        visible: data.visible,
        engineSize: data.engineSize,
        doors: data.doors,
        seats: data.seats,
        transmission: data.transmission,
        hasAC: data.hasAC,
        adults: data.adults,
        children: data.children,
        bigLuggages: data.bigLuggages,
        smallLuggages: data.smallLuggages,
      }
    });
    // Removed revalidatePath to allow frontend state management
    // revalidatePath(`/admin/setup/vehicle-categories/${categoryId}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to update vehicle details.' };
  }
}

export async function createVehicle(categoryId: string, data: { 
  name: string; 
  group: string; 
  visible: boolean;
  engineSize: string;
  doors: number;
  seats: number;
  transmission: string;
  hasAC: boolean;
  adults: number;
  children: number;
  bigLuggages: number;
  smallLuggages: number;
}) {
  try {
    const newVehicle = await prisma.vehicle.create({
      data: {
        name: data.name,
        group: data.group,
        code: data.group, // Use group as code for now
        visible: data.visible,
        categoryId: categoryId,
        image: '/vehicles/vehicle-placeholder.jpg', // Default placeholder image
        engineSize: data.engineSize,
        doors: data.doors,
        seats: data.seats,
        transmission: data.transmission,
        hasAC: data.hasAC,
        adults: data.adults,
        children: data.children,
        bigLuggages: data.bigLuggages,
        smallLuggages: data.smallLuggages,
      }
    });
    return { success: true, vehicle: newVehicle };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to create vehicle.' };
  }
} 
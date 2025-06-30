'use server';

import { PrismaClient } from '../../../generated/prisma';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export interface Location {
  id: string;
  name: string;
  type: string;
  displayOrder: number;
  visible: boolean;
  address?: string | null;
  city?: string | null;
  postcode?: string | null;
  country?: string | null;
  phone?: string | null;
  email?: string | null;
  openingHours?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  instructions?: string | null;
  facilities?: string | null;
  isPickupPoint: boolean;
  isDropoffPoint: boolean;
  hasDelivery: boolean;
  deliveryRadius?: number | null;
  deliveryFee?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLocationData {
  name: string;
  type: string;
  displayOrder?: number;
  visible?: boolean;
  address?: string;
  city?: string;
  postcode?: string;
  country?: string;
  phone?: string;
  email?: string;
  openingHours?: string;
  latitude?: number;
  longitude?: number;
  instructions?: string;
  facilities?: string;
  isPickupPoint?: boolean;
  isDropoffPoint?: boolean;
  hasDelivery?: boolean;
  deliveryRadius?: number;
  deliveryFee?: number;
}

export interface UpdateLocationData extends Partial<CreateLocationData> {
  id: string;
}

// Get all locations
export async function getLocations(): Promise<Location[]> {
  try {
    const locations = await prisma.location.findMany({
      orderBy: { displayOrder: 'asc' }
    });
    return locations;
  } catch (error) {
    console.error('Error fetching locations:', error);
    throw new Error('Failed to fetch locations');
  }
}

// Get a single location by ID
export async function getLocation(id: string): Promise<Location | null> {
  try {
    const location = await prisma.location.findUnique({
      where: { id }
    });
    return location;
  } catch (error) {
    console.error('Error fetching location:', error);
    throw new Error('Failed to fetch location');
  }
}

// Get visible locations for frontend (pickup/dropoff options)
export async function getVisibleLocations(): Promise<Location[]> {
  try {
    const locations = await prisma.location.findMany({
      where: { visible: true },
      orderBy: { displayOrder: 'asc' }
    });
    return locations;
  } catch (error) {
    console.error('Error fetching visible locations:', error);
    throw new Error('Failed to fetch visible locations');
  }
}

// Get pickup locations
export async function getPickupLocations(): Promise<Location[]> {
  try {
    const locations = await prisma.location.findMany({
      where: { 
        visible: true,
        isPickupPoint: true 
      },
      orderBy: { displayOrder: 'asc' }
    });
    return locations;
  } catch (error) {
    console.error('Error fetching pickup locations:', error);
    throw new Error('Failed to fetch pickup locations');
  }
}

// Get dropoff locations
export async function getDropoffLocations(): Promise<Location[]> {
  try {
    const locations = await prisma.location.findMany({
      where: { 
        visible: true,
        isDropoffPoint: true 
      },
      orderBy: { displayOrder: 'asc' }
    });
    return locations;
  } catch (error) {
    console.error('Error fetching dropoff locations:', error);
    throw new Error('Failed to fetch dropoff locations');
  }
}

// Create a new location
export async function createLocation(data: CreateLocationData): Promise<Location> {
  try {
    // Get the next display order
    const maxOrder = await prisma.location.aggregate({
      _max: { displayOrder: true }
    });
    
    const nextOrder = (maxOrder._max.displayOrder || 0) + 1;

    const location = await prisma.location.create({
      data: {
        ...data,
        displayOrder: data.displayOrder ?? nextOrder,
        visible: data.visible ?? true,
        isPickupPoint: data.isPickupPoint ?? true,
        isDropoffPoint: data.isDropoffPoint ?? true,
        hasDelivery: data.hasDelivery ?? false,
      }
    });

    revalidatePath('/admin/setup/locations');
    return location;
  } catch (error) {
    console.error('Error creating location:', error);
    throw new Error('Failed to create location');
  }
}

// Update a location
export async function updateLocation(data: UpdateLocationData): Promise<Location> {
  try {
    const { id, ...updateData } = data;
    
    const location = await prisma.location.update({
      where: { id },
      data: updateData
    });

    revalidatePath('/admin/setup/locations');
    return location;
  } catch (error) {
    console.error('Error updating location:', error);
    throw new Error('Failed to update location');
  }
}

// Delete a location
export async function deleteLocation(id: string): Promise<void> {
  try {
    await prisma.location.delete({
      where: { id }
    });

    revalidatePath('/admin/setup/locations');
  } catch (error) {
    console.error('Error deleting location:', error);
    throw new Error('Failed to delete location');
  }
}

// Bulk delete locations
export async function bulkDeleteLocations(ids: string[]): Promise<void> {
  try {
    await prisma.location.deleteMany({
      where: {
        id: { in: ids }
      }
    });

    revalidatePath('/admin/setup/locations');
  } catch (error) {
    console.error('Error bulk deleting locations:', error);
    throw new Error('Failed to delete locations');
  }
}

// Toggle location visibility
export async function toggleLocationVisibility(id: string): Promise<Location> {
  try {
    const location = await prisma.location.findUnique({
      where: { id }
    });

    if (!location) {
      throw new Error('Location not found');
    }

    const updatedLocation = await prisma.location.update({
      where: { id },
      data: { visible: !location.visible }
    });

    revalidatePath('/admin/setup/locations');
    return updatedLocation;
  } catch (error) {
    console.error('Error toggling location visibility:', error);
    throw new Error('Failed to toggle location visibility');
  }
}

// Bulk toggle visibility
export async function bulkToggleVisibility(ids: string[], visible: boolean): Promise<void> {
  try {
    await prisma.location.updateMany({
      where: {
        id: { in: ids }
      },
      data: { visible }
    });

    revalidatePath('/admin/setup/locations');
  } catch (error) {
    console.error('Error bulk toggling visibility:', error);
    throw new Error('Failed to toggle visibility');
  }
}

// Update location display order
export async function updateLocationOrder(id: string, newOrder: number): Promise<Location> {
  try {
    const location = await prisma.location.update({
      where: { id },
      data: { displayOrder: newOrder }
    });

    revalidatePath('/admin/setup/locations');
    return location;
  } catch (error) {
    console.error('Error updating location order:', error);
    throw new Error('Failed to update location order');
  }
}

// Move location up in display order
export async function moveLocationUp(id: string): Promise<void> {
  try {
    const location = await prisma.location.findUnique({
      where: { id }
    });

    if (!location) {
      throw new Error('Location not found');
    }

    // Find the location with the previous display order
    const previousLocation = await prisma.location.findFirst({
      where: {
        displayOrder: { lt: location.displayOrder }
      },
      orderBy: { displayOrder: 'desc' }
    });

    if (previousLocation) {
      // Swap display orders
      await prisma.$transaction([
        prisma.location.update({
          where: { id: location.id },
          data: { displayOrder: previousLocation.displayOrder }
        }),
        prisma.location.update({
          where: { id: previousLocation.id },
          data: { displayOrder: location.displayOrder }
        })
      ]);
    }

    revalidatePath('/admin/setup/locations');
  } catch (error) {
    console.error('Error moving location up:', error);
    throw new Error('Failed to move location up');
  }
}

// Move location down in display order
export async function moveLocationDown(id: string): Promise<void> {
  try {
    const location = await prisma.location.findUnique({
      where: { id }
    });

    if (!location) {
      throw new Error('Location not found');
    }

    // Find the location with the next display order
    const nextLocation = await prisma.location.findFirst({
      where: {
        displayOrder: { gt: location.displayOrder }
      },
      orderBy: { displayOrder: 'asc' }
    });

    if (nextLocation) {
      // Swap display orders
      await prisma.$transaction([
        prisma.location.update({
          where: { id: location.id },
          data: { displayOrder: nextLocation.displayOrder }
        }),
        prisma.location.update({
          where: { id: nextLocation.id },
          data: { displayOrder: location.displayOrder }
        })
      ]);
    }

    revalidatePath('/admin/setup/locations');
  } catch (error) {
    console.error('Error moving location down:', error);
    throw new Error('Failed to move location down');
  }
} 
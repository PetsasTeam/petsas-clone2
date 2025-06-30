'use server';

import { PrismaClient } from '../../generated/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const prisma = new PrismaClient();

const CreateCustomerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
});

export type State = {
  errors?: {
    firstName?: string[];
    lastName?: string[];
    email?: string[];
    phone?: string[];
  };
  message?: string | null;
};

export async function createCustomer(prevState: State, formData: FormData) {
  const validatedFields = CreateCustomerSchema.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
    phone: formData.get('phone'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to create customer. Please check the fields.',
    };
  }

  const { firstName, lastName, email, phone } = validatedFields.data;

  // Check if email already exists
  const existingCustomer = await prisma.customer.findUnique({
    where: { email },
  });

  if (existingCustomer) {
    return {
      errors: {
        email: ['Email already exists'],
      },
      message: 'Customer email must be unique.',
    };
  }

  try {
    await prisma.customer.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
      },
    });
  } catch (e) {
    console.error(e);
    return { message: 'Database Error: Failed to create customer.' };
  }

  revalidatePath('/admin/customers');
  redirect('/admin/customers');
}

export async function updateCustomer(id: string, prevState: State, formData: FormData) {
  const validatedFields = CreateCustomerSchema.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
    phone: formData.get('phone'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to update customer. Please check the fields.',
    };
  }

  const { firstName, lastName, email, phone } = validatedFields.data;

  // Check if email already exists for other customers
  const existingCustomer = await prisma.customer.findFirst({
    where: { 
      email,
      NOT: { id }
    },
  });

  if (existingCustomer) {
    return {
      errors: {
        email: ['Email already exists'],
      },
      message: 'Customer email must be unique.',
    };
  }

  try {
    await prisma.customer.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        phone,
      },
    });
  } catch (e) {
    console.error(e);
    return { message: 'Database Error: Failed to update customer.' };
  }

  revalidatePath('/admin/customers');
  redirect('/admin/customers');
}

export async function deleteCustomer(id: string) {
  try {
    // First check if customer has any bookings
    const bookingsCount = await prisma.booking.count({
      where: { customerId: id },
    });

    if (bookingsCount > 0) {
      throw new Error(`Cannot delete customer with ${bookingsCount} existing bookings`);
    }

    await prisma.customer.delete({
      where: { id },
    });
  } catch (e) {
    console.error(e);
    throw new Error('Database Error: Failed to delete customer.');
  }
  revalidatePath('/admin/customers');
} 
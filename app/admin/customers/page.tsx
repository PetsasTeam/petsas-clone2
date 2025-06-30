import React from 'react';
import { PrismaClient } from '../../generated/prisma';
import CustomersClient from './CustomersClient';

const prisma = new PrismaClient();

async function getCustomers() {
  const customers = await prisma.customer.findMany({
    include: {
      bookings: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return customers;
}

async function getCustomerStats() {
  const totalCustomers = await prisma.customer.count();
  const customersWithBookings = await prisma.customer.count({
    where: {
      bookings: {
        some: {},
      },
    },
  });
  const recentCustomers = await prisma.customer.count({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      },
    },
  });

  return {
    total: totalCustomers,
    withBookings: customersWithBookings,
    recent: recentCustomers,
  };
}

export default async function CustomersPage() {
  const customers = await getCustomers();
  const stats = await getCustomerStats();

  return <CustomersClient customers={customers} stats={stats} />;
} 
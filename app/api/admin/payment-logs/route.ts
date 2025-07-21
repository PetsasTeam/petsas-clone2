import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const paymentType = searchParams.get('paymentType');
    const dateRange = searchParams.get('dateRange');

    // Build filter conditions
    const where: any = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (paymentType && paymentType !== 'all') {
      where.paymentType = paymentType;
    }

    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (dateRange) {
        case '1d':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0); // All time
      }

      where.createdAt = {
        gte: startDate,
      };
    }

    // Fetch payment logs with related booking data
    const logs = await prisma.paymentLog.findMany({
      where,
      include: {
        booking: {
          include: {
            customer: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100, // Limit to last 100 records for performance
    });

    // Calculate statistics
    const stats = await prisma.paymentLog.aggregate({
      where,
      _count: {
        id: true,
      },
    });

    const successfulCount = await prisma.paymentLog.count({
      where: {
        ...where,
        status: 'success',
      },
    });

    const failedCount = await prisma.paymentLog.count({
      where: {
        ...where,
        status: 'failed',
      },
    });

    const total = stats._count.id;
    const successful = successfulCount;
    const failed = failedCount;
    const successRate = total > 0 ? Math.round((successful / total) * 100) : 0;

    return NextResponse.json({
      logs,
      stats: {
        total,
        successful,
        failed,
        successRate,
      },
    });

  } catch (error) {
    console.error('Failed to fetch payment logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment logs' },
      { status: 500 }
    );
  }
} 
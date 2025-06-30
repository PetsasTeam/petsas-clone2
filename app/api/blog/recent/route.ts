import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      where: {
        published: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 3,
      select: {
        id: true,
        slug: true,
        title: true,
        content: true,
        summary: true,
        imageUrl: true,
        published: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Failed to fetch recent posts:', error);
    return NextResponse.json([], { status: 500 });
  }
}

 
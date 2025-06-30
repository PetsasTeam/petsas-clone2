'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { writeFile } from 'fs/promises';
import { join } from 'path';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// Function to estimate reading time
function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

async function handleImageUpload(imageFile: File): Promise<string> {
  if (!imageFile || imageFile.size === 0) {
    throw new Error('No image file provided');
  }

  // Create unique filename
  const timestamp = Date.now();
  const extension = imageFile.name.split('.').pop();
  const filename = `blog_${timestamp}.${extension}`;
  
  // Save to public/content directory
  const bytes = await imageFile.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const path = join(process.cwd(), 'public', 'content', filename);
  
  await writeFile(path, buffer);
  return `/content/${filename}`;
}

export async function createPost(formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const titleRu = formData.get('titleRu') as string;
    const slug = formData.get('slug') as string;
    const slugRu = formData.get('slugRu') as string;
    const summary = formData.get('summary') as string;
    const summaryRu = formData.get('summaryRu') as string;
    const content = formData.get('content') as string;
    const contentRu = formData.get('contentRu') as string;
    const published = formData.get('published') === 'true';
    const publishedRu = formData.get('publishedRu') === 'true';
    const category = formData.get('category') as string;
    const featured = formData.get('featured') === 'true';
    const imageFile = formData.get('image') as File;
    const createdAt = formData.get('createdAt') as string;

    // Handle image upload if provided
    let imageUrl: string | null = null;
    if (imageFile && imageFile.size > 0) {
      imageUrl = await handleImageUpload(imageFile);
    }

    // Calculate reading time
    const readTime = estimateReadingTime(content);

    // Ensure English slug is unique
    let finalSlug = slug || slugify(title);
    const existingPost = await prisma.post.findUnique({ where: { slug: finalSlug } });
    if (existingPost) {
      finalSlug = `${finalSlug}-${Math.random().toString(36).substring(2, 7)}`;
    }

    // Ensure Russian slug is unique (if provided)
    let finalSlugRu: string | null = null;
    if (slugRu) {
      finalSlugRu = slugRu;
      const existingPostRu = await prisma.post.findUnique({ where: { slugRu: finalSlugRu } });
      if (existingPostRu) {
        finalSlugRu = `${finalSlugRu}-${Math.random().toString(36).substring(2, 7)}`;
      }
    }

    await prisma.post.create({
      data: {
        title,
        titleRu: titleRu || null,
        slug: finalSlug,
        slugRu: finalSlugRu,
        summary: summary || null,
        summaryRu: summaryRu || null,
        content,
        contentRu: contentRu || null,
        imageUrl,
        published,
        publishedRu,
        category: category || null,
        featured,
        readTime,
        createdAt: createdAt ? new Date(createdAt) : new Date(),
      },
    });

    revalidatePath('/admin/blog');
    revalidatePath('/blog');
    revalidatePath('/ru/blog');
    
    return { success: true };
  } catch (error) {
    console.error('Create post error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create post' };
  }
}

export async function updatePost(formData: FormData) {
  try {
    const id = formData.get('id') as string;
    const title = formData.get('title') as string;
    const titleRu = formData.get('titleRu') as string;
    const slug = formData.get('slug') as string;
    const slugRu = formData.get('slugRu') as string;
    const summary = formData.get('summary') as string;
    const summaryRu = formData.get('summaryRu') as string;
    const content = formData.get('content') as string;
    const contentRu = formData.get('contentRu') as string;
    const published = formData.get('published') === 'true';
    const publishedRu = formData.get('publishedRu') === 'true';
    const category = formData.get('category') as string;
    const featured = formData.get('featured') === 'true';
    const imageFile = formData.get('image') as File;
    const createdAt = formData.get('createdAt') as string;

    if (!id) {
      return { success: false, error: 'Post ID is required for updating.' };
    }

    // Get current post to preserve existing image if no new image uploaded
    const currentPost = await prisma.post.findUnique({ where: { id } });
    if (!currentPost) {
      return { success: false, error: 'Post not found.' };
    }

    // Handle image upload if provided
    let imageUrl = currentPost.imageUrl;
    if (imageFile && imageFile.size > 0) {
      imageUrl = await handleImageUpload(imageFile);
    }

    // Calculate reading time
    const readTime = estimateReadingTime(content);

    // Ensure English slug is unique (excluding current post)
    let finalSlug = slug || slugify(title);
    const existingPost = await prisma.post.findFirst({ 
      where: { 
        slug: finalSlug,
        id: { not: id }
      } 
    });
    if (existingPost) {
      finalSlug = `${finalSlug}-${Math.random().toString(36).substring(2, 7)}`;
    }

    // Ensure Russian slug is unique (excluding current post)
    let finalSlugRu: string | null = null;
    if (slugRu) {
      finalSlugRu = slugRu;
      const existingPostRu = await prisma.post.findFirst({ 
        where: { 
          slugRu: finalSlugRu,
          id: { not: id }
        } 
      });
      if (existingPostRu) {
        finalSlugRu = `${finalSlugRu}-${Math.random().toString(36).substring(2, 7)}`;
      }
    }

    await prisma.post.update({
      where: { id },
      data: {
        title,
        titleRu: titleRu || null,
        slug: finalSlug,
        slugRu: finalSlugRu,
        summary: summary || null,
        summaryRu: summaryRu || null,
        content,
        contentRu: contentRu || null,
        imageUrl,
        published,
        publishedRu,
        category: category || null,
        featured,
        readTime,
        createdAt: createdAt ? new Date(createdAt) : undefined,
      },
    });

    revalidatePath('/admin/blog');
    revalidatePath(`/admin/blog/${id}/edit`);
    revalidatePath('/blog');
    revalidatePath('/ru/blog');
    
    return { success: true };
  } catch (error) {
    console.error('Update post error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update post' };
  }
} 
 
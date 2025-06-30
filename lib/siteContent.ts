import { prisma } from './prisma';

export async function getSiteContent(key: string) {
  try {
    const content = await prisma.siteContent.findUnique({
      where: { key },
    });
    return content?.value || null;
  } catch (error) {
    console.error(`Failed to fetch site content for key: ${key}`, error);
    return null;
  }
}

export async function getSiteContentByGroup(group: string) {
  try {
    const content = await prisma.siteContent.findMany({
      where: { group },
      orderBy: { key: 'asc' },
    });
    return content;
  } catch (error) {
    console.error(`Failed to fetch site content for group: ${group}`, error);
    return [];
  }
}

export async function getAllSiteContent() {
  try {
    const content = await prisma.siteContent.findMany({
      orderBy: { group: 'asc' },
    });
    return content;
  } catch (error) {
    console.error('Failed to fetch all site content', error);
    return [];
  }
} 
 
import { prisma } from '@/lib/prisma';
import SiteContentClient from './SiteContentClient';

async function getContent() {
  return prisma.siteContent.findMany({
    orderBy: {
      group: 'asc',
    },
  });
}

export default async function SiteContentPage() {
  const contentItems = await getContent();

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <SiteContentClient contentItems={contentItems} />
    </div>
  );
} 
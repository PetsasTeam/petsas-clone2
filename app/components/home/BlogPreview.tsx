'use client';

import { useLocale } from 'next-intl';
import BlogPreviewClient from './BlogPreviewClient';

export default function BlogPreview() {
  const locale = useLocale();
  return <BlogPreviewClient locale={locale} />;
} 
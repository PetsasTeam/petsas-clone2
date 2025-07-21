import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
import { Pathnames } from 'next-intl/navigation';

export const locales = ['en', 'ru'];

export const pathnames = {
  '/': '/',
  '/about': '/about',
  '/contact': '/contact',
  '/blog': '/blog',
  '/locations': '/locations',
  '/leasing': '/leasing',
  '/vehicle-guide': '/vehicle-guide',
  '/login': '/login',
  '/register': '/register',
  '/dashboard': '/dashboard',
} satisfies Pathnames<typeof locales>;

export const localePrefix = 'always';

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: (await import(`./locales/${locale}/common.json`)).default,
  };
}); 
import {ReactNode} from 'react';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import { Inter } from "next/font/google";
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import '../globals.css';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});
 
export const metadata = {
  title: 'Petsas Car Rental',
  description: 'Car rental in Cyprus - official site',
};

export default async function LocaleLayout({
  children,
  params: {locale}
}: {
  children: ReactNode;
  params: {locale: string};
}) {
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
 
  return (
    <html lang={locale}>
      <body className={`${inter.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
} 
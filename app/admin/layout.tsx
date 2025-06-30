import React from 'react';
import { Metadata } from 'next';
import { Inter } from "next/font/google";
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import '../globals.css';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Petsas Admin Dashboard',
  description: 'Car rental management system',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <div className="min-h-screen bg-gray-50">
          <AdminHeader />
          <div className="flex">
            <AdminSidebar />
            <main className="flex-1 ml-0 lg:ml-64 p-4 lg:p-8">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
} 
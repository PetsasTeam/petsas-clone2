"use client";

import Image from 'next/image';
import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter, Link } from '@/navigation';
import { pathnames } from '@/i18n';

type NavLink = {
  href: string; // can be internal or external
  label: string;
  external?: boolean;
};

const Header: React.FC = () => {
  const t = useTranslations('Header');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  const navLinks: NavLink[] = [
    { href: '/', label: t('home') },
    { href: '/about', label: t('about') },
    { href: '/vehicle-guide', label: t('vehicleGuide') },
    { href: '/locations', label: t('locations') },
    { href: '/contact', label: t('contact') },
    { href: '/terms', label: 'TERMS & CONDITIONS' },
    { href: 'https://www.carleasingcyprus.com/', label: t('leasing'), external: true },
  ];

  return (
    <header className="bg-white shadow-sm relative z-50">
      {/* Main Navigation Bar */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo Section */}
            <div className="flex items-center">
              <Link href="/">
                <Image
                  src="/logo.png"
                  alt="Petsas Car Rental"
                  width={120}
                  height={120}
                  className="h-[70px] w-auto"
                />
              </Link>
            </div>

            {/* Main Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              {navLinks.map((link) => (
                link.external ? (
                  <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200">
                    {link.label}
                  </a>
                ) : (
                  <Link key={link.href} href={link.href as keyof typeof pathnames} className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200">
                    {link.label}
                  </Link>
                )
              ))}
              {/* Auth Buttons & Language Switcher */}
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/login" className="text-gray-700 font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  Login
                </Link>
                <Link href="/register" className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200">
                  Register
                </Link>
                {/* Language Switcher */}
                <div className="flex items-center bg-white rounded-lg p-1 border border-gray-300 ml-2">
                  <button 
                    onClick={() => handleLocaleChange('en')}
                    className={`px-2 py-1 text-xs font-medium rounded ${locale === 'en' ? 'text-white bg-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}
                  >
                    EN
                  </button>
                  <button 
                    onClick={() => handleLocaleChange('ru')}
                    className={`px-2 py-1 text-xs font-medium rounded ${locale === 'ru' ? 'text-white bg-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}
                  >
                    RU
                  </button>
                </div>
              </div>
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              aria-label="Toggle navigation menu"
            >
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg border-t border-gray-200">
          <nav className="flex flex-col p-4 space-y-2">
            {navLinks.map((link) => (
              link.external ? (
                <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-blue-600 text-base font-medium">
                  {link.label}
                </a>
              ) : (
                <Link key={link.href} href={link.href as keyof typeof pathnames} className="text-gray-700 hover:text-blue-600 text-base font-medium" onClick={() => setMobileMenuOpen(false)}>
                  {link.label}
                </Link>
              )
            ))}
            <div className="border-t border-gray-200 my-3"></div>
            <div className="flex flex-col space-y-3">
               <Link href="/login" className="w-full text-center text-gray-700 font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>
                Login
              </Link>
              <Link href="/register" className="w-full text-center bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>
                Register
              </Link>
            </div>
            <div className="flex items-center justify-center pt-4">
              <div className="flex items-center bg-white rounded-lg p-1 border border-gray-300">
                <button 
                  onClick={() => {handleLocaleChange('en'); setMobileMenuOpen(false);}}
                  className={`px-3 py-1 text-sm font-medium rounded ${locale === 'en' ? 'text-white bg-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}
                >
                  EN
                </button>
                <button 
                  onClick={() => {handleLocaleChange('ru'); setMobileMenuOpen(false);}}
                  className={`px-3 py-1 text-sm font-medium rounded ${locale === 'ru' ? 'text-white bg-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}
                >
                  RU
                </button>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;

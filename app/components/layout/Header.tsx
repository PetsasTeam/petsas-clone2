"use client";

import Image from 'next/image';
import React, { useState, useEffect, useRef } from 'react';
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
  const [customer, setCustomer] = useState<any>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if user is logged in
    const customerData = localStorage.getItem('customer');
    if (customerData) {
      try {
        setCustomer(JSON.parse(customerData));
      } catch (error) {
        console.error('Error parsing customer data:', error);
        localStorage.removeItem('customer');
      }
    }
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  const handleLogout = () => {
    localStorage.removeItem('customer');
    localStorage.removeItem('latestBooking');
    setCustomer(null);
    setUserMenuOpen(false);
    router.push('/');
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

  // Generate user initials for avatar
  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

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
                {customer ? (
                  /* User Menu for Logged In User */
                  <div className="relative ml-4" ref={userMenuRef}>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 px-4 py-2 rounded-lg border border-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      {/* User Avatar */}
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {getUserInitials(customer.firstName, customer.lastName)}
                      </div>
                      {/* User Name */}
                      <span className="text-gray-700 font-medium text-sm">
                        {customer.firstName}
                      </span>
                      {/* Dropdown Arrow */}
                      <svg 
                        className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* User Dropdown Menu */}
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                        {/* User Info Header */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                              {getUserInitials(customer.firstName, customer.lastName)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {customer.firstName} {customer.lastName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {customer.email}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-1">
                          <Link
                            href="/dashboard"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7z" />
                            </svg>
                            Dashboard
                          </Link>
                          
                          <Link
                            href="/dashboard"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a4 4 0 118 0v4m-4 6v6m-4-6h8m-8 0a4 4 0 118 0z" />
                            </svg>
                            My Bookings
                          </Link>
                          
                          <div className="border-t border-gray-100 my-1"></div>
                          
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                          >
                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Guest User Login/Register Buttons */
                  <>
                    <Link href="/login" className="text-gray-700 font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                      Login
                    </Link>
                    <Link href="/register" className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200">
                      Register
                    </Link>
                  </>
                )}
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
              {customer ? (
                /* Mobile User Menu */
                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {getUserInitials(customer.firstName, customer.lastName)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {customer.firstName} {customer.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {customer.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Link
                      href="/dashboard"
                      className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-700 bg-white rounded-md hover:bg-gray-50 transition-colors duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7z" />
                      </svg>
                      Dashboard
                    </Link>
                    
                    <Link
                      href="/dashboard"
                      className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-700 bg-white rounded-md hover:bg-gray-50 transition-colors duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a4 4 0 118 0v4m-4 6v6m-4-6h8m-8 0a4 4 0 118 0z" />
                      </svg>
                      My Bookings
                    </Link>
                    
                    <button
                      onClick={() => {handleLogout(); setMobileMenuOpen(false);}}
                      className="flex items-center w-full text-left px-3 py-2 text-sm text-red-600 bg-white rounded-md hover:bg-red-50 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                /* Mobile Guest User Buttons */
                <>
                  <Link href="/login" className="w-full text-center text-gray-700 font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>
                    Login
                  </Link>
                  <Link href="/register" className="w-full text-center bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>
                    Register
                  </Link>
                </>
              )}
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

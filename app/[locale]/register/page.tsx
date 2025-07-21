"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { E164Number } from 'libphonenumber-js/core';

const countryCodes = [
  { code: "+357", label: "Cyprus (+357)" },
  { code: "+30", label: "Greece (+30)" },
  { code: "+44", label: "UK (+44)" },
  { code: "+1", label: "USA (+1)" },
  // ...add more as needed
];

export default function CustomerRegisterPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dob: null as Date | null,
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState<E164Number | undefined>();

  // Helper function to format date input
  const formatDateInput = (value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Add slashes at appropriate positions
    if (digits.length <= 2) {
      return digits;
    } else if (digits.length <= 4) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    } else {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    }
  };

  // Helper function to parse formatted date string to Date object
  const parseFormattedDate = (value: string): Date | null => {
    if (!value || value.length < 10) return null;
    
    const parts = value.split('/');
    if (parts.length !== 3) return null;
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900) return null;
    
    return new Date(year, month - 1, day);
  };

  // State for the formatted date input
  const [dateInputValue, setDateInputValue] = useState<string>('');

  // Update dateInputValue when form.dob changes (from calendar)
  useEffect(() => {
    if (form.dob) {
      const formatted = form.dob.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      setDateInputValue(formatted);
    } else {
      setDateInputValue('');
    }
  }, [form.dob]);

  // Handle typed input
  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDateInput(e.target.value);
    setDateInputValue(formatted);
    
    // Try to parse the date if it's complete
    if (formatted.length === 10) {
      const parsedDate = parseFormattedDate(formatted);
      if (parsedDate) {
        setForm({ ...form, dob: parsedDate });
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date: Date | null) => {
    setForm({ ...form, dob: date });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate passwords match
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: phone || form.phone,
          password: form.password,
          dateOfBirth: form.dob ? form.dob.toISOString().split('T')[0] : null,
          address: form.address,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Registration successful - redirect to login or auto-login
        window.location.href = '/en/login?message=Registration successful! Please log in.';
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 py-12 px-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Create Your Account</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input
                name="firstName"
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
                value={form.firstName}
                onChange={handleChange}
              />
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input
                name="lastName"
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
                value={form.lastName}
                onChange={handleChange}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <div className="relative">
              {/* Custom formatted input with calendar icon */}
              <input
                type="text"
                value={dateInputValue}
                onChange={handleDateInputChange}
                placeholder="DD/MM/YYYY"
                maxLength={10}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              {/* Hidden DatePicker with calendar icon trigger */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <DatePicker
                  selected={form.dob}
                  onChange={handleDateChange}
                  dateFormat="dd/MM/yyyy"
                  maxDate={new Date()}
                  showYearDropdown
                  yearDropdownItemNumber={100}
                  scrollableYearDropdown
                  customInput={
                    <button
                      type="button"
                      className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
                  }
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Postal Address</label>
            <input
              name="address"
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
              value={form.address}
              onChange={handleChange}
            />
          </div>
          <div className="flex gap-4">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Telephone *</label>
              <PhoneInput
                international
                defaultCountry="CY"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus-within:outline-none focus-within:ring-2 focus-within:ring-green-400 phone-input"
                value={phone}
                onChange={setPhone}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={form.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-green-600"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={form.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-green-600"
                  onClick={() => setShowConfirm(v => !v)}
                  tabIndex={-1}
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          </div>
          {error && <div className="text-red-600 text-sm text-center">{error}</div>}
          <button
            type="submit"
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition"
            disabled={loading}
          >
            {loading ? "Registering..." : "Sign Up"}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-green-700 font-semibold hover:underline">Login</Link>
        </div>
      </div>
      <style jsx global>{`
        .phone-input {
          display: flex;
          align-items: center;
        }

        .phone-input .PhoneInputInput {
          flex: 1;
          border: none;
          outline: none;
          background-color: transparent;
          height: 100%;
          padding-left: 8px;
        }

        .phone-input .PhoneInputInput:focus {
          ring-width: 0;
          box-shadow: none;
        }

        .phone-input .PhoneInputCountry {
          display: flex;
          align-items: center;
        }

        /* Custom DatePicker styles to match the form */
        .react-datepicker-wrapper {
          width: 100%;
        }

        .react-datepicker__input-container {
          width: 100%;
        }

        .react-datepicker__input-container input {
          width: 100%;
        }

        .react-datepicker {
          border: 1px solid #d1d5db;
          border-radius: 0.75rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }

        .react-datepicker__header {
          background: linear-gradient(135deg, #047857, #059669);
          border-bottom: none;
          border-radius: 0.75rem 0.75rem 0 0;
          padding: 16px 0;
        }

        .react-datepicker__current-month {
          font-weight: 600;
          color: white !important;
          font-size: 18px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .react-datepicker__day-name {
          color: white !important;
          font-weight: 500;
        }

        /* Fix for the year dropdown text - use bright yellow for excellent contrast */
        .react-datepicker__year-read-view {
          color: #fbbf24 !important;
          font-weight: 700 !important;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5) !important;
        }

        .react-datepicker__year-read-view--down-arrow {
          border-top-color: #fbbf24 !important;
        }

        /* Keep the main month/year text white, but not everything */
        .react-datepicker__current-month,
        .react-datepicker__day-name {
          color: white !important;
        }

        /* Year dropdown options should have black text on white background */
        .react-datepicker__year-dropdown {
          background-color: white !important;
          border: 1px solid #d1d5db !important;
          border-radius: 0.5rem !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
        }

        .react-datepicker__year-option {
          color: #374151 !important;
        }

        .react-datepicker__year-option:hover {
          background-color: #f0fdf4 !important;
          color: #047857 !important;
        }

        .react-datepicker__year-option--selected {
          background-color: #059669 !important;
          color: white !important;
        }

        .react-datepicker__day--selected {
          background-color: #059669;
          color: white;
        }

        .react-datepicker__day--selected:hover {
          background-color: #047857;
        }

        .react-datepicker__day:hover {
          background-color: #f0fdf4;
        }

        .react-datepicker__day--keyboard-selected {
          background-color: #dcfce7;
          color: #047857;
        }

        .react-datepicker__year-dropdown {
          background-color: white;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .react-datepicker__year-option:hover {
          background-color: #f0fdf4;
        }

        .react-datepicker__year-option--selected {
          background-color: #059669;
          color: white;
        }

        .react-datepicker__navigation--previous:hover,
        .react-datepicker__navigation--next:hover {
          background-color: #f0fdf4;
        }

        .react-datepicker__month-dropdown,
        .react-datepicker__year-dropdown {
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .react-datepicker__month-option:hover,
        .react-datepicker__year-option:hover {
          background-color: #f0fdf4;
        }

        .react-datepicker__month-option--selected,
        .react-datepicker__year-option--selected {
          background-color: #059669;
          color: white;
        }

        .react-datepicker__today-button {
          background-color: #059669;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 0.375rem;
          font-weight: 500;
        }

        .react-datepicker__today-button:hover {
          background-color: #047857;
        }
      `}</style>
    </div>
  );
} 
 
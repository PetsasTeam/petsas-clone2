"use client";

import React, { useState } from "react";
import Link from "next/link";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
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
    dob: "",
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    // TODO: Implement registration logic (API call)
    setTimeout(() => {
      setLoading(false);
      setError("Registration is not implemented yet."); // Demo error
    }, 1200);
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
            <input
              name="dob"
              type="date"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
              value={form.dob}
              onChange={handleChange}
            />
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
      `}</style>
    </div>
  );
} 
 
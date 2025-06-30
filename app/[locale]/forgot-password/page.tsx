"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    // TODO: Implement forgot password logic (API call)
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Forgot Password</h2>
        {submitted ? (
          <div className="text-center text-green-700 text-lg font-semibold">
            If an account with that email exists, a password reset link has been sent.<br />
            Please check your inbox.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            {error && <div className="text-red-600 text-sm text-center">{error}</div>}
            <button
              type="submit"
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}
        <div className="mt-6 text-center text-sm text-gray-600">
          Remembered your password?{' '}
          <Link href="/login" className="text-green-700 font-semibold hover:underline">Login</Link>
        </div>
      </div>
    </div>
  );
} 
 
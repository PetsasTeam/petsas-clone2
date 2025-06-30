"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    // TODO: Implement reset password logic (API call with token)
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Reset Password</h2>
        {success ? (
          <div className="text-center text-green-700 text-lg font-semibold">
            Your password has been reset successfully.<br />
            You can now <Link href="/login" className="underline text-green-700">login</Link> with your new password.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
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
            {error && <div className="text-red-600 text-sm text-center">{error}</div>}
            <button
              type="submit"
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
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
 
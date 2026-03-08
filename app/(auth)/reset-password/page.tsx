"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
        <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-white">Invalid link</h1>
          <p className="mt-2 text-sm text-zinc-400">
            This password reset link is invalid or has expired.
          </p>
          <p className="mt-6 text-center text-sm text-zinc-400">
            <Link href="/forgot-password" className="font-medium text-white hover:underline">
              Request a new link
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error: resetError } = await authClient.resetPassword({
      newPassword: password,
      token,
    });

    if (resetError) {
      setError(resetError.message || "Something went wrong. Please try again.");
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => router.push("/sign-in"), 2000);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
        <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-white">Password reset</h1>
          <div className="mt-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-400">
            Your password has been reset successfully. Redirecting to sign in…
          </div>
          <p className="mt-6 text-center text-sm text-zinc-400">
            <Link href="/sign-in" className="font-medium text-white hover:underline">
              Go to sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-white">Reset password</h1>
        <p className="mt-2 text-sm text-zinc-400">Enter your new password below</p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
              New password
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirm-password" className="block text-sm font-medium text-zinc-300">
              Confirm new password
            </label>
            <input
              id="confirm-password"
              type="password"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-200 transition disabled:opacity-50 cursor-pointer"
            disabled={loading}
            id="reset-submit"
          >
            {loading && (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            Reset password
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          <Link href="/sign-in" className="font-medium text-white hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

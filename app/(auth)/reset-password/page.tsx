"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import { resetPasswordSchema, type ResetPasswordData } from "@/lib/schemas/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="max-h-screen flex items-center justify-center bg-surface p-4">
        <div className="w-full max-w-md rounded-2xl bg-surface-container-lowest border border-transparent p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-on-surface">Invalid link</h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            This password reset link is invalid or has expired.
          </p>
          <p className="mt-6 text-center text-sm text-on-surface-variant">
            <Link href="/forgot-password" className="font-medium text-on-surface hover:underline">
              Request a new link
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: ResetPasswordData) => {
    setError("");
    setLoading(true);

    const { error: resetError } = await authClient.resetPassword({
      newPassword: data.password,
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
      <div className="min-h-screen flex items-center justify-center bg-surface p-4">
        <div className="w-full max-w-md rounded-2xl bg-surface-container-lowest border border-transparent p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-on-surface">Password reset</h1>
          <div className="mt-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-400">
            Your password has been reset successfully. Redirecting to sign in…
          </div>
          <p className="mt-6 text-center text-sm text-on-surface-variant">
            <Link href="/sign-in" className="font-medium text-on-surface hover:underline">
              Go to sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="w-full max-w-md rounded-2xl bg-surface-container-lowest border border-transparent p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-on-surface">Reset password</h1>
        <p className="mt-2 text-sm text-on-surface-variant">Enter your new password below</p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-on-surface-variant">
              New password
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded-lg border border-transparent bg-surface-container px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-white/20"
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-on-surface-variant">
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="w-full rounded-lg border border-transparent bg-surface-container px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-white/20"
              placeholder="Re-enter your password"
              autoComplete="new-password"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>
            )}
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

        <p className="mt-6 text-center text-sm text-on-surface-variant">
          <Link href="/sign-in" className="font-medium text-on-surface hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

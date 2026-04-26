"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUp } from "@/lib/auth-client";
import { signUpSchema, type SignUpData } from "@/lib/schemas/auth";

export default function SignUpPage() {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: SignUpData) => {
    setError("");
    setLoading(true);

    const { error: signUpError } = await signUp.email({
      name: data.name,
      email: data.email,
      password: data.password,
      callbackURL: "/",
    });

    if (signUpError) {
      setError(signUpError.message || "Something went wrong. Please try again.");
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-4">
        <div className="w-full max-w-md rounded-2xl bg-surface-container-lowest border border-transparent p-5 sm:p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-on-surface">Check your email</h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            We&apos;ve sent a verification link to <strong className="text-on-surface">{getValues("email")}</strong>.
            Please check your inbox and click the link to verify your account.
          </p>
          <p className="mt-6 text-center text-sm text-on-surface-variant">
            Already verified?{" "}
            <Link href="/sign-in" className="font-medium text-on-surface hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-h-screen flex items-center justify-center bg-surface p-4">
      <div className="w-full max-w-md rounded-2xl bg-surface-container-lowest border border-transparent p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-on-surface">Create account</h1>
        <p className="mt-1 text-sm text-on-surface-variant">Get started with AI Chatbot</p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-sm font-medium text-on-surface-variant">
              Name
            </label>
            <input
              id="name"
              type="text"
              className="w-full min-w-0 rounded-lg border border-transparent bg-surface-container px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-white/20"
              placeholder="Your name"
              autoComplete="name"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-red-400">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-on-surface-variant">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full min-w-0 rounded-lg border border-transparent bg-surface-container px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-white/20"
              placeholder="you@example.com"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-on-surface-variant">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full min-w-0 rounded-lg border border-transparent bg-surface-container px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-white/20"
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
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="w-full min-w-0 rounded-lg border border-transparent bg-surface-container px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-white/20"
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
            className="mt-2 w-full flex border-primary border items-center justify-center gap-2 rounded-lg hover:bg-surface-container-high px-4 py-2.5 text-sm font-semibold text-zinc-900 transition disabled:opacity-50 cursor-pointer"
            disabled={loading}
            id="signup-submit"
          >
            {loading && (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            Create account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-on-surface-variant">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-on-surface hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

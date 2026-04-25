"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "@/lib/auth-client";

export default function Home() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
    router.refresh();
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-4">
        <div className="w-full max-w-md rounded-2xl bg-surface-container-lowest border border-transparent p-8 shadow-xl flex justify-center">
          <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-4">
        <div className="w-full max-w-md rounded-2xl bg-surface-container-lowest border border-transparent p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-on-surface">AI Chatbot</h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Sign in to get started
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/sign-in"
              className="flex-1 text-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-200 transition"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="flex-1 text-center rounded-lg border border-transparent bg-surface-container px-4 py-2.5 text-sm font-medium text-on-surface hover:bg-surface-container-high transition"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="w-full max-w-md rounded-2xl bg-surface-container-lowest border border-transparent p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-on-surface">AI Chatbot</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Welcome back, {session.user.name}
        </p>
        <div className="mt-4 flex items-center gap-2 text-sm text-on-surface-variant">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
          {session.user.email}
        </div>
        <button
          onClick={handleSignOut}
          className="mt-6 w-full rounded-lg border border-transparent bg-surface-container px-4 py-2.5 text-sm font-medium text-on-surface hover:bg-surface-container-high transition cursor-pointer"
          id="signout-btn"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

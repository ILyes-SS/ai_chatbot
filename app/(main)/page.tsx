"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { useConversations } from "@/app/stores/conversations-store";
import { Button } from "@/components/ui/button";
import Logo from "../components/Logo";

export default function Home() {
  const router = useRouter();
  const { optimisticAddConversation } = useConversations();
  const [isCreating, setIsCreating] = useState(false);   
  const { data: session, isPending } = useSession();


  const handleNewChat = async () => {
      if (isCreating) return;
      setIsCreating(true);
      try {
        const realId = await optimisticAddConversation({ title: "New Chat" });
        if (realId) {
          router.push(`/chats/${realId}`);
        }
      } finally {
        setIsCreating(false);
      }
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
    <div className="min-h-screen flex items-center justify-center bg-surface p-4 pt-16 md:pt-4">
      <div className="w-full sm:w-[80%] md:w-[60%] flex flex-col gap-1  p-4 sm:p-8 ">
        <div className="flex items-center justify-start gap-2">
          <Logo size={60}/>
          <h1 className="text-2xl font-bold text-on-surface">SailorAI</h1>
        </div>
        <div className="flex items-center gap-2 ">
          <p className="text-xl max-sm:text-lg  text-on-surface-variant">
           Good Morning, <span className="text-2xl  max-sm:text-xl font-bold text-on-surface-variant">{session.user.name.split('@')[0]}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 mt-2 mb-3">
          <p className="text-lg   max-sm:text-[16px]  text-on-surface-variant">
            Start by Creating a New Chat
          </p>
        </div>
        <button
          onClick={handleNewChat}
          disabled={isCreating}
          className="flex justify-center items-center gap-2.5 w-full px-4 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          title="New Chat"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Chat
        </button>
      </div>
    </div>
  );
}

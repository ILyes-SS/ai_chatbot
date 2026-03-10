"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";

interface Conversation {
  _id: string;
  title: string;
  pinned: boolean;
  updatedAt: string;
}

interface SidebarProps {
  conversations: Conversation[];
}

export default function Sidebar({ conversations = [] }: SidebarProps) {
  const [expanded, setExpanded] = useState(false);
  const { data: session } = useSession();

  const pinned = conversations.filter((c) => c.pinned);
  const recent = conversations.filter((c) => !c.pinned);

  const userInitial =
    session?.user?.name?.charAt(0).toUpperCase() ??
    session?.user?.email?.charAt(0).toUpperCase() ??
    "?";

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={`relative flex flex-col h-screen bg-zinc-950 border-r border-zinc-800 transition-[width,min-width] duration-200 ease-in-out overflow-hidden z-40 ${
        expanded ? "w-[260px] min-w-[260px]" : "w-[64px] min-w-[64px]"
      }`}
    >
      {/* ── Top: New chat button & Projects Link ── */}
      <div className="p-4 pb-2 shrink-0 flex flex-col gap-2">
        <button
          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg bg-transparent text-zinc-400 text-sm font-medium cursor-pointer transition-colors hover:bg-zinc-800/50 hover:text-zinc-100 whitespace-nowrap"
          title="New chat"
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
          {expanded && <span>New chat</span>}
        </button>

        <Link
          href="/projects"
          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg bg-transparent text-zinc-400 no-underline text-sm font-medium transition-colors hover:bg-zinc-800/50 hover:text-zinc-100 whitespace-nowrap overflow-hidden"
          title="Projects"
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
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          {expanded && (
            <span className="overflow-hidden text-ellipsis whitespace-nowrap">
              Projects
            </span>
          )}
        </Link>
      </div>

      {/* ── Middle: navigation lists ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full">
        {/* Pinned / Bookmarks */}
        {pinned.length > 0 && (
          <section className="mb-3 mt-2">
            <h3 className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 whitespace-nowrap">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0"
              >
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
              </svg>
              {expanded && <span>Bookmarks</span>}
            </h3>
            <ul className="list-none m-0 p-0">
              {pinned.map((c) => (
                <li key={c._id}>
                  <Link
                    href={`/chat/${c._id}`}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-300 no-underline text-[13px] transition-colors hover:bg-zinc-800/50 whitespace-nowrap overflow-hidden"
                    title={c.title}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="shrink-0"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    {expanded && (
                      <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {c.title}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Recent Conversations */}
        {recent.length > 0 && (
          <section className="mb-3 mt-2">
            <h3 className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 whitespace-nowrap">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {expanded && <span>Recent</span>}
            </h3>
            <ul className="list-none m-0 p-0">
              {recent.map((c) => (
                <li key={c._id}>
                  <Link
                    href={`/chat/${c._id}`}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-300 no-underline text-[13px] transition-colors hover:bg-zinc-800/50 whitespace-nowrap overflow-hidden"
                    title={c.title}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="shrink-0"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    {expanded && (
                      <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {c.title}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {conversations.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-6 px-3 text-zinc-600">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {expanded && (
              <span className="text-xs text-zinc-500">No chats yet</span>
            )}
          </div>
        )}
      </nav>

      {/* ── Bottom: user avatar ── */}
      {session?.user && (
        <div className="flex items-center gap-2.5 p-3 pb-4 border-t border-zinc-800 shrink-0 overflow-hidden whitespace-nowrap">
          <div
            className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-zinc-800 text-zinc-200 text-sm font-semibold overflow-hidden"
            title={session.user.name ?? session.user.email}
          >
            {session.user.image ? (
              <img
                src={session.user.image}
                alt={session.user.name ?? "Avatar"}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span>{userInitial}</span>
            )}
          </div>
          {expanded && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-[13px] font-medium text-zinc-200 overflow-hidden text-ellipsis">
                {session.user.name ?? "User"}
              </span>
              <span className="text-[11px] text-zinc-500 overflow-hidden text-ellipsis">
                {session.user.email}
              </span>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}

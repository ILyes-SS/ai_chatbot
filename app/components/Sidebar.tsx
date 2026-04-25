"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useConversations } from "@/app/stores/conversations-store";
import { useProjects } from "@/app/stores/projects-store";
import SearchModal from "./SearchModal";
import ConversationItem from "./ConversationItem";
import Logo from "./Logo";

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [anyDropdownOpen, setAnyDropdownOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const chatId = params.chatId;

  const { conversations, optimisticAddConversation } = useConversations();
  const { projects } = useProjects();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command/Ctrl + K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

  const pinned = conversations.filter((c) => c.pinned);
  const recent = conversations.filter((c) => !c.pinned);

  const userInitial =
    session?.user?.name?.charAt(0).toUpperCase() ??
    session?.user?.email?.charAt(0).toUpperCase() ??
    "?";

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => {
        if (!anyDropdownOpen) setExpanded(false);
      }}
      className={`relative flex flex-col h-screen bg-surface-container-low border-r border-transparent transition-[width,min-width] duration-200 ease-in-out overflow-hidden z-40 ${
        expanded ? "w-[260px] min-w-[260px]" : "w-[64px] min-w-[64px]"
      }`}
    >
      {/* ── Top: New chat button & Projects Link ── */}
      <div className="p-4 pl-2 pb-2 shrink-0 flex flex-col items-center gap-2">
        <Logo/>
        <button
          onClick={handleNewChat}
          disabled={isCreating}
          className="flex justify-center items-center gap-2.5 w-full px-4 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          title="New Thread"
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
          {expanded && <span className="ml-1">New Thread</span>}
        </button>

        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex text-on-primary-container items-center gap-2.5 w-full px-3 py-2.5 rounded-xl bg-transparent  text-sm font-medium cursor-pointer transition-colors hover:bg-surface-container hover:text-on-surface whitespace-nowrap"
          title="Search "
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
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          {expanded && <span className="flex-1 text-left">Search</span>}
        </button>

        <Link
          href="/projects"
          className="flex text-on-primary-container items-center gap-2.5 w-full px-3 py-2.5 rounded-xl bg-transparent  no-underline text-sm font-medium transition-colors hover:bg-surface-container/50 hover:text-on-surface whitespace-nowrap overflow-hidden"
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
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-surface-container-high [&::-webkit-scrollbar-thumb]:rounded-full">
        {/* Pinned / Bookmarks */}
        {pinned.length > 0 && (
          <section className="mb-3 mt-2">
            <h3 className="flex text-on-primary-container items-center gap-2 px-3 pl-1 py-1.5 text-[12px] font-semibold uppercase tracking-wider  whitespace-nowrap">
              {expanded && <svg
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
              </svg>}
              {expanded && <span>Bookmarks</span>}
            </h3>
            <ul className="list-none m-0 p-0">
              {pinned.map((c) => (
                <ConversationItem key={c._id} conversation={c} expanded={expanded} isActive={chatId === c._id} onDropdownChange={setAnyDropdownOpen} />
              ))}
            </ul>
          </section>
        )}

        {/* Recent Conversations */}
        {recent.length > 0 && (
          <section className="mb-3 mt-2">
            <h3 className="flex  text-on-primary-container items-center gap-2 px-3 pl-1 py-1.5 text-[12px] font-semibold uppercase tracking-wider  whitespace-nowrap">
              {expanded && <svg
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
              </svg>}
              {expanded && <span>Recent</span>}
            </h3>
            <ul className="list-none m-0 p-0">
              {recent.map((c) => (
                <ConversationItem key={c._id} conversation={c} expanded={expanded} isActive={chatId === c._id} onDropdownChange={setAnyDropdownOpen} />
              ))}
            </ul>
          </section>
        )}

        {conversations.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-6 px-3 text-on-surface-variant/80">
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
              <span className="text-xs text-on-surface-variant">No chats yet</span>
            )}
          </div>
        )}
      </nav>

      {/* ── Bottom: user avatar ── */}
      {session?.user && (
        <div className="flex items-center gap-2.5 p-3 pb-4 border-t border-transparent shrink-0 overflow-hidden whitespace-nowrap">
          <div
            className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-surface-container text-on-surface text-sm font-semibold overflow-hidden"
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
              <span className="text-[13px] font-medium text-on-surface overflow-hidden text-ellipsis">
                {session.user.name ?? "User"}
              </span>
              <span className="text-[11px] text-on-surface-variant overflow-hidden text-ellipsis">
                {session.user.email}
              </span>
            </div>
          )}
        </div>
      )}

      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </aside>
  );
}

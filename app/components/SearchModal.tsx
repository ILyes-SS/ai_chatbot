"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useConversations } from "@/app/stores/conversations-store";
import { useProjects } from "@/app/stores/projects-store";

interface SearchItem {
  _id: string;
  title: string;
  updatedAt: string;
  type: "conversation" | "project";
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { conversations } = useConversations();
  const { projects } = useProjects();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const items: SearchItem[] = [
    ...(conversations || []).map((c) => ({
      _id: c._id,
      title: c.title || "Untitled Chat",
      updatedAt: c.updatedAt || "",
      type: "conversation" as const
    })),
    ...(projects || []).map((p) => ({
      _id: p._id,
      title: p.title || "Untitled Project",
      updatedAt: (p.updatedAt as string) || "",
      type: "project" as const
    }))
  ].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const filteredItems = query.trim() === "" 
    ? items.slice(0, 15) // Show top 15 recent by default
    : items.filter(item => item.title.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (item: SearchItem) => {
    onClose();
    if (item.type === "conversation") {
      router.push(`/chats/${item._id}`);
    } else {
      router.push(`/projects/${item._id}`);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center max-sm:items-start justify-center pt-[10svh] max-sm:pt-[1svh]  px-4">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-surface-container-lowest rounded-[1rem] shadow-[0_20px_40px_rgba(7,31,32,0.06)] p-4 sm:p-6 flex flex-col animate-in fade-in zoom-in-95 duration-200 ">
        
        {/* Search Input */}
        <div className="flex items-center px-4 bg-primary-container/60 rounded-xl mb-4 sm:mb-6">
          <svg className="w-5 h-5 text-primary shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            autoFocus
            className="flex-1 min-w-0 bg-transparent h-14 pl-3 pr-4 outline-none text-on-surface placeholder:text-on-surface-variant/60 text-base"
            placeholder="Search chats and projects..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-on-surface-variant hover:bg-surface-variant hover:text-on-surface transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[50vh] overflow-y-auto  pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-surface-container [&::-webkit-scrollbar-thumb]:rounded-full">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-sm text-on-surface-variant">No results found for &quot;{query}&quot;</div>
          ) : (
            <div>
              <p className="text-xs font-bold text-on-surface-variant/60 tracking-wider mb-2 px-2 uppercase">Recent</p>
              <ul className="flex flex-col gap-1">
                {filteredItems.map(item => (
                  <li key={item._id}>
                    <button
                      onClick={() => handleSelect(item)}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-container focus:bg-surface-container text-left transition-colors outline-none group"
                    >
                      <div className="flex items-center gap-4 overflow-hidden">
                        <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center shrink-0">
                          {item.type === "project" ? (
                            <svg className="w-4 h-4 text-on-surface-variant" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-on-surface-variant" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                          )}
                        </div>
                        
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-on-surface text-sm font-semibold truncate leading-tight">
                            {item.title}
                          </span>
                          <span className="text-xs text-on-surface-variant mt-0.5 truncate">
                            in {item.type === "project" ? "Projects" : "Conversations"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-on-surface-variant/60">
                          {new Date(item.updatedAt).toLocaleTimeString(undefined, {
                            hour: "numeric",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
      </div>
    </div>,
    document.body
  );
}

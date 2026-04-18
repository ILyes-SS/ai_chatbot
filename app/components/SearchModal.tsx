"use client";

import { useState, useEffect } from "react";
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
  const router = useRouter();
  const { conversations } = useConversations();
  const { projects } = useProjects();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[10svh] px-4">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Search Input */}
        <div className="flex items-center px-4 border-b border-zinc-800">
          <svg className="w-5 h-5 text-zinc-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            autoFocus
            className="flex-1 bg-transparent h-14 pl-3 pr-4 outline-none text-zinc-100 placeholder:text-zinc-500 text-base"
            placeholder="Search chats and projects..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[50vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-sm text-zinc-500">No results found for &quot;{query}&quot;</div>
          ) : (
            <ul className="flex flex-col gap-1">
              {filteredItems.map(item => (
                <li key={item._id}>
                  <button
                    onClick={() => handleSelect(item)}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-zinc-800 focus:bg-zinc-800 text-left transition-colors outline-none group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {item.type === "project" ? (
                        <svg className="w-4 h-4 text-zinc-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-zinc-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                        </svg>
                      )}
                      
                      <span className="text-zinc-200 text-sm font-medium truncate">
                        {item.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-zinc-500 hidden group-hover:block">
                        Enter
                      </span>
                      <span className="text-xs text-zinc-500">
                        {new Date(item.updatedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
      </div>
    </div>
  );
}

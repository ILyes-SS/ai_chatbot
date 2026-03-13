"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import { updateConversation, deleteConversation } from "@/actions/conversations";

interface Conversation {
  _id: string;
  title: string;
  pinned: boolean;
  projectId?: string | null;
}

interface Project {
  _id: string;
  title: string;
}

interface ConversationItemProps {
  conversation: Conversation;
  expanded: boolean;
  projects: Project[];
}

export default function ConversationItem({ conversation, expanded, projects }: ConversationItemProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(conversation.title);
  const [showProjectSubmenu, setShowProjectSubmenu] = useState(false);
  const [isPending, startTransition] = useTransition();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setShowProjectSubmenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle focus for renaming
  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleRenameSubmit = () => {
    if (!renameValue.trim() || renameValue === conversation.title) {
      setIsRenaming(false);
      setRenameValue(conversation.title);
      return;
    }

    startTransition(async () => {
      await updateConversation(conversation._id, { title: renameValue.trim() });
      setIsRenaming(false);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleRenameSubmit();
    if (e.key === "Escape") {
      setIsRenaming(false);
      setRenameValue(conversation.title);
    }
  };

  const handleTogglePin = () => {
    startTransition(async () => {
      await updateConversation(conversation._id, { pinned: !conversation.pinned });
      setIsDropdownOpen(false);
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteConversation(conversation._id);
      setIsDropdownOpen(false);
    });
  };

  const handleProjectAssign = (projectId: string | null) => {
    startTransition(async () => {
      await updateConversation(conversation._id, { projectId });
      setIsDropdownOpen(false);
      setShowProjectSubmenu(false);
    });
  };

  return (
    <li 
      className="relative group block"
    >
      {isRenaming ? (
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-zinc-800/50">
          <input
            ref={inputRef}
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-[13px] text-zinc-100 placeholder:text-zinc-500"
            disabled={isPending}
          />
        </div>
      ) : (
        <Link
          href={`/chat/${conversation._id}`}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-300 no-underline text-[13px] transition-colors hover:bg-zinc-800/50 whitespace-nowrap overflow-hidden ${isDropdownOpen ? 'bg-zinc-800/50' : ''}`}
          title={conversation.title}
        >
          {expanded && (
            <>
              <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                {conversation.title}
              </span>
              
              {/* Options Button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDropdownOpen(!isDropdownOpen);
                }}
                className={`p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-zinc-700/50 transition-all ${isDropdownOpen ? 'opacity-100 bg-zinc-700/50' : ''}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="12" cy="5" r="1"></circle>
                  <circle cx="12" cy="19" r="1"></circle>
                </svg>
              </button>
            </>
          )}
        </Link>
      )}

      {/* Dropdown Menu */}
      {isDropdownOpen && expanded && (
        <div 
          ref={dropdownRef}
          className="absolute right-2 top-10 w-48 bg-zinc-900 border border-zinc-700/50 rounded-xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          {/* Star Option */}
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleTogglePin(); }}
            disabled={isPending}
            className="w-full text-left px-3 py-1.5 text-[13px] text-zinc-300 hover:bg-zinc-800 flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={conversation.pinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-zinc-400">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            {conversation.pinned ? 'Unstar' : 'Star'}
          </button>

          {/* Rename Option */}
          <button 
            onClick={(e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
                setIsDropdownOpen(false); 
                setIsRenaming(true); 
            }}
            disabled={isPending}
            className="w-full text-left px-3 py-1.5 text-[13px] text-zinc-300 hover:bg-zinc-800 flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-zinc-400">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
              <path d="m15 5 4 4"></path>
            </svg>
            Rename
          </button>

          {/* Add to project (with sub-menu) */}
          <div className="relative">
            <button 
              onMouseEnter={() => setShowProjectSubmenu(true)}
              onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowProjectSubmenu(!showProjectSubmenu);
              }}
              disabled={isPending}
              className="w-full text-left px-3 py-1.5 text-[13px] text-zinc-300 hover:bg-zinc-800 flex items-center justify-between transition-colors disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-zinc-400">
                    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                {conversation.projectId ? "Change project" : "Add to project"}
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>

            {/* Project Submenu */}
            {showProjectSubmenu && (
              <div className="absolute left-full top-0 ml-1 w-48 bg-zinc-900 border border-zinc-700/50 rounded-xl shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100 max-h-48 overflow-y-auto z-[60]">
                 {conversation.projectId && (
                    <>
                        <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleProjectAssign(null); }}
                        className="w-full text-left px-3 py-1.5 text-[13px] text-zinc-400 hover:bg-zinc-800 flex items-center gap-2 transition-colors"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                                <path d="M18 6 6 18" />
                                <path d="m6 6 12 12" />
                            </svg>
                        Remove from project
                        </button>
                        <div className="mx-2 my-1 h-px bg-zinc-800"></div>
                    </>
                 )}
                {projects.length === 0 ? (
                  <div className="px-3 py-2 text-[12px] text-zinc-500 italic">No open projects</div>
                ) : (
                  projects.map(p => (
                    <button 
                      key={p._id}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleProjectAssign(p._id); }}
                      className="w-full text-left px-3 py-1.5 text-[13px] text-zinc-300 hover:bg-zinc-800 flex items-center justify-between group transition-colors"
                    >
                      <span className="truncate">{p.title}</span>
                      {conversation.projectId === p._id && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="mx-2 my-1 h-px bg-zinc-800/80"></div>

          {/* Delete Option */}
          <button 
            disabled={isPending}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(); }}
            className="w-full text-left px-3 py-1.5 text-[13px] text-red-400 hover:bg-red-400/10 flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              <line x1="10" x2="10" y1="11" y2="17"></line>
              <line x1="14" x2="14" y1="11" y2="17"></line>
            </svg>
            Delete
          </button>
        </div>
      )}
    </li>
  );
}

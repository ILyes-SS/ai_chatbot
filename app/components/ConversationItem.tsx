"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import { updateConversation } from "@/actions/conversations";
import ChatActionsMenu from "./ChatActionsMenu";

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
  isActive?: boolean;
  onDropdownChange?: (isOpen: boolean) => void;
}

export default function ConversationItem({ conversation, expanded, projects, isActive, onDropdownChange }: ConversationItemProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(conversation.title);
  const [isPending, startTransition] = useTransition();

  const inputRef = useRef<HTMLInputElement>(null);

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

  return (
    <li className="relative group block">
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
          href={`/chats/${conversation._id}`}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg no-underline text-[13px] transition-colors whitespace-nowrap overflow-hidden ${
            isActive && expanded 
              ? 'bg-zinc-800 text-zinc-100 font-medium' 
              : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
          }`}
          title={conversation.title}
        >
          {expanded && (
            <>
              <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                {conversation.title}
              </span>
              
              {/* Options Button - using ChatActionsMenu */}
              <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                <ChatActionsMenu
                  conversation={conversation}
                  projects={projects}
                  onRename={() => setIsRenaming(true)}
                  onOpenChange={onDropdownChange}
                  trigger={
                    <button
                      className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-zinc-700/50 transition-all data-[state=open]:opacity-100 data-[state=open]:bg-zinc-700/50"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="12" cy="5" r="1"></circle>
                        <circle cx="12" cy="19" r="1"></circle>
                      </svg>
                    </button>
                  }
                />
              </div>
            </>
          )}
        </Link>
      )}
    </li>
  );
}

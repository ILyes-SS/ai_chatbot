"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConversations } from "@/app/stores/conversations-store";
import ChatActionsMenu from "./ChatActionsMenu";

import type { Conversation } from "@/types";

interface ConversationItemProps {
  conversation: Conversation;
  expanded: boolean;
  isActive?: boolean;
  onDropdownChange?: (isOpen: boolean) => void;
}

export default function ConversationItem({ conversation, expanded, isActive, onDropdownChange }: ConversationItemProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(conversation.title);
  const { conversations, optimisticUpdateConversation } = useConversations();
  const router = useRouter();

  const inputRef = useRef<HTMLInputElement>(null);

  
  useEffect(() => {
    if (!isRenaming) {
      setRenameValue(conversation.title);
    }
  }, [conversation.title, isRenaming]);

  
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

    
    optimisticUpdateConversation(conversation._id, { title: renameValue.trim() });
    setIsRenaming(false);
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
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-surface-container/50 overflow-hidden w-full min-w-0">
          <input
            ref={inputRef}
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={handleKeyDown}
            className="flex-1 min-w-0 bg-transparent border-none outline-none text-[13px] text-on-surface placeholder:text-on-surface-variant"
          />
        </div>
      ) : (
        <Link
          href={`/chats/${conversation._id}`}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg no-underline text-[13px] transition-colors whitespace-nowrap overflow-hidden ${
            isActive && expanded 
              ? 'bg-surface-container text-on-surface font-medium' 
              : 'text-on-surface-variant hover:bg-surface-container/50 hover:text-on-surface'
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
                  onRename={() => setIsRenaming(true)}
                  onOpenChange={onDropdownChange}
                  onDelete={() => {
                    if (isActive) {
                      const remaining = conversations.filter(c => c._id !== conversation._id);
                      if (remaining.length > 0) {
                        router.push(`/chats/${remaining[0]._id}`);
                      } else {
                        router.push("/");
                      }
                    }
                  }}
                  trigger={
                    <button
                      className="p-1 rounded opacity-100 md:opacity-0 group-hover:opacity-100 hover:bg-surface-container-high/50 transition-all data-[state=open]:opacity-100 data-[state=open]:bg-surface-container-high/50"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant">
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

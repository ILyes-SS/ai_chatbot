"use client";

import { useState, useRef, useEffect } from "react";
import { Share, Check, Copy } from "lucide-react";
import { useConversations } from "@/app/stores/conversations-store";
import ChatActionsMenu from "./ChatActionsMenu";
import { Button } from "@/components/ui/button";

interface Conversation {
  _id: string;
  title: string;
  pinned: boolean;
  projectId?: string | null;
}

interface ChatHeaderProps {
  conversation: Conversation;
}

export default function ChatHeader({ conversation }: ChatHeaderProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(conversation?.title || "");
  const [shared, setShared] = useState(false);
  const { optimisticUpdateConversation } = useConversations();

  const inputRef = useRef<HTMLInputElement>(null);

  // Sync state when conversation prop changes (e.g. from optimistic update)
  useEffect(() => {
    if (conversation?.title && !isRenaming) {
      setRenameValue(conversation.title);
    }
  }, [conversation?.title, isRenaming]);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  if (!conversation) return null;

  const handleRenameSubmit = () => {
    if (!renameValue.trim() || renameValue === conversation.title) {
      setIsRenaming(false);
      setRenameValue(conversation.title);
      return;
    }

    const newTitle = renameValue.trim();
    setIsRenaming(false);

    // Optimistic update — both header and sidebar update simultaneously
    optimisticUpdateConversation(conversation._id, { title: newTitle });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleRenameSubmit();
    if (e.key === "Escape") {
      setIsRenaming(false);
     setRenameValue(conversation.title);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-background/50 sticky top-0 z-10">
      <div className="w-fit min-w-0 max-w-md">
        {isRenaming ? (
          <input
            ref={inputRef}
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={handleKeyDown}
            className=" bg-transparent border-none outline-none text-lg font-semibold text-foreground focus:ring-0 p-0"
          />
        ) : (
          <h1 
            className="text-lg font-semibold text-foreground truncate cursor-pointer hover:underline decoration-muted-foreground/30 underline-offset-4"
            onClick={() => setIsRenaming(true)}
            title="Click to rename"
          >
            {conversation.title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0 ml-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleShare}
          className="text-muted-foreground hover:text-foreground"
          title="Share chat"
        >
          {shared ? <Check className="size-4 text-green-500" /> : <Share className="size-4" />}
        </Button>

        <ChatActionsMenu
          conversation={conversation}
          onRename={() => setIsRenaming(true)}
          onDelete={() => {
            window.location.href = "/"; // Redirect to home after delete since we are on the page
          }}
          trigger={
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="12" cy="5" r="1"></circle>
                <circle cx="12" cy="19" r="1"></circle>
              </svg>
            </Button>
          }
        />
      </div>
    </div>
  );
}

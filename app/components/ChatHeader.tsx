"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Share, Check, Copy } from "lucide-react";
import { updateConversation } from "@/actions/conversations";
import ChatActionsMenu from "./ChatActionsMenu";
import { Button } from "@/components/ui/button";

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

interface ChatHeaderProps {
  conversation: Conversation;
  projects: Project[];
}

export default function ChatHeader({ conversation, projects }: ChatHeaderProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(conversation?.title || "");
  const [displayTitle, setDisplayTitle] = useState(conversation?.title || "");
  const [isPending, startTransition] = useTransition();
  const [shared, setShared] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Sync state when conversation prop changes (e.g. initial load)
  useEffect(() => {
    if (conversation?.title && !isRenaming) {
      setRenameValue(conversation.title);
      setDisplayTitle(conversation.title);
    }
  }, [conversation?.title]);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  if (!conversation) return null;

  const handleRenameSubmit = () => {
    if (!renameValue.trim() || renameValue === displayTitle) {
      setIsRenaming(false);
      setRenameValue(displayTitle);
      return;
    }

    const newTitle = renameValue.trim();
    setIsRenaming(false);
    setDisplayTitle(newTitle); // Optimistic update

    startTransition(async () => {
      await updateConversation(conversation._id, { title: newTitle });
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleRenameSubmit();
    if (e.key === "Escape") {
      setIsRenaming(false);
     setRenameValue(displayTitle);
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
            disabled={isPending}
          />
        ) : (
          <h1 
            className="text-lg font-semibold text-foreground truncate cursor-pointer hover:underline decoration-muted-foreground/30 underline-offset-4"
            onClick={() => setIsRenaming(true)}
            title="Click to rename"
          >
            {displayTitle}
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
          projects={projects}
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

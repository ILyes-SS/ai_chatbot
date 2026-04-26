"use client";

import { useState, useRef, useEffect } from "react";
import { Share, Check, Copy } from "lucide-react";
import { useConversations } from "@/app/stores/conversations-store";
import { useRouter } from "next/navigation";
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

export default function ChatHeader({ conversation: initialConversation }: ChatHeaderProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const { conversations, optimisticUpdateConversation } = useConversations();
  const router = useRouter();
  
  // Use live data from the store so that any server updates (like auto-naming) 
  // or optimistic updates are immediately reflected here.
  const liveConversation = conversations.find(c => c._id === initialConversation?._id) || initialConversation;
  
  const [renameValue, setRenameValue] = useState(liveConversation?.title || "");
  const [shared, setShared] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Sync state when conversation title changes externally
  useEffect(() => {
    if (liveConversation?.title && !isRenaming) {
      setRenameValue(liveConversation.title);
    }
  }, [liveConversation?.title, isRenaming]);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  if (!liveConversation) return null;

  const handleRenameSubmit = () => {
    if (!renameValue.trim() || renameValue === liveConversation.title) {
      setIsRenaming(false);
      setRenameValue(liveConversation.title);
      return;
    }

    const newTitle = renameValue.trim();
    setIsRenaming(false);

    // Optimistic update — both header and sidebar update simultaneously
    optimisticUpdateConversation(liveConversation._id, { title: newTitle });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleRenameSubmit();
    if (e.key === "Escape") {
      setIsRenaming(false);
     setRenameValue(liveConversation.title);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <div className="flex items-center justify-between px-4 pl-12 md:pl-4 py-3 border-b border-border/40 bg-background/50 sticky top-0 z-10">
      <div className="w-fit min-w-0 max-w-md">
        {isRenaming ? (
          <input
            ref={inputRef}
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={handleKeyDown}
            className=" bg-transparent w-full min-w-0 border-none outline-none text-lg font-semibold text-foreground focus:ring-0 p-0"
          />
        ) : (
          <h1 
            className="text-lg font-semibold text-foreground truncate cursor-pointer hover:underline decoration-muted-foreground/30 underline-offset-4"
            onClick={() => setIsRenaming(true)}
            title="Click to rename"
          >
            {liveConversation.title}
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
          conversation={liveConversation}
          onRename={() => setIsRenaming(true)}
          onDelete={() => {
            const remaining = conversations.filter(c => c._id !== liveConversation._id);
            if (remaining.length > 0) {
              router.push(`/chats/${remaining[0]._id}`);
            } else {
              router.push("/");
            }
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

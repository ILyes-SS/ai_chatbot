"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import {
  createConversation as serverCreateConversation,
  updateConversation as serverUpdateConversation,
  deleteConversation as serverDeleteConversation,
} from "@/actions/conversations";
import type { CreateConversationData, UpdateConversationData } from "@/lib/schemas/conversation";
import { useToast } from "./toast";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface ConversationItem {
  _id: string;
  title: string;
  pinned: boolean;
  projectId?: string | null;
  updatedAt: string | null;
  createdAt?: string | null;
  /** Marks a conversation as being optimistically added (not yet confirmed by server) */
  _optimistic?: boolean;
}

interface ConversationsContextValue {
  conversations: ConversationItem[];
  optimisticAddConversation: (data: CreateConversationData) => Promise<string | null>;
  optimisticUpdateConversation: (id: string, data: UpdateConversationData, options?: { overwriteMessages?: boolean }) => void;
  optimisticDeleteConversation: (id: string) => void;
}

// ---------------------------------------------------------------------------
// Sorting helper
// ---------------------------------------------------------------------------
function sortConversations(list: ConversationItem[]): ConversationItem[] {
  return [...list].sort((a, b) => {
    // Pinned first
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    // Then by updatedAt descending
    const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return bTime - aTime;
  });
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const ConversationsContext = createContext<ConversationsContextValue | null>(null);

export function useConversations() {
  const ctx = useContext(ConversationsContext);
  if (!ctx) throw new Error("useConversations must be used within <ConversationsProvider>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
interface ConversationsProviderProps {
  initialConversations: ConversationItem[];
  children: React.ReactNode;
}

export function ConversationsProvider({ initialConversations, children }: ConversationsProviderProps) {
  const [conversations, setConversations] = useState<ConversationItem[]>(() =>
    sortConversations(initialConversations),
  );
  const { showToast } = useToast();

  // Use a ref to always have access to the latest state in async callbacks
  const conversationsRef = useRef(conversations);
  conversationsRef.current = conversations;

  // ── Create ──────────────────────────────────────────────────────────────
  const optimisticAddConversation = useCallback(
    async (data: CreateConversationData): Promise<string | null> => {
      const tempId = `temp-${Date.now()}`;
      const now = new Date().toISOString();
      const optimisticConv: ConversationItem = {
        _id: tempId,
        title: data.title,
        pinned: false,
        projectId: data.projectId ?? null,
        updatedAt: now,
        createdAt: now,
        _optimistic: true,
      };

      // Optimistic: add immediately
      setConversations((prev) => sortConversations([optimisticConv, ...prev]));

      try {
        const result = await serverCreateConversation(data);
        if (result.success && result.data) {
          const realId = result.data._id;
          // Replace temp with real
          setConversations((prev) =>
            sortConversations(
              prev.map((c) =>
                c._id === tempId
                  ? { ...optimisticConv, _id: realId, _optimistic: false }
                  : c,
              ),
            ),
          );
          return realId;
        } else {
          // Rollback
          setConversations((prev) => prev.filter((c) => c._id !== tempId));
          showToast(result.error || "Failed to create conversation", "error");
          return null;
        }
      } catch {
        setConversations((prev) => prev.filter((c) => c._id !== tempId));
        showToast("Failed to create conversation", "error");
        return null;
      }
    },
    [showToast],
  );

  // ── Update ──────────────────────────────────────────────────────────────
  const optimisticUpdateConversation = useCallback(
    (id: string, data: UpdateConversationData, options?: { overwriteMessages?: boolean }) => {
      const snapshot = conversationsRef.current;

      // Optimistic: apply updates immediately
      setConversations((prev) =>
        sortConversations(
          prev.map((c) => {
            if (c._id !== id) return c;
            const updated = { ...c, updatedAt: new Date().toISOString() };
            if (data.title !== undefined) updated.title = data.title;
            if (data.pinned !== undefined) updated.pinned = data.pinned;
            if (data.projectId !== undefined) updated.projectId = data.projectId;
            return updated;
          }),
        ),
      );

      // Fire server action
      serverUpdateConversation(id, data, options).then((result) => {
        if (!result.success) {
          // Rollback
          setConversations(sortConversations(snapshot));
          showToast(result.error || "Failed to update conversation", "error");
        }
      }).catch(() => {
        setConversations(sortConversations(snapshot));
        showToast("Failed to update conversation", "error");
      });
    },
    [showToast],
  );

  // ── Delete ──────────────────────────────────────────────────────────────
  const optimisticDeleteConversation = useCallback(
    (id: string) => {
      const snapshot = conversationsRef.current;

      // Optimistic: remove immediately
      setConversations((prev) => prev.filter((c) => c._id !== id));

      serverDeleteConversation(id).then((result) => {
        if (!result.success) {
          setConversations(sortConversations(snapshot));
          showToast(result.error || "Failed to delete conversation", "error");
        }
      }).catch(() => {
        setConversations(sortConversations(snapshot));
        showToast("Failed to delete conversation", "error");
      });
    },
    [showToast],
  );

  return (
    <ConversationsContext.Provider
      value={{
        conversations,
        optimisticAddConversation,
        optimisticUpdateConversation,
        optimisticDeleteConversation,
      }}
    >
      {children}
    </ConversationsContext.Provider>
  );
}

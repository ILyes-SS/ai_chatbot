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

  const deletedIds = useRef<Set<string>>(new Set());
  const pendingUpdates = useRef<Map<string, Partial<ConversationItem>>>(new Map());

  // Sync with server data on router.refresh() 
  // We merge optimistic items with fresh server items.
  React.useEffect(() => {
    setConversations((prev) => {
      const optimisticIds = new Set(prev.filter(c => c._optimistic).map(c => c._id));
      
      // Filter out items that are currently pending deletion
      let freshItems = initialConversations.filter(
        c => !optimisticIds.has(c._id) && !deletedIds.current.has(c._id)
      );

      // Apply any pending updates to the fresh items so they don't revert to stale server state
      if (pendingUpdates.current.size > 0) {
        freshItems = freshItems.map(c => {
          const updates = pendingUpdates.current.get(c._id);
          return updates ? { ...c, ...updates } : c;
        });
      }

      const optimisticItems = prev.filter(c => c._optimistic);
      
      return sortConversations([...optimisticItems, ...freshItems]);
    });
  }, [initialConversations]);

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

      // Track pending update to protect against stale server pushes during navigation
      pendingUpdates.current.set(id, { ...pendingUpdates.current.get(id), ...data });

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
        pendingUpdates.current.delete(id);
        if (!result.success) {
          // Rollback
          setConversations(sortConversations(snapshot));
          showToast(result.error || "Failed to update conversation", "error");
        }
      }).catch(() => {
        pendingUpdates.current.delete(id);
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

      // Track deletion to protect against stale server pushes during navigation
      deletedIds.current.add(id);

      // Optimistic: remove immediately
      setConversations((prev) => prev.filter((c) => c._id !== id));

      serverDeleteConversation(id).then((result) => {
        if (!result.success) {
          deletedIds.current.delete(id);
          setConversations(sortConversations(snapshot));
          showToast(result.error || "Failed to delete conversation", "error");
        }
      }).catch(() => {
        deletedIds.current.delete(id);
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

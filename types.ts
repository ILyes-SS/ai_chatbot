import type { UIMessage } from "ai";

// ---------------------------------------------------------------------------
// Project
// ---------------------------------------------------------------------------
export type Project = {
  _id: string;
  title: string;
  context?: string;
  media?: string[];
  createdAt?: string | Date | null;
  updatedAt: string | Date | null;
};

// ---------------------------------------------------------------------------
// Conversation
// ---------------------------------------------------------------------------
export type Conversation = {
  _id: string;
  title: string;
  pinned: boolean;
  projectId?: string | null;
  userId?: string;
  messages?: UIMessage[];
  createdAt?: string | null;
  updatedAt: string | null;
};

// ---------------------------------------------------------------------------
// Source (used in chat for web-search grounding results)
// ---------------------------------------------------------------------------
export interface SourceItem {
  url?: string;
  uri?: string;
  title?: string;
  sourceId?: string;
  mediaType?: string;
  filename?: string;
}
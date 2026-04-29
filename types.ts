import type { UIMessage } from "ai";




export type Project = {
  _id: string;
  title: string;
  context?: string;
  media?: string[];
  createdAt?: string | Date | null;
  updatedAt: string | Date | null;
};




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




export interface SourceItem {
  url?: string;
  uri?: string;
  title?: string;
  sourceId?: string;
  mediaType?: string;
  filename?: string;
}
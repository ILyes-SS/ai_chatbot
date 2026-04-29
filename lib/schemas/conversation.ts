import { z } from "zod";
import type { UIMessage } from "ai";

// --- AI SDK UIMessage schema ---
// AI SDK's UIMessage is highly complex with many part types. We use z.custom
// to bypass deep structural validation and rely on the TS type.
export const messageSchema = z.custom<UIMessage>((val) => {
  return typeof val === "object" && val !== null && "id" in val && "role" in val;
});

export type Message = UIMessage;

// --- Create conversation ---
export const createConversationSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  projectId: z.string().optional(),
});

export type CreateConversationData = z.infer<typeof createConversationSchema>;

// --- Update conversation ---
export const updateConversationSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  pinned: z.boolean().optional(),
  projectId: z.string().nullable().optional(),
  messages: z.array(messageSchema).optional(),
});

export type UpdateConversationData = z.infer<typeof updateConversationSchema>;

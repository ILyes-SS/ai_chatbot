import { z } from "zod";
import type { UIMessage } from "ai";




export const messageSchema = z.custom<UIMessage>((val) => {
  return typeof val === "object" && val !== null && "id" in val && "role" in val;
});

export type Message = UIMessage;


export const createConversationSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  projectId: z.string().optional(),
});

export type CreateConversationData = z.infer<typeof createConversationSchema>;


export const updateConversationSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  pinned: z.boolean().optional(),
  projectId: z.string().nullable().optional(),
  messages: z.array(messageSchema).optional(),
});

export type UpdateConversationData = z.infer<typeof updateConversationSchema>;

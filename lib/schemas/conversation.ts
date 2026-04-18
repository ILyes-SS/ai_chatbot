import { z } from "zod";

// --- AI SDK UIMessage part schemas ---
const textPartSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
});

const toolInvocationPartSchema = z.object({
  type: z.literal("tool-invocation"),
  toolInvocationId: z.string(),
  toolName: z.string(),
  args: z.unknown(),
  state: z.enum(["partial-call", "call", "result"]),
  output: z.unknown().optional(),
});

const filePartSchema = z.object({
  type: z.literal("file"),
  mediaType: z.string(),
  url: z.string(),
  filename: z.string().optional(),
});

const messagePartSchema = z.discriminatedUnion("type", [
  textPartSchema,
  toolInvocationPartSchema,
  filePartSchema,
]);

// --- AI SDK UIMessage schema ---
export const messageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system", "tool"]),
  parts: z.array(messagePartSchema),
  createdAt: z.coerce.date().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type Message = z.infer<typeof messageSchema>;

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

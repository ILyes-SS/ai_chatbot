import { z } from "zod";

// --- Create project ---
export const createProjectSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  context: z.string().max(5000).optional(),
  media: z.array(z.string().url()).optional(),
});

export type CreateProjectData = z.infer<typeof createProjectSchema>;

// --- Update project ---
export const updateProjectSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  context: z.string().max(5000).optional(),
  media: z.array(z.string().url()).optional(),
});

export type UpdateProjectData = z.infer<typeof updateProjectSchema>;

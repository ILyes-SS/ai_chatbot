"use server";

import { type WithId, type Document } from "mongodb";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { getDb, getAuthSession } from "@/lib/db-helpers";
import {
  createProjectSchema,
  updateProjectSchema,
  type CreateProjectData,
  type UpdateProjectData,
} from "@/lib/schemas/project";

const COLLECTION = "projects";

/**
 * Converts a MongoDB document to a plain object with _id serialised to string.
 */
function serialize(doc: WithId<Document>) {
  return {
    ...doc,
    _id: doc._id.toString(),
  };
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------
export async function createProject(data: CreateProjectData) {
  try {
    const session = await getAuthSession();
    const parsed = createProjectSchema.safeParse(data);

    if (!parsed.success) {
      return { success: false as const, error: parsed.error.issues[0].message };
    }

    const db = await getDb();
    const now = new Date();

    const doc = {
      userId: session.user.id,
      title: parsed.data.title,
      context: parsed.data.context ?? "",
      media: parsed.data.media ?? [],
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection(COLLECTION).insertOne(doc);

    revalidatePath("/");

    return {
      success: true as const,
      data: { ...doc, _id: result.insertedId.toString() },
    };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to create project",
    };
  }
}

// ---------------------------------------------------------------------------
// Read — all for current user
// ---------------------------------------------------------------------------
export async function getProjects() {
  try {
    const session = await getAuthSession();
    const db = await getDb();

    const projects = await db
      .collection(COLLECTION)
      .find({ userId: session.user.id })
      .sort({ updatedAt: -1 })
      .toArray();

    return { success: true as const, data: projects.map(serialize) };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to fetch projects",
    };
  }
}

// ---------------------------------------------------------------------------
// Read — single by id
// ---------------------------------------------------------------------------
export async function getProjectById(id: string) {
  try {
    const session = await getAuthSession();
    const db = await getDb();

    const project = await db
      .collection(COLLECTION)
      .findOne({ _id: new ObjectId(id), userId: session.user.id });

    if (!project) {
      return { success: false as const, error: "Project not found" };
    }

    return { success: true as const, data: serialize(project) };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to fetch project",
    };
  }
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------
export async function updateProject(
  id: string,
  data: UpdateProjectData,
) {
  try {
    const session = await getAuthSession();
    const parsed = updateProjectSchema.safeParse(data);

    if (!parsed.success) {
      return { success: false as const, error: parsed.error.issues[0].message };
    }

    const db = await getDb();

    const setFields: Record<string, unknown> = { updatedAt: new Date() };

    if (parsed.data.title !== undefined) setFields.title = parsed.data.title;
    if (parsed.data.context !== undefined) setFields.context = parsed.data.context;
    if (parsed.data.media !== undefined) setFields.media = parsed.data.media;

    const result = await db
      .collection(COLLECTION)
      .updateOne(
        { _id: new ObjectId(id), userId: session.user.id },
        { $set: setFields },
      );

    if (result.matchedCount === 0) {
      return { success: false as const, error: "Project not found" };
    }

    revalidatePath("/");

    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to update project",
    };
  }
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------
export async function deleteProject(id: string) {
  try {
    const session = await getAuthSession();
    const db = await getDb();

    const result = await db
      .collection(COLLECTION)
      .deleteOne({ _id: new ObjectId(id), userId: session.user.id });

    if (result.deletedCount === 0) {
      return { success: false as const, error: "Project not found" };
    }

    revalidatePath("/");

    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to delete project",
    };
  }
}

"use server";

import { ObjectId, type WithId, type Document } from "mongodb";
import { revalidatePath } from "next/cache";
import { getDb, getAuthSession } from "@/lib/db-helpers";
import {
  createConversationSchema,
  updateConversationSchema,
  type CreateConversationData,
  type UpdateConversationData,
} from "@/lib/schemas/conversation";
import type { Conversation } from "@/types";

const COLLECTION = "conversation";


function serialize(doc: WithId<Document>): Conversation {
  return {
    _id: doc._id.toString(),
    title: doc.title ?? "Untitled",
    pinned: doc.pinned ?? false,
    projectId: doc.projectId instanceof ObjectId
      ? doc.projectId.toString()
      : doc.projectId ?? null,
    userId: doc.userId,
    messages: doc.messages ?? [],
    updatedAt: doc.updatedAt?.toISOString() || null,
    createdAt: doc.createdAt?.toISOString() || null,
  };
}




export async function createConversation(data: CreateConversationData) {
  try {
    const session = await getAuthSession();
    const parsed = createConversationSchema.safeParse(data);

    if (!parsed.success) {
      return { success: false as const, error: parsed.error.issues[0].message };
    }

    const db = await getDb();
    const now = new Date();

    const doc = {
      userId: session.user.id,
      title: parsed.data.title,
      projectId: parsed.data.projectId
        ? new ObjectId(parsed.data.projectId)
        : null,
      messages: [],
      pinned: false,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection(COLLECTION).insertOne(doc);

    revalidatePath("/");

    return {
      success: true as const,
      data: {
        ...doc,
        _id: result.insertedId.toString(),
        projectId: doc.projectId?.toString() ?? null,
      },
    };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to create conversation",
    };
  }
}




export async function getConversations() {
  try {
    const session = await getAuthSession();
    const db = await getDb();

    const conversations = await db
      .collection(COLLECTION)
      .find({ userId: session.user.id })
      .sort({ pinned: -1, updatedAt: -1 })
      .toArray();

    return { success: true as const, data: conversations.map(serialize) };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to fetch conversations",
    };
  }
}




export async function getConversationsByProjectId(projectId: string) {
  try {
    const session = await getAuthSession();
    const db = await getDb();

    const conversations = await db
      .collection(COLLECTION)
      .find({ 
        userId: session.user.id,
        projectId: new ObjectId(projectId)
      })
      .sort({ pinned: -1, updatedAt: -1 })
      .toArray();

    return { success: true as const, data: conversations.map(serialize) };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to fetch conversations",
    };
  }
}




export async function getConversationById(id: string) {
  try {
    const session = await getAuthSession();
    const db = await getDb();

    const conversation = await db
      .collection(COLLECTION)
      .findOne({ _id: new ObjectId(id), userId: session.user.id });

    if (!conversation) {
      return { success: false as const, error: "Conversation not found" };
    }

    return { success: true as const, data: serialize(conversation) };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to fetch conversation",
    };
  }
}




export async function updateConversation(
  id: string,
  data: UpdateConversationData,
  options?: { overwriteMessages?: boolean }
) {
  try {
    const session = await getAuthSession();
    const parsed = updateConversationSchema.safeParse(data);

    if (!parsed.success) {
      return { success: false as const, error: parsed.error.issues[0].message };
    }

    const db = await getDb();

    
    const setFields: Record<string, unknown> = { updatedAt: new Date() };

    if (parsed.data.title !== undefined) setFields.title = parsed.data.title;
    if (parsed.data.pinned !== undefined) setFields.pinned = parsed.data.pinned;
    if (parsed.data.projectId !== undefined) {
      setFields.projectId = parsed.data.projectId 
        ? new ObjectId(parsed.data.projectId) 
        : null;
    }

    const updateDoc: any = {
      $set: setFields,
    };

    if (parsed.data.messages) {
      if (options?.overwriteMessages) {
        setFields.messages = parsed.data.messages;
      } else if (parsed.data.messages.length > 0) {
        updateDoc.$push = {
          messages: { $each: parsed.data.messages },
        };
      }
    }

    const result = await db
      .collection(COLLECTION)
      .updateOne(
        { _id: new ObjectId(id), userId: session.user.id },
        updateDoc,
      );

    if (result.matchedCount === 0) {
      return { success: false as const, error: "Conversation not found" };
    }

    revalidatePath("/");

    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to update conversation",
    };
  }
}




export async function deleteConversation(id: string) {
  try {
    const session = await getAuthSession();
    const db = await getDb();

    const result = await db
      .collection(COLLECTION)
      .deleteOne({ _id: new ObjectId(id), userId: session.user.id });

    if (result.deletedCount === 0) {
      return { success: false as const, error: "Conversation not found" };
    }

    revalidatePath("/");

    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to delete conversation",
    };
  }
}

"use server";

import { headers } from "next/headers";
import { Db } from "mongodb";
import { clientPromise } from "./db";
import { auth } from "./auth";

/**
 * Returns the MongoDB database instance for the ai_chatbot database.
 */
export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db("ai_chatbot");
}

/**
 * Retrieves the authenticated session from Better-Auth.
 * Throws if the user is not authenticated.
 */
export async function getAuthSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
}

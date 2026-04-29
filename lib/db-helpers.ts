"use server";

import { headers } from "next/headers";
import { Db } from "mongodb";
import { clientPromise } from "./db";
import { auth } from "./auth";


export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db("ai_chatbot");
}


export async function getAuthSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
}

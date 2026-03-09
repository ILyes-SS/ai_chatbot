import { MongoClient, Db } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not set");
}

const uri = process.env.MONGODB_URI;

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In development, use a global variable so the MongoClient
  // is preserved across hot reloads and doesn't leak connections.
  const globalWithMongo = globalThis as typeof globalThis & {
    _mongoClient?: MongoClient;
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClient) {
    globalWithMongo._mongoClient = new MongoClient(uri);
    globalWithMongo._mongoClientPromise = globalWithMongo._mongoClient.connect();
  }
  client = globalWithMongo._mongoClient;
  clientPromise = globalWithMongo._mongoClientPromise!;
} else {
  // In production, create a single module-scoped client.
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

const db: Db = client.db("ai_chatbot");

export { clientPromise };

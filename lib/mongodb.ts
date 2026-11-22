
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is missing");
}

const options = {};

declare global {
  var mongoClientPromise: Promise<MongoClient> | undefined;
}

const globalWithMongo = globalThis as typeof globalThis & {
  mongoClientPromise?: Promise<MongoClient>;
};

if (!globalWithMongo.mongoClientPromise) {
  const client = new MongoClient(uri, options);
  globalWithMongo.mongoClientPromise = client.connect();
}

const clientPromise = globalWithMongo.mongoClientPromise;

export default clientPromise;

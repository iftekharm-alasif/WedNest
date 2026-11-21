
import "server-only";
import { MongoClient, ObjectId } from "mongodb";

export async function getVendorSubscription(userId: string) {
  if (!ObjectId.isValid(userId)) {
    return "free";
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("MONGODB_URI is missing");
    return "free";
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();

    const db = client.db("wednestdb");

    const vendor = await db.collection("user").findOne(
      {
        _id: new ObjectId(userId),
        role: "vendor",
      },
      {
        projection: {
          subscriptionPlan: 1,
        },
      }
    );

    return vendor?.subscriptionPlan || "free";
  } catch (error) {
    console.error("Subscription fetch error:", error);
    return "free";
  } finally {
    await client.close();
  }
}

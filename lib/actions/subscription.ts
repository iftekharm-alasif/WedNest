
import "server-only";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export async function getVendorSubscription(userId: string) {
  if (!ObjectId.isValid(userId)) {
    return "free";
  }

  try {
    const client = await clientPromise;
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
    throw error;
  }
}

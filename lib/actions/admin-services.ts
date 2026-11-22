
"use server";

import { headers } from "next/headers";
import { MongoClient, ObjectId } from "mongodb";
import { auth } from "@/lib/auth";

const client = new MongoClient(process.env.MONGODB_URI as string);
const db = client.db("wednestdb");
const services = db.collection("services");
const users = db.collection("user");

async function checkAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const currentUser = await users.findOne(
    { email: session.user.email },
    { projection: { role: 1 } }
  );

  if (currentUser?.role !== "admin") {
    throw new Error("Admin access required");
  }
}

export async function getAdminServices() {
  try {
    await checkAdmin();

    const data = await services
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return {
      success: true,
      services: data.map((service) => ({
        _id: service._id.toString(),
        serviceName: service.serviceName || "Untitled Service",
        category: service.category || "Uncategorized",
        price: Number(service.price || 0),
        location: service.location || "Not specified",
        description: service.description || "",
        images: Array.isArray(service.images) ? service.images : [],
        status: service.status || "pending",
        isActive: service.isActive === true,
        vendorName: service.vendorName || "Unknown Vendor",
        vendorEmail: service.vendorEmail || "",
        createdAt: service.createdAt
          ? new Date(service.createdAt).toISOString()
          : null,
      })),
    };
  } catch (error) {
    console.error("Get admin services error:", error);

    return {
      success: false,
      message: "Failed to load services",
      services: [],
    };
  }
}

export async function updateServiceStatus(
  serviceId: string,
  status: "approved" | "rejected"
) {
  try {
    await checkAdmin();

    if (!ObjectId.isValid(serviceId)) {
      return { success: false, message: "Invalid service ID" };
    }

    if (!["approved", "rejected"].includes(status)) {
      return { success: false, message: "Invalid service status" };
    }

    const result = await services.updateOne(
      { _id: new ObjectId(serviceId) },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      }
    );

    if (!result.matchedCount) {
      return { success: false, message: "Service not found" };
    }

    return {
      success: true,
      message: `Service ${status} successfully`,
    };
  } catch (error) {
    console.error("Update service status error:", error);

    return {
      success: false,
      message: "Failed to update service status",
    };
  }
}



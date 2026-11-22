
"use server";

import { headers } from "next/headers";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

async function getCollections() {
  const client = await clientPromise;
  const db = client.db("wednestdb");

  return {
    services: db.collection("services"),
    users: db.collection("user"),
  };
}

async function checkAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const { users } = await getCollections();

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

    const { services } = await getCollections();

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

    const { services } = await getCollections();

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

export async function deleteAdminService(serviceId: string) {
  try {
    await checkAdmin();

    const { services } = await getCollections();

    if (!ObjectId.isValid(serviceId)) {
      return {
        success: false,
        message: "Invalid service ID",
      };
    }

    const result = await services.deleteOne({
      _id: new ObjectId(serviceId),
    });

    if (result.deletedCount === 0) {
      return {
        success: false,
        message: "Service not found",
      };
    }

    return {
      success: true,
      message: "Service deleted successfully",
    };
  } catch (error) {
    console.error("Delete Admin Service Error:", error);

    return {
      success: false,
      message: "Failed to delete service",
    };
  }
}
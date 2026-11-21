
"use server";

import { headers } from "next/headers";
import { ObjectId } from "mongodb";
import { MongoClient } from "mongodb";
import { auth } from "@/lib/auth";

const client = new MongoClient(process.env.MONGODB_URI as string);
const db = client.db("wednestdb");
const users = db.collection("user");

type UserRole = "admin" | "vendor" | "customer";


async function checkAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("No active session");
  }

  const currentUser = await users.findOne(
    { email: session.user.email },
    { projection: { email: 1, role: 1 } }
  );

  console.log("Logged-in email:", session.user.email);
  console.log("Database user:", currentUser);

  if (!currentUser) {
    throw new Error(`User not found in database: ${session.user.email}`);
  }

  if (currentUser.role !== "admin") {
    throw new Error(`Current database role is: ${currentUser.role}`);
  }

  return session;
}


export async function getAdminUsers() {
  try {
    await checkAdmin();

    const data = await users
      .find(
        {},
        {
          projection: {
            name: 1,
            email: 1,
            image: 1,
            role: 1,
            businessName: 1,
            subscriptionPlan: 1,
            createdAt: 1,
          },
        }
      )
      .sort({ createdAt: -1 })
      .toArray();

    return {
      success: true,
      users: data.map((user) => ({
        _id: user._id.toString(),
        name: user.name || "Unknown User",
        email: user.email || "",
        image: user.image || "",
        role: user.role || "customer",
        businessName: user.businessName || "",
        subscriptionPlan: user.subscriptionPlan || "free",
        createdAt: user.createdAt
          ? new Date(user.createdAt).toISOString()
          : null,
      })),
    };
} catch (error) {
  console.error("Get users error:", error);

  return {
    success: false,
    message: error instanceof Error ? error.message : "Failed to load users",
    users: [],
  };
}
}

export async function updateUserRole(
  userId: string,
  newRole: UserRole
) {
  try {
    const session = await checkAdmin();

    if (!ObjectId.isValid(userId)) {
      return { success: false, message: "Invalid user ID" };
    }

    if (!["admin", "vendor", "customer"].includes(newRole)) {
      return { success: false, message: "Invalid role" };
    }

    const targetUser = await users.findOne({
      _id: new ObjectId(userId),
    });

    if (!targetUser) {
      return { success: false, message: "User not found" };
    }

    if (
      targetUser.email?.toLowerCase() ===
        session.user.email.toLowerCase() &&
      newRole !== "admin"
    ) {
      return {
        success: false,
        message: "You cannot remove your own admin role",
      };
    }

    if (targetUser.role === "admin" && newRole !== "admin") {
      const adminCount = await users.countDocuments({ role: "admin" });

      if (adminCount <= 1) {
        return {
          success: false,
          message: "At least one admin account must remain",
        };
      }
    }

    await users.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { role: newRole, updatedAt: new Date() } }
    );

    return {
      success: true,
      message: "User role updated successfully",
    };
  } catch (error) {
    console.error("Update role error:", error);

    return {
      success: false,
      message: "Failed to update user role",
    };
  }
}


"use server";

import { headers } from "next/headers";
import { ObjectId } from "mongodb";
import { MongoClient } from "mongodb";
import { auth } from "@/lib/auth";

const client = new MongoClient(process.env.MONGODB_URI as string);
const db = client.db("wednestdb");
const users = db.collection("user");
const sessions = db.collection("session");
const accounts = db.collection("account");

type UserRole = "admin" | "vendor" | "customer";

async function checkAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("No active session");

  const currentUser = await users.findOne({
    email: session.user.email,
  });

  if (!currentUser || currentUser.role !== "admin") {
    throw new Error("Admin access required");
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
            isBanned: 1,
            banReason: 1,
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
        isBanned: user.isBanned === true,
        banReason: user.banReason || "",
      })),
    };
  } catch (error) {
    console.error("Get users error:", error);
    return {
      success: false,
      message: "Failed to load users",
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

    const target = await users.findOne({
      _id: new ObjectId(userId),
    });

    if (!target) {
      return { success: false, message: "User not found" };
    }

    if (
      target.email?.toLowerCase() === session.user.email.toLowerCase() &&
      newRole !== "admin"
    ) {
      return {
        success: false,
        message: "You cannot remove your own admin role",
      };
    }

    if (target.role === "admin" && newRole !== "admin") {
      const count = await users.countDocuments({ role: "admin" });
      if (count <= 1) {
        return {
          success: false,
          message: "At least one admin must remain",
        };
      }
    }

    await users.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { role: newRole, updatedAt: new Date() } }
    );

    return { success: true, message: "User role updated successfully" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to update user role" };
  }
}

export async function banUser(userId: string) {
  try {
    const session = await checkAdmin();

    if (!ObjectId.isValid(userId)) {
      return { success: false, message: "Invalid user ID" };
    }

    const target = await users.findOne({
      _id: new ObjectId(userId),
    });

    if (!target) {
      return { success: false, message: "User not found" };
    }

    if (target.email?.toLowerCase() === session.user.email.toLowerCase()) {
      return { success: false, message: "You cannot ban your own account" };
    }

    if (target.role === "admin") {
      const count = await users.countDocuments({ role: "admin" });
      if (count <= 1) {
        return {
          success: false,
          message: "You cannot ban the last admin",
        };
      }
    }

    await users.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          isBanned: true,
          banReason: "Banned by administrator",
          bannedAt: new Date(),
        },
      }
    );

    // Revoke all existing sessions
    await sessions.deleteMany({ userId: target._id.toString() });

    return { success: true, message: "User banned successfully" };
  } catch (error) {
    console.error("Ban user error:", error);
    return { success: false, message: "Failed to ban user" };
  }
}

export async function unbanUser(userId: string) {
  try {
    await checkAdmin();

    if (!ObjectId.isValid(userId)) {
      return { success: false, message: "Invalid user ID" };
    }

    const result = await users.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: { isBanned: false },
        $unset: { banReason: "", bannedAt: "" },
      }
    );

    if (!result.matchedCount) {
      return { success: false, message: "User not found" };
    }

    return { success: true, message: "User unbanned successfully" };
  } catch (error) {
    console.error("Unban user error:", error);
    return { success: false, message: "Failed to unban user" };
  }
}

export async function deleteUser(userId: string) {
  try {
    const session = await checkAdmin();

    if (!ObjectId.isValid(userId)) {
      return { success: false, message: "Invalid user ID" };
    }

    const target = await users.findOne({
      _id: new ObjectId(userId),
    });

    if (!target) {
      return { success: false, message: "User not found" };
    }

    if (target.email?.toLowerCase() === session.user.email.toLowerCase()) {
      return { success: false, message: "You cannot delete your own account" };
    }

    if (target.role === "admin") {
      const count = await users.countDocuments({ role: "admin" });
      if (count <= 1) {
        return {
          success: false,
          message: "You cannot delete the last admin",
        };
      }
    }

    const targetId = target._id.toString();

    await Promise.all([
      sessions.deleteMany({ userId: targetId }),
      accounts.deleteMany({ userId: targetId }),
    ]);

    await users.deleteOne({ _id: target._id });

    return { success: true, message: "User deleted successfully" };
  } catch (error) {
    console.error("Delete user error:", error);
    return { success: false, message: "Failed to delete user" };
  }
}

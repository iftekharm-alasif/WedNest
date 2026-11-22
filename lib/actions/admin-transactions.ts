
"use server";

import { headers } from "next/headers";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

async function getCollections() {
  const client = await clientPromise;
  const db = client.db("wednestdb");

  return {
    users: db.collection("user"),
    transactions: db.collection("transactions"),
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
    {
      email: session.user.email,
      role: "admin",
      isBanned: { $ne: true },
    },
    {
      projection: { _id: 1 },
    }
  );

  if (!currentUser) {
    throw new Error("Only active admins can view transactions");
  }

  return session;
}

export async function getAdminTransactions() {
  try {
    await checkAdmin();

    const { users, transactions } = await getCollections();

    const data = await transactions
      .find(
        {},
        {
          projection: {
            vendorId: 1,
            vendorName: 1,
            vendorEmail: 1,
            plan: 1,
            amount: 1,
            currency: 1,
            status: 1,
            stripeSessionId: 1,
            stripeSubscriptionId: 1,
            createdAt: 1,
          },
        }
      )
      .sort({ createdAt: -1 })
      .toArray();

    console.log("Total transaction documents:", data.length);

    const vendorIds = data
      .map((item) => item.vendorId)
      .filter((id) => id && ObjectId.isValid(id.toString()))
      .map((id) => new ObjectId(id.toString()));

    const vendorData =
      vendorIds.length > 0
        ? await users
            .find(
              { _id: { $in: vendorIds } },
              {
                projection: {
                  name: 1,
                  email: 1,
                },
              }
            )
            .toArray()
        : [];

    const vendorMap = new Map(
      vendorData.map((vendor) => [
        vendor._id.toString(),
        {
          name: vendor.name || "Unknown Vendor",
          email: vendor.email || "",
        },
      ])
    );

    const formattedTransactions = data.map((item) => {
      const vendorId = item.vendorId?.toString() || "";
      const vendor = vendorMap.get(vendorId);

      let status = String(item.status || "pending").toLowerCase();

      if (status === "paid" || status === "succeeded") {
        status = "completed";
      }

      if (status === "canceled") {
        status = "cancelled";
      }

      if (
        !["completed", "pending", "failed", "cancelled"].includes(status)
      ) {
        status = "pending";
      }

      return {
        _id: item._id.toString(),
        vendorId,
        vendorName: vendor?.name || item.vendorName || "Unknown Vendor",
        vendorEmail: vendor?.email || item.vendorEmail || "",
        plan: item.plan || "Premium",
        amount: Number(item.amount || 0),
        currency: String(item.currency || "bdt").toUpperCase(),
        status,
        stripeSessionId: item.stripeSessionId || "",
        stripeSubscriptionId: item.stripeSubscriptionId || "",
        createdAt: item.createdAt
          ? new Date(item.createdAt).toISOString()
          : null,
      };
    });

    const stats = {
      total: formattedTransactions.length,
      completed: formattedTransactions.filter(
        (item) => item.status === "completed"
      ).length,
      pending: formattedTransactions.filter(
        (item) => item.status === "pending"
      ).length,
      failed: formattedTransactions.filter(
        (item) => item.status === "failed"
      ).length,
      cancelled: formattedTransactions.filter(
        (item) => item.status === "cancelled"
      ).length,
      revenue: formattedTransactions
        .filter((item) => item.status === "completed")
        .reduce((total, item) => total + item.amount, 0),
    };

    return {
      success: true,
      transactions: formattedTransactions,
      stats,
    };
  } catch (error) {
    console.error("Get admin transactions error:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to load transactions",
      transactions: [],
      stats: {
        total: 0,
        completed: 0,
        pending: 0,
        failed: 0,
        cancelled: 0,
        revenue: 0,
      },
    };
  }
}

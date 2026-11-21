
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { MongoClient, ObjectId } from "mongodb";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function Success({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  let paymentCompleted = false;
  const client = new MongoClient(process.env.MONGODB_URI as string);

  try {
    if (!session_id) {
      throw new Error("Missing session ID");
    }

    // Verify Stripe checkout session
    const checkoutSession =
      await stripe.checkout.sessions.retrieve(session_id);

    if (
      checkoutSession.status !== "complete" ||
      checkoutSession.payment_status !== "paid" ||
      checkoutSession.mode !== "subscription"
    ) {
      throw new Error("Payment not completed");
    }

    const vendorId = checkoutSession.metadata?.vendorId;

    if (!vendorId || !ObjectId.isValid(vendorId)) {
      throw new Error("Invalid vendor ID");
    }

    const subscriptionId =
      typeof checkoutSession.subscription === "string"
        ? checkoutSession.subscription
        : checkoutSession.subscription?.id;

    if (!subscriptionId) {
      throw new Error("Subscription ID missing");
    }

    // Verify subscription
    const subscription =
      await stripe.subscriptions.retrieve(subscriptionId);

    if (
      subscription.status !== "active" &&
      subscription.status !== "trialing"
    ) {
      throw new Error("Subscription is not active");
    }

    const timestamps = subscription.items.data
      .map((item) => Number(item.current_period_end))
      .filter((timestamp) => Number.isFinite(timestamp) && timestamp > 0);

    if (timestamps.length === 0) {
      throw new Error("Subscription expiry not found");
    }

    const expiryDate = new Date(Math.max(...timestamps) * 1000);

    // Connect MongoDB
    await client.connect();

    const db = client.db("wednestdb");
    const users = db.collection("user");
    const transactions = db.collection("transactions");

    const vendorObjectId = new ObjectId(vendorId);

    const vendor = await users.findOne({
      _id: vendorObjectId,
      role: "vendor",
    });

    if (!vendor) {
      throw new Error("Vendor not found");
    }

    // Activate Premium
    const result = await users.updateOne(
      {
        _id: vendorObjectId,
        role: "vendor",
      },
      {
        $set: {
          subscriptionPlan: "premium",
          subscriptionExpiresAt: expiryDate,
          stripeSubscriptionId: subscription.id,
        },
      }
    );

    if (result.matchedCount === 0) {
      throw new Error("Vendor update failed");
    }

    // Save transaction (prevents duplicate records)
    await transactions.updateOne(
      {
        stripeSessionId: checkoutSession.id,
      },
      {
        $set: {
          vendorId: vendorObjectId,
          vendorName: vendor.name || "Unknown Vendor",
          vendorEmail: vendor.email || "",
          plan: "premium",
          amount: (checkoutSession.amount_total || 0) / 100,
          amountInMinor: checkoutSession.amount_total || 0,
          currency: (checkoutSession.currency || "usd").toUpperCase(),
          status: "completed",
          stripeSessionId: checkoutSession.id,
          stripeSubscriptionId: subscription.id,
        },
        $setOnInsert: {
          createdAt: new Date(checkoutSession.created * 1000),
        },
      },
      { upsert: true }
    );

    console.log("Transaction saved:", checkoutSession.id);
    console.log("PREMIUM ACTIVATED:", vendorId);

    paymentCompleted = true;
  } catch (error) {
    console.error("Payment verification error:", error);
  } finally {
    await client.close();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF7F5] px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-lg">
        {paymentCompleted ? (
          <>
            <CheckCircle2 className="mx-auto mb-5 h-16 w-16 text-green-600" />
            <h1 className="text-3xl font-bold text-[#A65D55]">
              Payment Successful!
            </h1>
            <p className="mt-4 text-gray-600">
              Your Premium subscription is now active.
            </p>
          </>
        ) : (
          <>
            <XCircle className="mx-auto mb-5 h-16 w-16 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-800">
              Payment Verification Failed
            </h1>
            <p className="mt-4 text-gray-600">
              Your subscription could not be activated. Please contact support.
            </p>
          </>
        )}

        <Link
          href="/dashboard/vendor"
          className="mt-8 inline-block rounded-lg bg-[#A65D55] px-6 py-3 font-medium text-white"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

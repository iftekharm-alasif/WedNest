
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { MongoClient, ObjectId } from "mongodb";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

const client = new MongoClient(process.env.MONGODB_URI as string);
const db = client.db("wednestdb");

const users = db.collection("user");
const transactions = db.collection("transactions");

function getSubscriptionExpiry(subscription: Stripe.Subscription) {
  const timestamps = subscription.items.data
    .map((item) => Number(item.current_period_end))
    .filter((timestamp) => Number.isFinite(timestamp) && timestamp > 0);

  if (timestamps.length === 0) return null;

  return new Date(Math.max(...timestamps) * 1000);
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { message: "Missing Stripe signature or secret" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    const body = await request.text();

    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log("WEBHOOK RECEIVED:", event.type);
  } catch (error) {
    console.error("Stripe signature error:", error);

    return NextResponse.json(
      { message: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  try {
    await client.connect();

    let subscription: Stripe.Subscription;
    let vendorId: string | undefined;
    let checkoutSession: Stripe.Checkout.Session | null = null;

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.mode !== "subscription" || !session.subscription) {
        return NextResponse.json({ received: true });
      }

      checkoutSession = session;

      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription.id;

      subscription = await stripe.subscriptions.retrieve(subscriptionId);

      vendorId =
        session.metadata?.vendorId ||
        subscription.metadata?.vendorId;
    } else if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const eventSubscription = event.data.object as Stripe.Subscription;

      subscription = await stripe.subscriptions.retrieve(
        eventSubscription.id
      );

      vendorId = subscription.metadata?.vendorId;
    } else {
      return NextResponse.json({ received: true });
    }

    if (!vendorId || !ObjectId.isValid(vendorId)) {
      console.error("Invalid Vendor ID:", vendorId);

      return NextResponse.json(
        { message: "Invalid vendor ID" },
        { status: 400 }
      );
    }

    const vendorObjectId = new ObjectId(vendorId);

    const vendor = await users.findOne(
      {
        _id: vendorObjectId,
        role: "vendor",
      },
      {
        projection: {
          name: 1,
          email: 1,
        },
      }
    );

    if (!vendor) {
      console.error("Vendor not found:", vendorId);

      return NextResponse.json(
        { message: "Vendor not found" },
        { status: 500 }
      );
    }

    const expiryDate = getSubscriptionExpiry(subscription);

    if (!expiryDate) {
      console.error("Subscription expiry not found:", subscription.id);

      return NextResponse.json(
        { message: "Subscription expiry date not found" },
        { status: 500 }
      );
    }

    // Save transaction for completed checkout.
    if (checkoutSession) {
      const session = checkoutSession;

      const transactionStatus =
        session.payment_status === "paid" ||
        session.payment_status === "no_payment_required"
          ? "completed"
          : "pending";

      await transactions.updateOne(
        {
          stripeSessionId: session.id,
        },
        {
          $set: {
            vendorId: vendorObjectId,
            vendorName: vendor.name || "Unknown Vendor",
            vendorEmail: vendor.email || "",
            plan: session.metadata?.plan || "premium",
            amount: (session.amount_total || 0) / 100,
            amountInMinor: session.amount_total || 0,
            currency: (session.currency || "usd").toUpperCase(),
            status: transactionStatus,
            stripeSessionId: session.id,
            stripeSubscriptionId: subscription.id,
          },
          $setOnInsert: {
            createdAt: new Date(session.created * 1000),
          },
        },
        {
          upsert: true,
        }
      );

      console.log("Transaction saved:", session.id);
    }

    const isActive =
      subscription.status === "active" ||
      subscription.status === "trialing";

    const result = await users.updateOne(
      {
        _id: vendorObjectId,
        role: "vendor",
      },
      {
        $set: {
          subscriptionPlan: isActive ? "premium" : "free",
          subscriptionExpiresAt: expiryDate,
          stripeSubscriptionId: subscription.id,
        },
      }
    );

    console.log("Stripe Event:", event.type);
    console.log("Subscription ID:", subscription.id);
    console.log("Subscription Status:", subscription.status);
    console.log("MongoDB Update Result:", result);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);

    return NextResponse.json(
      { message: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

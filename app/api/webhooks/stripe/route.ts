
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { MongoClient, ObjectId } from "mongodb";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

const client = new MongoClient(process.env.MONGODB_URI as string);
const db = client.db("wednestdb");
const users = db.collection("user");

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
  } catch (error) {
    console.error("Stripe signature error:", error);
    return NextResponse.json(
      { message: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  try {
    let subscription: Stripe.Subscription;
    let vendorId: string | undefined;

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.mode !== "subscription" || !session.subscription) {
        return NextResponse.json({ received: true });
      }

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
      return NextResponse.json({ received: true });
    }

    const expiryDate = getSubscriptionExpiry(subscription);

    if (!expiryDate) {
      console.error("Subscription expiry not found:", subscription.id);
      return NextResponse.json(
        { message: "Subscription expiry date not found" },
        { status: 500 }
      );
    }

    const isActive =
      subscription.status === "active" ||
      subscription.status === "trialing";

    const result = await users.updateOne(
      {
        _id: new ObjectId(vendorId),
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
    console.log("Calculated Expiry:", expiryDate);
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

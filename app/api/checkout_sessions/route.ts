
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { MongoClient, ObjectId } from "mongodb";

import { stripe } from "@/lib/stripe";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  const client = new MongoClient(process.env.MONGODB_URI as string);

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { message: "Please sign in first" },
        { status: 401 }
      );
    }

    const user = session.user as typeof session.user & {
      role?: string;
    };

    if (user.role !== "vendor") {
      return NextResponse.json(
        { message: "Only vendors can purchase Premium" },
        { status: 403 }
      );
    }

    if (!ObjectId.isValid(user.id)) {
      return NextResponse.json(
        { message: "Invalid vendor account" },
        { status: 400 }
      );
    }

    await client.connect();

    const db = client.db("wednestdb");

    const vendor = await db.collection("user").findOne({
      _id: new ObjectId(user.id),
      role: "vendor",
    });

    if (!vendor) {
      return NextResponse.json(
        { message: "Vendor account not found" },
        { status: 404 }
      );
    }

    if (vendor.subscriptionPlan === "premium") {
      return NextResponse.json(
        { message: "You already have Premium subscription." },
        { status: 400 }
      );
    }

    const priceId = process.env.STRIPE_PREMIUM_PRICE_ID;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!priceId || !appUrl) {
      throw new Error("Stripe configuration is missing");
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",

      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],

      customer_email: user.email,

      metadata: {
        vendorId: user.id,
        plan: "premium",
      },

      subscription_data: {
        metadata: {
          vendorId: user.id,
          plan: "premium",
        },
      },

      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/dashboard/vendor/subscription`,
    });

    return NextResponse.json({
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);

    return NextResponse.json(
      { message: "Unable to create checkout session" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

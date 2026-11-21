
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export default async function Success({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  let paymentCompleted = false;

  try {
    if (!session_id) {
      throw new Error("Missing session ID");
    }

    const checkoutSession =
      await stripe.checkout.sessions.retrieve(session_id);

    if (
      checkoutSession.status !== "complete" ||
      checkoutSession.payment_status !== "paid" ||
      checkoutSession.mode !== "subscription"
    ) {
      throw new Error("Payment not completed");
    }

    const subscriptionId =
      typeof checkoutSession.subscription === "string"
        ? checkoutSession.subscription
        : checkoutSession.subscription?.id;

    if (!subscriptionId) {
      throw new Error("Subscription ID missing");
    }

    const subscription =
      await stripe.subscriptions.retrieve(subscriptionId);

    if (
      subscription.status !== "active" &&
      subscription.status !== "trialing"
    ) {
      throw new Error("Subscription is not active");
    }

    paymentCompleted = true;
  } catch (error) {
    console.error("Payment verification error:", error);
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

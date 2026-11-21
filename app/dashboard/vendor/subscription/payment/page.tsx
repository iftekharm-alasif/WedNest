
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Crown,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function SubscriptionPaymentPage() {
  const { data: session } = authClient.useSession();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!session?.user?.id) {
      toast.error("Please sign in first");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${BASE_URL}/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            vendorId: session.user.id,
            email: session.user.email,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.url) {
        toast.error(result.message || "Unable to start payment");
        return;
      }

      window.location.href = result.url;
    } catch (error) {
      console.error("Payment Error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <Link
          href="/dashboard/vendor/subscription"
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#A65D55]"
        >
          <ArrowLeft size={17} />
          Back to Subscription
        </Link>

        <p className="text-sm font-semibold text-[#A65D55]">
          WEDNEST PREMIUM
        </p>

        <h1 className="mt-2 text-3xl font-bold text-gray-800">
          Complete Your Subscription
        </h1>

        <p className="mt-2 text-gray-500">
          Upgrade your business and unlock unlimited service listings.
        </p>
      </div>

      <div className="grid gap-7 lg:grid-cols-5">
        {/* Payment Information */}
        <div className="space-y-6 lg:col-span-3">
          <div className="rounded-2xl border border-[#F0E5E1] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-[#F8EFED] text-[#A65D55]">
                <CreditCard size={22} />
              </div>

              <div>
                <h2 className="font-bold text-gray-800">
                  Payment Method
                </h2>
                <p className="text-sm text-gray-500">
                  Secure payment powered by Stripe
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-[#F0E5E1] bg-[#FFFCFB] p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-lg bg-white text-[#635BFF] shadow-sm">
                  <CreditCard size={25} />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800">
                    Stripe Checkout
                  </h3>
                  <p className="text-xs text-gray-500">
                    Credit or debit card
                  </p>
                </div>

                <div className="ml-auto">
                  <CheckCircle2 className="text-green-600" size={21} />
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-gray-500">
                You will be redirected to Stripes secure checkout page
                to complete your payment. Your card information will
                not be stored on WedNest.
              </p>
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-xl bg-gray-50 p-4">
              <ShieldCheck
                className="mt-0.5 shrink-0 text-green-600"
                size={21}
              />

              <p className="text-sm leading-6 text-gray-600">
                Secure checkout. Payment information is handled by
                Stripe.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#F0E5E1] bg-white p-6 shadow-sm">
            <h2 className="font-bold text-gray-800">
              What You Will Get
            </h2>

            <div className="mt-5 space-y-4">
              {[
                "Unlimited Active Services",
                "Premium Vendor Badge",
                "Booking Request Management",
                "All Free Plan Features",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <CheckCircle2
                    size={19}
                    className="shrink-0 text-green-600"
                  />
                  <span className="text-sm text-gray-600">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="sticky top-6 rounded-2xl border border-[#F0E5E1] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-[#F8EFED] text-[#A65D55]">
                <Crown size={25} />
              </div>

              <div>
                <h2 className="font-bold text-gray-800">
                  Premium Plan
                </h2>
                <p className="text-sm text-gray-500">
                  Yearly Subscription
                </p>
              </div>
            </div>

            <div className="my-6 rounded-xl bg-[#FFFCFB] p-5">
              <p className="text-sm text-gray-500">
                Subscription Price
              </p>

              <div className="mt-2 flex items-end gap-2">
                <span className="text-4xl font-bold text-[#A65D55]">
                  $30
                </span>
                <span className="pb-1 text-sm text-gray-500">
                  / year
                </span>
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Billed Yearly until cancelled.
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Premium Plan</span>
                <span>$30.00</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>Calculated at checkout</span>
              </div>

              <div className="border-t border-dashed border-[#E8D9D4] pt-4">
                <div className="flex justify-between font-bold text-gray-800">
                  <span>Total</span>
                  <span className="text-[#A65D55]">$30.00/year</span>
                </div>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading || !session?.user?.id}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#A65D55] px-5 py-3.5 font-semibold text-white transition hover:bg-[#8f4d46] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                "Redirecting..."
              ) : (
                <>
                  Continue to Payment
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-gray-400">
              By continuing, you agree to the WedNest subscription
              terms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

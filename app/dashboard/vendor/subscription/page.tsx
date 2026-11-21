"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Check, Crown, Sparkles, LoaderCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"

const SubscriptioPage = () => {
  const { data: session, isPending } = authClient.useSession()
  const [loading, setLoading] = useState(false)

  const user = session?.user as
    (typeof session.user & { subscriptionPlan?: string }) | undefined

  const plan = user?.subscriptionPlan || "free"

  const handleUpgrade = async () => {
    try {
      setLoading(true)

      // Stripe Checkout integration will be added here.
      toast.info("Premium payment is not available yet.")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (isPending) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <LoaderCircle className="animate-spin text-[#A65D55]" size={28} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <Link
          href="/dashboard/vendor/profile"
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#A65D55]"
        >
          <ArrowLeft size={16} />
          Back to Profile
        </Link>

        <h1 className="text-2xl font-bold text-gray-800">Subscription Plans</h1>
        <p className="mt-2 text-sm text-gray-500">
          Choose the right plan to grow your wedding business with WedNest.
        </p>
      </div>

      <div className="grid gap-7 md:grid-cols-2">
        {/* Free Plan */}
        <div className="rounded-2xl border border-[#F0E5E1] bg-white p-7 shadow-sm">
          <div className="mb-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
              <Sparkles size={24} />
            </div>

            <h2 className="text-xl font-bold text-gray-800">Free Plan</h2>

            <div className="mt-3">
              <span className="text-4xl font-bold text-gray-800">$0</span>
              <span className="ml-2 text-sm text-gray-500">Forever</span>
            </div>

            <p className="mt-2 text-sm text-gray-500">
              Perfect for getting started.
            </p>
          </div>

          <div className="mb-7 space-y-4">
            {[
              "Maximum 3 Active Services",
              "Basic Vendor Dashboard",
              "Booking Request Management",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <Check className="text-green-600" size={18} />
                <span className="text-sm text-gray-600">{feature}</span>
              </div>
            ))}
          </div>

          {plan === "free" ? (
            <div className="rounded-xl bg-gray-100 py-3 text-center text-sm font-semibold text-gray-600">
              Your Current Plan
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 py-3 text-center text-sm font-semibold text-gray-500">
              Free Plan
            </div>
          )}
        </div>

        {/* Premium Plan */}
        <div className="relative rounded-2xl border-2 border-[#A65D55] bg-white p-7 shadow-lg">
          <div className="absolute -top-3 right-6 rounded-full bg-[#A65D55] px-4 py-1 text-xs font-semibold text-white">
            Recommended
          </div>

          <div className="mb-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#A65D55]/10 text-[#A65D55]">
              <Crown size={24} />
            </div>

            <h2 className="text-xl font-bold text-gray-800">Premium Plan</h2>
            <span className="text-4xl font-bold text-[#A65D55]">$30</span>
            <span className="ml-2 text-sm text-gray-500">/ year</span>
            <div className="mt-3">
              <span className="text-4xl font-bold text-[#A65D55]">Premium</span>
            </div>

            <p className="mt-2 text-sm text-gray-500">
              Grow your business without limits.
            </p>
          </div>

          <div className="mb-7 space-y-4">
            {[
              "Unlimited Active Services",
              "Premium Vendor Badge",
              "All Free Plan Features",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <Check className="text-green-600" size={18} />
                <span className="text-sm text-gray-600">{feature}</span>
              </div>
            ))}
          </div>

          {plan === "premium" ? (
            <div className="rounded-xl bg-green-50 py-3 text-center text-sm font-semibold text-green-700">
              You are a Premium Vendor
            </div>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#A65D55] py-3.5 text-sm font-semibold text-white transition hover:bg-[#884840] disabled:opacity-60"
            >
              {loading ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <Crown size={18} />
              )}
              {loading ? "Please wait..." : "Upgrade to Premium"}
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-[#F0E5E1] bg-[#FAF7F5] p-5">
        <h3 className="font-semibold text-gray-800">Why choose Premium?</h3>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          Get unlimited active services and a Premium Vendor Badge to showcase
          your business and reach more customers on WedNest.
        </p>
      </div>
    </div>
  )
}

export default SubscriptioPage

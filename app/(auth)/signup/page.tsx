"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import {
  UserRound,
  Store,
  User,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react"

const SignUpPage = () => {
  const router = useRouter()

  const [role, setRole] = useState("customer")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const form = e.currentTarget

    const formData = new FormData(form)

    const userData = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      password: String(formData.get("password") || ""),
      role: role,
    }
    try {
      setLoading(true)
      setError("")

      const { data, error } = await authClient.signUp.email(userData)

      if (error) {
        setError(error.message || "Registration failed. Please try again.")
        return
      }

      console.log("Registration successful:", data)

      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      console.error("Signup error:", err)
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF7F5] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[#F0E5E1] bg-white p-7 shadow-lg sm:p-9">
        <div className="mb-7 text-center">
          <h1 className="text-3xl font-bold text-[#A65D55]">Create Account</h1>
          <p className="mt-2 text-sm text-gray-500">
            Join WedNest and start planning something beautiful
          </p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="mb-3 block text-sm font-semibold text-gray-700">
              Create account as
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("customer")}
                className={`relative rounded-xl border p-4 text-center transition ${
                  role === "customer"
                    ? "border-[#A65D55] bg-[#A65D55]/5 text-[#A65D55]"
                    : "border-gray-200 text-gray-600 hover:border-[#D6A69D]"
                }`}
              >
                {role === "customer" && (
                  <CheckCircle2 size={17} className="absolute top-2 right-2" />
                )}

                <UserRound className="mx-auto mb-2" size={25} />
                <p className="font-semibold">Customer</p>
                <p className="mt-1 text-xs">Plan your wedding</p>
              </button>

              <button
                type="button"
                onClick={() => setRole("vendor")}
                className={`relative rounded-xl border p-4 text-center transition ${
                  role === "vendor"
                    ? "border-[#A65D55] bg-[#A65D55]/5 text-[#A65D55]"
                    : "border-gray-200 text-gray-600 hover:border-[#D6A69D]"
                }`}
              >
                {role === "vendor" && (
                  <CheckCircle2 size={17} className="absolute top-2 right-2" />
                )}

                <Store className="mx-auto mb-2" size={25} />
                <p className="font-semibold">Vendor</p>
                <p className="mt-1 text-xs">Offer your services</p>
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Full Name
            </label>

            <div className="flex items-center rounded-lg border border-gray-200 px-3 focus-within:border-[#A65D55]">
              <User size={18} className="text-gray-400" />

              <input
                name="name"
                type="text"
                placeholder="Enter your full name"
                className="h-11 w-full bg-transparent px-3 text-sm outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email Address
            </label>

            <div className="flex items-center rounded-lg border border-gray-200 px-3 focus-within:border-[#A65D55]">
              <Mail size={18} className="text-gray-400" />

              <input
                name="email"
                type="email"
                placeholder="Enter your email"
                className="h-11 w-full bg-transparent px-3 text-sm outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>

            <div className="flex items-center rounded-lg border border-gray-200 px-3 focus-within:border-[#A65D55]">
              <LockKeyhole size={18} className="text-gray-400" />

              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                minLength={8}
                className="h-11 w-full bg-transparent px-3 text-sm outline-none"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <label className="flex items-start gap-2 text-xs leading-5 text-gray-500">
            <input type="checkbox" className="mt-1 accent-[#A65D55]" required />
            I agree to the Terms of Service and Privacy Policy.
          </label>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#A65D55] py-3 font-semibold text-white transition hover:bg-[#884840] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Creating Account..."
              : `Create ${role === "customer" ? "Customer" : "Vendor"} Account`}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href="/signin"
            className="font-semibold text-[#A65D55] hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}

export default SignUpPage


"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  UserRound,
  Store,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";

const SignInPage = () => {
  const router = useRouter();

  const [role, setRole] = useState("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");





const handleSignIn = async (e) => {
  e.preventDefault();

  const form = e.target;

  try {
    setLoading(true);
    setError("");

    const { data, error } = await authClient.signIn.email({
      email: form.email.value.trim(),
      password: form.password.value,
    });

    if (error) {
      setError(error.message);
      return;
    }

    router.replace("/dashboard");
    router.refresh();

  } catch (err) {
    console.error("Login error:", err);
    setError("Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF7F5] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[#F0E5E1] bg-white p-7 shadow-lg sm:p-9">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#A65D55]">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to continue your WedNest journey
          </p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-5">
          <div>
            <label className="mb-3 block text-sm font-semibold text-gray-700">
              Sign in as
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
                  <CheckCircle2
                    size={17}
                    className="absolute right-2 top-2"
                  />
                )}
                <UserRound className="mx-auto mb-2" size={25} />
                <span className="font-semibold">Customer</span>
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
                  <CheckCircle2
                    size={17}
                    className="absolute right-2 top-2"
                  />
                )}
                <Store className="mx-auto mb-2" size={25} />
                <span className="font-semibold">Vendor</span>
              </button>
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
                className="h-12 w-full bg-transparent px-3 text-sm outline-none"
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
                placeholder="Enter your password"
                className="h-12 w-full bg-transparent px-3 text-sm outline-none"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-600">
              <input
                type="checkbox"
                className="accent-[#A65D55]"
              />
              Remember me
            </label>

            <Link
              href="/forgot-password"
              className="font-medium text-[#A65D55] hover:underline"
            >
              Forgot password?
            </Link>
          </div>

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
              ? "Signing In..."
              : `Sign In as ${role === "customer" ? "Customer" : "Vendor"}`}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-gray-500">
          Dont have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-[#A65D55] hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignInPage;

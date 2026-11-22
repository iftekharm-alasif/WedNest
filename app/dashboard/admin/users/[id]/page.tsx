"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  UserRound,
  Mail,
  Store,
  ShieldCheck,
  CalendarDays,
  CreditCard,
  LoaderCircle,
  Ban,
  Hash,
} from "lucide-react"
import { getAdminUsers } from "@/lib/actions/users"

type User = {
  _id: string
  name: string
  email: string
  image?: string
  role: "admin" | "vendor" | "customer"
  businessName?: string
  subscriptionPlan?: string
  createdAt?: string | null
  isBanned?: boolean
  banReason?: string
}

export default function AdminUserDetailsPage() {
  const params = useParams<{ id: string }>()
  const userId = params.id

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true)

      const result = await getAdminUsers()

      if (result.success) {
        const foundUser = (result.users as User[]).find(
          (item) => item._id === userId
        )

        if (foundUser) {
          setUser(foundUser)
        } else {
          setError("User not found.")
        }
      } else {
        setError(result.message || "Failed to load user details.")
      }

      setLoading(false)
    }

    if (userId) {
      loadUser()
    }
  }, [userId])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoaderCircle size={32} className="animate-spin text-[#A65D55]" />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="space-y-5 p-6">
        <Link
          href="/dashboard/admin/users"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#A65D55]"
        >
          <ArrowLeft size={17} />
          Back to Users
        </Link>

        <div className="rounded-2xl border border-red-100 bg-white p-8 text-center">
          <p className="font-semibold text-red-600">
            {error || "User not found."}
          </p>
        </div>
      </div>
    )
  }

  const details = [
    {
      label: "Full Name",
      value: user.name || "N/A",
      icon: UserRound,
    },
    {
      label: "Email Address",
      value: user.email || "N/A",
      icon: Mail,
    },
    {
      label: "Account Role",
      value: user.role || "N/A",
      icon: ShieldCheck,
    },
    {
      label: "Business Name",
      value: user.businessName || "Not provided",
      icon: Store,
    },
    {
      label: "Subscription Plan",
      value: user.subscriptionPlan || "Free",
      icon: CreditCard,
    },
    {
      label: "Joined Date",
      value: user.createdAt
        ? new Date(user.createdAt).toLocaleDateString()
        : "N/A",
      icon: CalendarDays,
    },
    {
      label: "Account ID",
      value: user._id,
      icon: Hash,
    },
  ]

  return (
    <div className="min-h-screen space-y-7 bg-[#FAF8F7] p-4 sm:p-6 lg:p-8">
      <div>
        <Link
          href="/dashboard/admin/users"
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#A65D55] transition hover:text-[#87473F]"
        >
          <ArrowLeft size={17} />
          Back to Users
        </Link>

        <div className="flex items-center gap-2 text-sm font-medium text-[#A65D55]">
          <ShieldCheck size={17} />
          Admin Management
        </div>

        <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
          User Details
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          View complete information about this platform user.
        </p>
      </div>

      {/* Profile Card */}
      <div className="rounded-2xl border border-[#F0E5E1] bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col items-center gap-5 sm:flex-row">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="h-24 w-24 rounded-full border-4 border-[#FFF1ED] object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#FFF1ED] text-3xl font-bold text-[#A65D55]">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          )}

          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>

            <p className="mt-1 text-sm text-gray-500">{user.email}</p>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="rounded-full border border-[#F0E5E1] bg-[#FFF1ED] px-3 py-1 text-xs font-semibold text-[#A65D55] capitalize">
                {user.role}
              </span>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  user.isBanned
                    ? "bg-red-50 text-red-600"
                    : "bg-green-50 text-green-700"
                }`}
              >
                {user.isBanned ? "Banned Account" : "Active Account"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* User Information */}
      <div className="rounded-2xl border border-[#F0E5E1] bg-white p-6 shadow-sm sm:p-8">
        <h2 className="mb-6 text-lg font-bold text-gray-900">
          Account Information
        </h2>

        <div className="grid gap-5 sm:grid-cols-2">
          {details.map((item) => {
            const Icon = item.icon

            return (
              <div
                key={item.label}
                className="rounded-xl border border-[#F3EEEC] bg-[#FFFCFB] p-4"
              >
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Icon size={16} className="text-[#A65D55]" />
                  {item.label}
                </div>

                <p className="mt-2 text-sm font-semibold break-all text-gray-900 capitalize">
                  {item.value}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Ban Information */}
      {user.isBanned && (
        <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-red-600">
            <Ban size={19} />
            <h2 className="font-bold">Account Ban Information</h2>
          </div>

          <p className="mt-3 text-sm text-gray-600">
            {user.banReason || "No ban reason provided."}
          </p>
        </div>
      )}
    </div>
  )
}


import Link from "next/link"
import { requireDashboardRole } from "@/lib/dashboard-auth"
import { getServices } from "@/lib/actions/services"
import {
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  XCircle,
  Plus,
  ArrowUpRight,
  CalendarCheck,
  Crown,
  UserRound,
  Sparkles,
} from "lucide-react"

type Service = {
  _id: string
  vendorId: string
  serviceName: string
  status: string
  isActive: boolean
  createdAt: string
}

export default async function VendorDashboard() {
  const session = await requireDashboardRole("vendor")

  let services: Service[] = []

  try {
    const result = await getServices()
    services = result.filter(
      (item: Service) => item.vendorId === session.user.id
    )
  } catch {
    services = []
  }

  const totalServices = services.length
  const approvedServices = services.filter(
    (item) => item.status === "approved"
  ).length
  const pendingServices = services.filter(
    (item) => item.status === "pending"
  ).length
  const rejectedServices = services.filter(
    (item) => item.status === "rejected"
  ).length

  const stats = [
    {
      title: "Total Services",
      value: totalServices,
      icon: BriefcaseBusiness,
      color: "bg-[#F8EFED] text-[#A65D55]",
    },
    {
      title: "Approved Services",
      value: approvedServices,
      icon: CheckCircle2,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Pending Approval",
      value: pendingServices,
      icon: Clock3,
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Rejected Services",
      value: rejectedServices,
      icon: XCircle,
      color: "bg-red-50 text-red-500",
    },
  ]

  const recentServices = [...services]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, 5)

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#A65D55] to-[#884840] p-7 text-white shadow-sm sm:p-9">
        <div className="relative z-10 max-w-2xl">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium">
            <Sparkles size={14} />
            Vendor Overview
          </span>

          <h1 className="text-2xl font-bold sm:text-3xl">
            Welcome back, {session.user.name}!
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/80 sm:text-base">
            Here is an overview of your wedding business. Keep track of your
            services and manage your business with WedNest.
          </p>

          <Link
            href="/dashboard/vendor/add-service"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#A65D55] transition hover:bg-[#F8EFED]"
          >
            <Plus size={17} />
            Add New Service
          </Link>
        </div>

        <div className="pointer-events-none absolute -right-12 -top-16 size-64 rounded-full border-[35px] border-white/10" />
        <div className="pointer-events-none absolute -bottom-28 right-28 size-64 rounded-full bg-white/5" />
      </div>

      {/* Statistics */}
      <section>
        <div className="mb-5">
          <h2 className="text-xl font-bold text-gray-800">
            Business Overview
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Your service performance at a glance.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon

            return (
              <div
                key={item.title}
                className="rounded-2xl border border-[#F0E5E1] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className={`flex size-12 items-center justify-center rounded-xl ${item.color}`}>
                    <Icon size={23} />
                  </div>
                  <ArrowUpRight size={18} className="text-gray-300" />
                </div>

                <p className="mt-5 text-3xl font-bold text-gray-800">
                  {item.value}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {item.title}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Recent Services */}
      <section className="rounded-2xl border border-[#F0E5E1] bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Recent Services
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Your latest added wedding services.
            </p>
          </div>

          <Link
            href="/dashboard/vendor/services"
            className="whitespace-nowrap text-sm font-semibold text-[#A65D55] hover:underline"
          >
            View All →
          </Link>
        </div>

        {recentServices.length === 0 ? (
          <div className="py-10 text-center">
            <BriefcaseBusiness
              size={35}
              className="mx-auto mb-3 text-[#D6A69D]"
            />
            <p className="font-medium text-gray-700">
              No services added yet
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Add your first service to get started.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#F0E5E1]">
            {recentServices.map((item) => (
              <div
                key={item._id}
                className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"
              >
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {item.serviceName}
                  </h3>
                  <p className="mt-1 text-xs text-gray-400">
                    Added{" "}
                    {new Date(item.createdAt).toLocaleDateString("en-GB")}
                  </p>
                </div>

                <span
                  className={`w-fit rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                    item.status === "approved"
                      ? "bg-green-50 text-green-700"
                      : item.status === "pending"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-red-50 text-red-600"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick Access */}
      <section>
        <div className="mb-5">
          <h2 className="text-xl font-bold text-gray-800">
            Quick Access
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Quickly access your important dashboard sections.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "My Services",
              description: "Manage your services",
              href: "/dashboard/vendor/services",
              icon: BriefcaseBusiness,
            },
            {
              title: "Bookings",
              description: "Manage booking requests",
              href: "/dashboard/vendor/bookings",
              icon: CalendarCheck,
            },
            {
              title: "Subscription",
              description: "Manage your plan",
              href: "/dashboard/vendor/subscription",
              icon: Crown,
            },
            {
              title: "My Profile",
              description: "Update business profile",
              href: "/dashboard/vendor/profile",
              icon: UserRound,
            },
          ].map((item) => {
            const Icon = item.icon

            return (
              <Link
                key={item.title}
                href={item.href}
                className="group flex items-center gap-4 rounded-2xl border border-[#F0E5E1] bg-white p-4 transition hover:border-[#D6A69D] hover:shadow-md"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#F8EFED] text-[#A65D55] transition group-hover:bg-[#A65D55] group-hover:text-white">
                  <Icon size={21} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-800">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    {item.description}
                  </p>
                </div>

                <ArrowUpRight
                  size={17}
                  className="shrink-0 text-gray-300 transition group-hover:text-[#A65D55]"
                />
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}

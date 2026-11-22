import Link from "next/link"
import { MongoClient } from "mongodb"
import { requireDashboardRole } from "@/lib/dashboard-auth"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Users,
  BriefcaseBusiness,
  CreditCard,
  CalendarCheck,
  ArrowUpRight,
  ShieldCheck,
  LayoutDashboard,
} from "lucide-react"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const client = new MongoClient(process.env.MONGODB_URI as string)
const db = client.db("wednestdb")

export default async function AdminDashboard() {
  const session = await requireDashboardRole("admin")

  let stats = {
    users: 0,
    services: 0,
    bookings: 0,
    transactions: 0,
  }

  let statsAvailable = true

  try {
    const [users, services, bookings, transactions] = await Promise.all([
      db.collection("user").countDocuments(),
      db.collection("services").countDocuments(),
      db.collection("bookings").countDocuments(),
      db.collection("transactions").countDocuments(),
    ])

    stats = {
      users,
      services,
      bookings,
      transactions,
    }
  } catch (error) {
    console.error("Admin Statistics Error:", error)
    statsAvailable = false
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.users,
      icon: Users,
      description: "Registered platform users",
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Total Services",
      value: stats.services,
      icon: BriefcaseBusiness,
      description: "Services listed on WedNest",
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Total Bookings",
      value: stats.bookings,
      icon: CalendarCheck,
      description: "Customer service bookings",
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Total Transactions",
      value: stats.transactions,
      icon: CreditCard,
      description: "Recorded payment transactions",
      color: "bg-orange-50 text-orange-600",
    },
  ]

  const managementCards = [
    {
      title: "Manage Users",
      description: "Manage customer and vendor accounts and their roles.",
      href: "/dashboard/admin/users",
      icon: Users,
      action: "View Users",
    },
    {
      title: "Manage Services",
      description: "Review, monitor and manage vendor service listings.",
      href: "/dashboard/admin/services",
      icon: BriefcaseBusiness,
      action: "View Services",
    },
    {
      title: "Transactions",
      description: "Monitor vendor subscription payments and transactions.",
      href: "/dashboard/admin/transactions",
      icon: CreditCard,
      action: "View Transactions",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="rounded-2xl bg-gradient-to-r from-[#A65D55] to-[#884840] p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm text-white/80">
              <LayoutDashboard size={17} />
              Admin Overview
            </div>

            <h1 className="text-2xl font-bold sm:text-3xl">
              Welcome back, {session.user.name}!
            </h1>

            <p className="mt-2 text-sm text-white/80">
              Manage your WedNest platform from one place.
            </p>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
            <ShieldCheck size={32} />
          </div>
        </div>
      </div>

      {/* Statistics */}
      <section>
        <div className="mb-5">
          <h2 className="text-xl font-bold text-gray-800">
            Platform Statistics
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Live overview of your platform activity.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((item) => {
            const Icon = item.icon

            return (
              <Card
                key={item.title}
                className="border-gray-100 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.color}`}
                    >
                      <Icon size={24} />
                    </div>

                    <ArrowUpRight size={19} className="text-gray-400" />
                  </div>

                  <p className="mt-5 text-sm font-medium text-gray-500">
                    {item.title}
                  </p>

                  <h3 className="mt-1 text-3xl font-bold text-gray-800">
                    {statsAvailable ? item.value.toLocaleString() : "—"}
                  </h3>

                  <p className="mt-2 text-xs text-gray-400">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {!statsAvailable && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            Unable to load platform statistics. Please check your database
            connection.
          </p>
        )}
      </section>

      {/* Management Section */}
      <section>
        <div className="mb-5">
          <h2 className="text-xl font-bold text-gray-800">
            Platform Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Quickly access your administrative tools.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {managementCards.map((item) => {
            const Icon = item.icon

            return (
              <Link href={item.href} key={item.title}>
                <Card className="h-full border-gray-100 shadow-sm transition hover:-translate-y-1 hover:border-[#A65D55]/30 hover:shadow-md">
                  <CardHeader>
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#A65D55]/10 text-[#A65D55]">
                      <Icon size={24} />
                    </div>

                    <CardTitle className="text-lg text-gray-800">
                      {item.title}
                    </CardTitle>

                    <CardDescription className="leading-6">
                      {item.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#A65D55]">
                      {item.action}
                      <ArrowUpRight size={17} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Admin Information */}
      <Card className="border-gray-100 shadow-sm">
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-50 text-green-600">
              <ShieldCheck size={23} />
            </div>

            <div>
              <h3 className="font-semibold text-gray-800">Admin Access</h3>
              <p className="text-sm text-gray-500">
                You are managing WedNest as an administrator.
              </p>
            </div>
          </div>

          <span className="w-fit rounded-full bg-green-50 px-4 py-1.5 text-xs font-semibold text-green-700">
            Administrator
          </span>
        </CardContent>
      </Card>
    </div>
  )
}

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import Link from "next/link"
import { requireDashboardRole } from "@/lib/dashboard-auth"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  Heart,
  ArrowRight,
  Search,
  UserRound,
  ClipboardList,
} from "lucide-react"

export default async function CustomerDashboard() {
  const session = await requireDashboardRole("customer")

  let bookings: { status: string }[] = []

  try {
    const tokenData = await auth.api.getToken({
      headers: await headers(),
    })

    if (!tokenData?.token) {
      throw new Error("JWT token not found")
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}/customer-bookings`,
      {
        headers: {
          Authorization: `Bearer ${tokenData.token}`,
        },
        cache: "no-store",
      }
    )

    if (!response.ok) {
      throw new Error("Failed to load customer bookings")
    }

    bookings = await response.json()
  } catch (error) {
    console.log("Failed to load customer bookings:", error)
  }

  const totalBookings = bookings.length

  const pendingBookings = bookings.filter(
    (item: { status: string }) => item.status === "pending"
  ).length

  const acceptedBookings = bookings.filter(
    (item: { status: string }) => item.status === "accepted"
  ).length

  const completedBookings = bookings.filter(
    (item: { status: string }) => item.status === "completed"
  ).length

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="rounded-2xl bg-gradient-to-r from-[#A65D55] to-[#C7867C] p-7 text-white sm:p-10">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-white/80">
            CUSTOMER DASHBOARD
          </p>

          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Welcome back, {session.user.name}!
          </h1>

          <p className="mt-3 text-sm leading-7 text-white/90 sm:text-base">
            Your dream wedding starts here. Explore trusted vendors, manage your
            bookings, and make every moment special.
          </p>

          <Link
            href="/browse-services"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#A65D55] transition hover:bg-[#FCF5F3]"
          >
            Explore Services
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>

      {/* Booking Statistics */}
      <div>
        <div className="mb-5">
          <h2 className="text-xl font-bold text-gray-800">Booking Overview</h2>
          <p className="mt-1 text-sm text-gray-500">
            Keep track of your wedding service bookings.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-xl bg-[#F8EFED] p-3 text-[#A65D55]">
                <ClipboardList size={23} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Bookings</p>
                <h3 className="mt-1 text-2xl font-bold text-gray-800">
                  {totalBookings}
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-xl bg-yellow-50 p-3 text-yellow-600">
                <Clock size={23} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <h3 className="mt-1 text-2xl font-bold text-gray-800">
                  {pendingBookings}
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-xl bg-green-50 p-3 text-green-600">
                <CheckCircle2 size={23} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Accepted</p>
                <h3 className="mt-1 text-2xl font-bold text-gray-800">
                  {acceptedBookings}
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <CalendarDays size={23} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <h3 className="mt-1 text-2xl font-bold text-gray-800">
                  {completedBookings}
                </h3>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <div className="mb-5">
          <h2 className="text-xl font-bold text-gray-800">Quick Actions</h2>
          <p className="mt-1 text-sm text-gray-500">
            Everything you need to plan your special day.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Link href="/dashboard/customer/bookings">
            <Card className="h-full transition hover:-translate-y-1 hover:shadow-md">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F8EFED] text-[#A65D55]">
                  <CalendarDays size={23} />
                </div>
                <CardTitle>My Bookings</CardTitle>
                <CardDescription>
                  View your booking history, check request status, and manage
                  your wedding service bookings.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-2 font-semibold text-[#A65D55]">
                Manage Bookings <ArrowRight size={17} />
              </CardContent>
            </Card>
          </Link>

          <Link href="/browse-services">
            <Card className="h-full transition hover:-translate-y-1 hover:shadow-md">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F8EFED] text-[#A65D55]">
                  <Search size={23} />
                </div>
                <CardTitle>Explore Services</CardTitle>
                <CardDescription>
                  Discover photographers, decorators, venues, catering services,
                  and more.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-2 font-semibold text-[#A65D55]">
                Browse Services <ArrowRight size={17} />
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/customer/profile">
            <Card className="h-full transition hover:-translate-y-1 hover:shadow-md">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F8EFED] text-[#A65D55]">
                  <UserRound size={23} />
                </div>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Update your account information and manage your personal
                  details.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-2 font-semibold text-[#A65D55]">
                Edit Profile <ArrowRight size={17} />
              </CardContent>
            </Card>
          </Link>

          <Card className="h-full border-[#F0E5E1] bg-[#FCFAF9]">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F8EFED] text-[#A65D55]">
                <Heart size={23} />
              </div>
              <CardTitle>Make Your Day Special</CardTitle>
              <CardDescription>
                Find the right wedding professionals and bring your dream
                celebration to life with WedNest.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  )
}

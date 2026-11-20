
import Link from "next/link";
import { requireDashboardRole } from "@/lib/dashboard-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function VendorDashboard() {
  const session = await requireDashboardRole("vendor");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome, {session.user.name}!
        </h1>
        <p className="mt-1 text-gray-500">
          Manage your wedding services and booking requests.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/vendor/services">
          <Card className="transition hover:shadow-md">
            <CardHeader>
              <CardTitle>My Services</CardTitle>
              <CardDescription>
                View and manage your services.
              </CardDescription>
            </CardHeader>
            <CardContent className="font-medium text-[#A65D55]">
              View Services →
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/vendor/add-service">
          <Card className="transition hover:shadow-md">
            <CardHeader>
              <CardTitle>Add Service</CardTitle>
              <CardDescription>
                Create a new wedding service.
              </CardDescription>
            </CardHeader>
            <CardContent className="font-medium text-[#A65D55]">
              Add Service →
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/vendor/bookings">
          <Card className="transition hover:shadow-md">
            <CardHeader>
              <CardTitle>Booking Requests</CardTitle>
              <CardDescription>
                Review customer booking requests.
              </CardDescription>
            </CardHeader>
            <CardContent className="font-medium text-[#A65D55]">
              View Bookings →
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/vendor/subscription">
          <Card className="transition hover:shadow-md">
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>
                Manage your subscription plan.
              </CardDescription>
            </CardHeader>
            <CardContent className="font-medium text-[#A65D55]">
              View Subscription →
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/vendor/profile">
          <Card className="transition hover:shadow-md">
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Update your vendor profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="font-medium text-[#A65D55]">
              Edit Profile →
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}


import Link from "next/link";
import { requireDashboardRole } from "@/lib/dashboard-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function CustomerDashboard() {
  const session = await requireDashboardRole("customer");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome, {session.user.name}!
        </h1>
        <p className="mt-1 text-gray-500">
          Plan your dream wedding with WedNest.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Link href="/dashboard/customer/bookings">
          <Card className="transition hover:shadow-md">
            <CardHeader>
              <CardTitle>My Bookings</CardTitle>
              <CardDescription>
                View and track your wedding service bookings.
              </CardDescription>
            </CardHeader>
            <CardContent className="font-medium text-[#A65D55]">
              View Bookings →
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/customer/profile">
          <Card className="transition hover:shadow-md">
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Manage your personal information.
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


import Link from "next/link";
import { requireDashboardRole } from "@/lib/dashboard-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AdminDashboard() {
  const session = await requireDashboardRole("admin");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome, {session.user.name}!
        </h1>
        <p className="mt-1 text-gray-500">
          Manage your WedNest platform from here.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/admin/users">
          <Card className="transition hover:shadow-md">
            <CardHeader>
              <CardTitle>Manage Users</CardTitle>
              <CardDescription>
                Manage customers, vendors and user accounts.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-[#A65D55] font-medium">
              View Users →
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/admin/services">
          <Card className="transition hover:shadow-md">
            <CardHeader>
              <CardTitle>Manage Services</CardTitle>
              <CardDescription>
                Review and manage submitted services.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-[#A65D55] font-medium">
              View Services →
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/admin/transactions">
          <Card className="transition hover:shadow-md">
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>
                Monitor vendor subscription transactions.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-[#A65D55] font-medium">
              View Transactions →
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}


import { redirect } from "next/navigation";
import { requireDashboardUser } from "@/lib/dashboard-auth";

export default async function DashboardPage() {
  const { role } = await requireDashboardUser();

  redirect(`/dashboard/${role}`);
}

import { requireDashboardUser } from "@/lib/dashboard-auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const { role } = await requireDashboardUser()

  redirect(`/dashboard/${role}`)
}


import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export type DashboardRole = "admin" | "vendor" | "customer";

export async function requireDashboardUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/signin");
  }

  const role = (session.user as { role?: string }).role;

  if (!role || !["admin", "vendor", "customer"].includes(role)) {
    redirect("/signin");
  }

  return {
    session,
    role: role as DashboardRole,
  };
}

export async function requireDashboardRole(
  requiredRole: DashboardRole
) {
  const { session, role } = await requireDashboardUser();

  if (role !== requiredRole) {
    redirect(`/dashboard/${role}`);
  }

  return session;
}

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth, users } from "@/lib/auth";

export type DashboardRole = "admin" | "vendor" | "customer";

export async function requireDashboardUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/signin");
  }

  const user = await users.findOne(
    { email: session.user.email },
    { projection: { role: 1 } }
  );

  const role = user?.role as DashboardRole;

  if (!["admin", "vendor", "customer"].includes(role)) {
    redirect("/signin");
  }

  return { session, role };
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
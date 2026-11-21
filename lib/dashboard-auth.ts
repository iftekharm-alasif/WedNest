
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { MongoClient } from "mongodb";

export type DashboardRole = "admin" | "vendor" | "customer";

const client = new MongoClient(process.env.MONGODB_URI as string);
const db = client.db("wednestdb");

export async function requireDashboardUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/signin");
  }

  const user = await db.collection("user").findOne(
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

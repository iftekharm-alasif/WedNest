
import DashboardSidebar from "@/components/Dashboard-Sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { requireDashboardUser } from "@/lib/dashboard-auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, role } = await requireDashboardUser();

  return (
    <SidebarProvider>
    <DashboardSidebar
        role={role}
        userName={session.user.name || "User"}
      />

      <SidebarInset>
        <header className="flex h-16 items-center gap-4 border-b border-[#F0E5E1] px-6">
          <SidebarTrigger />
          <h2 className="font-semibold capitalize text-[#A65D55]">
            {role} Dashboard
          </h2>
        </header>

        <main className="min-h-screen bg-[#FAF7F0] p-5 md:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

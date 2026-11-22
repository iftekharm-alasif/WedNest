import DashboardSidebar from "@/components/Dashboard-Sidebar";
import JwtTest from "@/components/JwtTest";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
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

      <SidebarInset className="min-h-screen">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-[#F0E5E1] bg-white px-6">
          <SidebarTrigger />
          <h2 className="font-semibold capitalize text-[#A65D55]">
            {role} Dashboard
          </h2>
        </header>
        <div className="border-b bg-white p-4">
          <JwtTest />
        </div>
        <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-[#FAF7F0]">
          <main className="flex-1 p-5 md:p-8">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
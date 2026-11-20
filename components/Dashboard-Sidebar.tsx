
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  PlusCircle,
  CalendarDays,
  CreditCard,
  Settings,
  LogOut,
  ClipboardList,
  Heart,
  ChevronRight,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { DashboardRole } from "@/lib/dashboard-auth";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const menus = {
  admin: [
    { title: "Overview", url: "/dashboard/admin", icon: LayoutDashboard },
    { title: "Manage Users", url: "/dashboard/admin/users", icon: Users },
    { title: "Manage Services", url: "/dashboard/admin/services", icon: Briefcase },
    { title: "Transactions", url: "/dashboard/admin/transactions", icon: CreditCard },
  ],

  vendor: [
    { title: "Overview", url: "/dashboard/vendor", icon: LayoutDashboard },
    { title: "My Services", url: "/dashboard/vendor/services", icon: Briefcase },
    { title: "Add Service", url: "/dashboard/vendor/add-service", icon: PlusCircle },
    { title: "Booking Requests", url: "/dashboard/vendor/bookings", icon: CalendarDays },
    { title: "Subscription", url: "/dashboard/vendor/subscription", icon: CreditCard },
    { title: "Profile Settings", url: "/dashboard/vendor/profile", icon: Settings },
  ],

  customer: [
    { title: "Overview", url: "/dashboard/customer", icon: LayoutDashboard },
    { title: "My Bookings", url: "/dashboard/customer/bookings", icon: ClipboardList },
    { title: "Profile Settings", url: "/dashboard/customer/profile", icon: Settings },
  ],
};

type Props = {
  role: DashboardRole;
  userName: string;
};

export default function DashboardSidebar({ role, userName }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/signin");
    router.refresh();
  };

  return (
    <Sidebar className="border-r border-[#F0E5E1] bg-white">
      {/* Logo */}
      <SidebarHeader className="border-b border-[#F0E5E1] px-5 py-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#A65D55] text-white shadow-sm">
            <Heart size={22} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#A65D55]">
              WedNest
            </h1>
            <p className="text-[10px] tracking-wide text-gray-500">
              YOUR DREAM WEDDING
            </p>
          </div>
        </Link>
      </SidebarHeader>

      {/* Menu */}
      <SidebarContent className="px-3 py-5">
        <SidebarGroup>
          <SidebarGroupLabel className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400">
            {role} Workspace
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {menus[role].map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.url;

                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => router.push(item.url)}
                      className={`relative h-11 rounded-xl px-3 transition-all duration-200 ${
                        isActive
                          ? "bg-[#F8ECE9] font-semibold text-[#A65D55] hover:bg-[#F8ECE9] hover:text-[#A65D55]"
                          : "text-gray-600 hover:bg-[#FAF7F0] hover:text-[#A65D55]"
                      }`}
                    >
                      <Icon size={19} />
                      <span className="text-sm">{item.title}</span>

                      {isActive && (
                        <ChevronRight
                          size={16}
                          className="ml-auto text-[#A65D55]"
                        />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User Profile and Logout */}
      <SidebarFooter className="border-t border-[#F0E5E1] p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-[#FAF7F0] p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#A65D55] font-semibold text-white">
            {userName?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-800">
              {userName}
            </p>
            <p className="text-xs capitalize text-[#A65D55]">
              {role} account
            </p>
          </div>
        </div>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="h-10 rounded-xl px-3 text-gray-600 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <p className="mt-3 text-center text-[10px] text-gray-400">
          © 2026 WedNest. All rights reserved.
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}

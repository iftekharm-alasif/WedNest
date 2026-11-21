
import Link from "next/link";
import { MongoClient, ObjectId } from "mongodb";
import {
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  XCircle,
  Plus,
  ArrowUpRight,
  CalendarCheck,
  Crown,
  UserRound,
  Sparkles,
} from "lucide-react";
import { getVendorSubscription } from "@/lib/actions/subscription";
import { requireDashboardRole } from "@/lib/dashboard-auth";
import { getServices } from "@/lib/actions/services";

type Service = {
  _id: string;
  serviceName: string;
  category: string;
  price: number;
  status: string;
  isActive: boolean;
  createdAt?: string;
};

export default async function VendorDashboard() {
  const session = await requireDashboardRole("vendor");

const currentPlan = await getVendorSubscription(session.user.id);
  const allServices = await getServices();

  const services: Service[] = Array.isArray(allServices)
    ? allServices.filter(
        (item: Service) => item.vendorId === session.user.id
      )
    : [];

  const totalServices = services.length;

  const approvedServices = services.filter(
    (item) => item.status === "approved"
  ).length;

  const pendingServices = services.filter(
    (item) => item.status === "pending"
  ).length;

  const rejectedServices = services.filter(
    (item) => item.status === "rejected"
  ).length;

  const activeServices = services.filter(
    (item) => item.isActive === true && item.status === "approved"
  ).length;

  const recentServices = [...services]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    )
    .slice(0, 5);

  const stats = [
    {
      title: "Total Services",
      value: totalServices,
      icon: BriefcaseBusiness,
      color: "bg-[#F8EFED] text-[#A65D55]",
    },
    {
      title: "Approved Services",
      value: approvedServices,
      icon: CheckCircle2,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Pending Services",
      value: pendingServices,
      icon: Clock3,
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      title: "Rejected Services",
      value: rejectedServices,
      icon: XCircle,
      color: "bg-red-50 text-red-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-[#A65D55]">
            Vendor Dashboard
          </p>

          <h1 className="mt-1 text-2xl font-bold text-gray-800 sm:text-3xl">
            Welcome, {session.user.name}!
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage your wedding services and booking activities.
          </p>
        </div>

        <Link
          href="/dashboard/vendor/add-service"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#A65D55] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8f4d46]"
        >
          <Plus size={18} />
          Add New Service
        </Link>
      </section>

      {/* Statistics */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-800">
            Business Overview
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Overview of your services.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-2xl border border-[#F0E5E1] bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      {item.title}
                    </p>

                    <h3 className="mt-2 text-3xl font-bold text-gray-800">
                      {item.value}
                    </h3>
                  </div>

                  <div
                    className={`flex size-12 items-center justify-center rounded-xl ${item.color}`}
                  >
                    <Icon size={23} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Current Subscription */}
      <section className="rounded-2xl border border-[#F0E5E1] bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-[#F8EFED] text-[#A65D55]">
              <Crown size={27} />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Current Subscription
              </p>

              <h2 className="mt-1 text-xl font-bold capitalize text-gray-800">
                {currentPlan} Plan
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {currentPlan === "premium"
                  ? "Unlimited Active Services"
                  : `Maximum 3 Active Services · ${activeServices}/3 used`}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <span
              className={`w-fit rounded-full px-4 py-1.5 text-xs font-semibold ${
                currentPlan === "premium"
                  ? "bg-[#F8EFED] text-[#A65D55]"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {currentPlan === "premium"
                ? "Premium Member"
                : "Free Member"}
            </span>

            {currentPlan !== "premium" && (
              <Link
                href="/dashboard/vendor/subscription"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#A65D55] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8f4d46]"
              >
                Upgrade to Premium — $30/year
                <ArrowUpRight size={17} />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-gray-800">
          Quick Actions
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Link
            href="/dashboard/vendor/services"
            className="group rounded-2xl border border-[#F0E5E1] bg-white p-5 transition hover:border-[#D6A69D] hover:shadow-sm"
          >
            <BriefcaseBusiness className="text-[#A65D55]" size={25} />
            <h3 className="mt-4 font-semibold text-gray-800">
              My Services
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Manage your services.
            </p>
            <ArrowUpRight
              className="mt-3 text-gray-400 transition group-hover:text-[#A65D55]"
              size={18}
            />
          </Link>

          <Link
            href="/dashboard/vendor/bookings"
            className="group rounded-2xl border border-[#F0E5E1] bg-white p-5 transition hover:border-[#D6A69D] hover:shadow-sm"
          >
            <CalendarCheck className="text-[#A65D55]" size={25} />
            <h3 className="mt-4 font-semibold text-gray-800">
              Booking Requests
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Manage customer bookings.
            </p>
            <ArrowUpRight
              className="mt-3 text-gray-400 transition group-hover:text-[#A65D55]"
              size={18}
            />
          </Link>

          <Link
            href="/dashboard/vendor/subscription"
            className="group rounded-2xl border border-[#F0E5E1] bg-white p-5 transition hover:border-[#D6A69D] hover:shadow-sm"
          >
            <Sparkles className="text-[#A65D55]" size={25} />
            <h3 className="mt-4 font-semibold text-gray-800">
              Subscription
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              View and upgrade your plan.
            </p>
            <ArrowUpRight
              className="mt-3 text-gray-400 transition group-hover:text-[#A65D55]"
              size={18}
            />
          </Link>

          <Link
            href="/dashboard/vendor/profile"
            className="group rounded-2xl border border-[#F0E5E1] bg-white p-5 transition hover:border-[#D6A69D] hover:shadow-sm"
          >
            <UserRound className="text-[#A65D55]" size={25} />
            <h3 className="mt-4 font-semibold text-gray-800">
              My Profile
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Update your vendor profile.
            </p>
            <ArrowUpRight
              className="mt-3 text-gray-400 transition group-hover:text-[#A65D55]"
              size={18}
            />
          </Link>
        </div>
      </section>

      {/* Recent Services */}
      <section className="rounded-2xl border border-[#F0E5E1] bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Recent Services
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Your recently added services.
            </p>
          </div>

          <Link
            href="/dashboard/vendor/services"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#A65D55] hover:underline"
          >
            View All
            <ArrowUpRight size={16} />
          </Link>
        </div>

        {recentServices.length === 0 ? (
          <div className="py-10 text-center">
            <BriefcaseBusiness
              size={35}
              className="mx-auto text-gray-300"
            />

            <p className="mt-3 font-medium text-gray-600">
              No services added yet.
            </p>

            <Link
              href="/dashboard/vendor/add-service"
              className="mt-3 inline-block text-sm font-semibold text-[#A65D55] hover:underline"
            >
              Add your first service
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentServices.map((item) => (
              <div
                key={item._id}
                className="flex flex-col justify-between gap-3 rounded-xl border border-[#F0E5E1] p-4 sm:flex-row sm:items-center"
              >
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {item.serviceName}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {item.category} · ${item.price}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      item.status === "approved"
                        ? "bg-green-50 text-green-700"
                        : item.status === "rejected"
                          ? "bg-red-50 text-red-600"
                          : "bg-yellow-50 text-yellow-700"
                    }`}
                  >
                    {item.status}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      item.isActive
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {item.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

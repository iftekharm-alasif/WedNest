
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import {
  getCustomerBookings,
  cancelCustomerBooking,
} from "@/lib/actions/services";
import { toast } from "sonner";
import {
  CalendarDays,
  MapPin,
  ClipboardList,
  Clock3,
  Eye,
  XCircle,
} from "lucide-react";

type Booking = {
  _id: string;
  serviceId: string;
  serviceName: string;
  vendorId: string;
  vendorName: string;
  customerId: string;
  eventDate: string;
  eventLocation: string;
  message: string;
  status: "pending" | "accepted" | "rejected" | "cancelled" | "completed";
  price: number;
  serviceImage: string;
  createdAt: string;
};

type Filter = "all" | "pending" | "accepted" | "rejected" | "cancelled";

export default function CustomerBookingsPage() {
  const { data: session, isPending } = authClient.useSession();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const [cancelLoading, setCancelLoading] = useState("");

  useEffect(() => {
    const loadBookings = async () => {
      if (isPending) return;

      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        const data = await getCustomerBookings(session.user.id);
        setBookings(data);
      } catch (error) {
        console.log(error);
        toast.error("Failed to load your bookings");
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [session?.user?.id, isPending]);

  const handleCancel = async (bookingId: string) => {
    if (!session?.user?.id) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?",
    );

    if (!confirmed) return;

    try {
      setCancelLoading(bookingId);

      const result = await cancelCustomerBooking(
        bookingId,
        session.user.id,
      );

      if (!result.success) {
        toast.error(result.message || "Failed to cancel booking");
        return;
      }

      setBookings((prev) =>
        prev.map((item) =>
          item._id === bookingId
            ? { ...item, status: "cancelled" }
            : item,
        ),
      );

      toast.success("Booking cancelled successfully");
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setCancelLoading("");
    }
  };

  const filteredBookings =
    activeFilter === "all"
      ? bookings
      : bookings.filter((item) => item.status === activeFilter);

  const pendingCount = bookings.filter(
    (item) => item.status === "pending",
  ).length;

  const acceptedCount = bookings.filter(
    (item) => item.status === "accepted",
  ).length;

  const getStatusStyle = (status: Booking["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 text-yellow-700";
      case "accepted":
        return "bg-green-50 text-green-700";
      case "rejected":
        return "bg-red-50 text-red-700";
      case "cancelled":
        return "bg-gray-100 text-gray-600";
      case "completed":
        return "bg-blue-50 text-blue-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  if (isPending || loading) {
    return (
      <div className="mx-auto max-w-6xl animate-pulse px-6 py-12">
        <div className="h-10 w-64 rounded-lg bg-[#F5EFEC]" />
        <div className="mt-8 h-32 rounded-2xl bg-[#F5EFEC]" />
        <div className="mt-6 h-64 rounded-2xl bg-[#F5EFEC]" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="px-6 py-24 text-center">
        <h2 className="text-2xl font-bold text-gray-800">
          Please Sign In
        </h2>
        <p className="mt-2 text-gray-500">
          Sign in to view your bookings.
        </p>
        <Link
          href="/signin"
          className="mt-5 inline-block rounded-xl bg-[#A65D55] px-6 py-3 text-sm font-semibold text-white"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-[#FCFAF9] px-5 py-10 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-[#A65D55]">
            Customer Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            My Bookings
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage and track all your wedding service bookings.
          </p>
        </div>

        {/* Booking Statistics */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#F0E5E1] bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Total Bookings</p>
              <ClipboardList className="text-[#A65D55]" size={21} />
            </div>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">
              {bookings.length}
            </h2>
          </div>

          <div className="rounded-2xl border border-[#F0E5E1] bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Pending</p>
              <Clock3 className="text-yellow-600" size={21} />
            </div>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">
              {pendingCount}
            </h2>
          </div>

          <div className="rounded-2xl border border-[#F0E5E1] bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Accepted</p>
              <CalendarDays className="text-green-600" size={21} />
            </div>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">
              {acceptedCount}
            </h2>
          </div>
        </div>

        {/* Booking Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {(
            ["all", "pending", "accepted", "rejected", "cancelled"] as Filter[]
          ).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full px-5 py-2 text-sm font-medium capitalize transition ${
                activeFilter === filter
                  ? "bg-[#A65D55] text-white"
                  : "border border-[#F0E5E1] bg-white text-gray-600 hover:border-[#A65D55] hover:text-[#A65D55]"
              }`}
            >
              {filter === "all" ? "All Bookings" : filter}
            </button>
          ))}
        </div>

        {/* Booking List */}
        {filteredBookings.length === 0 ? (
          <div className="rounded-2xl border border-[#F0E5E1] bg-white px-5 py-16 text-center">
            <ClipboardList
              size={42}
              className="mx-auto text-[#D6A69D]"
            />
            <h2 className="mt-4 text-xl font-semibold text-gray-800">
              No Bookings Found
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {activeFilter === "all"
                ? "You have not booked any services yet."
                : `You do not have any ${activeFilter} bookings.`}
            </p>
            <Link
              href="/browse-services"
              className="mt-6 inline-block rounded-xl bg-[#A65D55] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#884840]"
            >
              Browse Services
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredBookings.map((item) => (
              <div
                key={item._id}
                className="overflow-hidden rounded-2xl border border-[#F0E5E1] bg-white"
              >
                <div className="grid gap-5 p-5 md:grid-cols-[190px_1fr]">
                  {/* Service Image */}
                  <div className="h-44 overflow-hidden rounded-xl bg-[#F5EFEC]">
                    {item.serviceImage ? (
                      <img
                        src={item.serviceImage}
                        alt={item.serviceName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gray-400">
                        No Image Available
                      </div>
                    )}
                  </div>

                  {/* Booking Information */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-xl font-bold text-gray-900">
                          {item.serviceName}
                        </h2>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(item.status)}`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <p className="mt-2 text-lg font-bold text-[#A65D55]">
                        ৳{Number(item.price).toLocaleString("en-BD")}
                      </p>

                      <div className="mt-4 grid gap-3 text-sm text-gray-500 sm:grid-cols-2">
                        <p className="flex items-center gap-2">
                          <CalendarDays size={16} className="text-[#A65D55]" />
                          Event Date: {item.eventDate}
                        </p>

                        <p className="flex items-center gap-2">
                          <MapPin size={16} className="text-[#A65D55]" />
                          {item.eventLocation}
                        </p>
                      </div>

                      <p className="mt-3 text-sm text-gray-500">
                        Vendor:{" "}
                        <span className="font-medium text-gray-700">
                          {item.vendorName}
                        </span>
                      </p>

                      {item.message && (
                        <p className="mt-3 text-sm text-gray-500">
                          Message: {item.message}
                        </p>
                      )}
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <Link
                        href={`/service-details/${item.serviceId}`}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#A65D55] px-4 py-2 text-sm font-medium text-[#A65D55] transition hover:bg-[#F8EFED]"
                      >
                        <Eye size={16} />
                        View Service
                      </Link>

                      {item.status === "pending" && (
                        <button
                          onClick={() => handleCancel(item._id)}
                          disabled={cancelLoading === item._id}
                          className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-60"
                        >
                          <XCircle size={16} />
                          {cancelLoading === item._id
                            ? "Cancelling..."
                            : "Cancel Booking"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

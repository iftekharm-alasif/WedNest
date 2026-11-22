"use client"

import { useEffect, useState } from "react"
import { authClient } from "@/lib/auth-client"
import { getVendorBookings, updateBookingStatus } from "@/lib/actions/services"
import { toast } from "sonner"
import { CalendarDays, MapPin, Check, X, ClipboardList } from "lucide-react"

type Booking = {
  _id: string
  serviceId: string
  serviceName: string
  customerId: string
  eventDate: string
  eventLocation: string
  message: string
  status: "pending" | "accepted" | "rejected" | "cancelled" | "completed"
  price: number
  createdAt: string
  customerName: string
  customerEmail: string
  customerPhone: string
}

export default function VendorBookingsPage() {
  const { data: session, isPending } = authClient.useSession()

  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState("")

  useEffect(() => {
    if (isPending) return

if (!session?.user?.id) {
  queueMicrotask(() => {
    setLoading(false)
  })
  return
}

    const loadBookings = async () => {
      try {
        const data = await getVendorBookings()
        setBookings(data)
      } catch (error) {
        console.log(error)
        toast.error("Failed to load bookings")
      } finally {
        setLoading(false)
      }
    }

    loadBookings()
  }, [session?.user?.id, isPending])

  const handleStatusChange = async (
    id: string,
    status: "accepted" | "rejected" | "completed"
  ) => {
    try {
      setUpdatingId(id)

      const result = await updateBookingStatus(id, status)

      if (!result.success) {
        toast.error(result.message || "Failed to update booking")
        return
      }

      setBookings((previous) =>
        previous.map((item) => (item._id === id ? { ...item, status } : item))
      )

      if (status === "completed") {
        toast.success("Service completed successfully!")
      } else {
        toast.success(`Booking ${status} successfully`)
      }
    } catch (error) {
      console.log(error)
      toast.error("Something went wrong")
    } finally {
      setUpdatingId("")
    }
  }

  const getStatusStyle = (status: string) => {
    if (status === "accepted") {
      return "bg-green-50 text-green-700"
    }

    if (status === "rejected") {
      return "bg-red-50 text-red-600"
    }

    if (status === "completed") {
      return "bg-blue-50 text-blue-700"
    }

    if (status === "cancelled") {
      return "bg-gray-100 text-gray-600"
    }

    return "bg-yellow-50 text-yellow-700"
  }

  if (isPending || loading) {
    return (
      <div className="space-y-5 p-6">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-44 animate-pulse rounded-2xl bg-[#F5EFEC]"
          />
        ))}
      </div>
    )
  }

  if (!session) {
    return (
      <div className="py-20 text-center text-gray-500">
        Please sign in to view your bookings.
      </div>
    )
  }

  const userRole = (session.user as typeof session.user & { role?: string })
    .role

  if (userRole !== "vendor") {
    return (
      <div className="py-20 text-center text-gray-500">
        Only vendors can access this page.
      </div>
    )
  }

  return (
    <section className="min-h-screen bg-[#FCFAF9] p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-[#A65D55]">Vendor Dashboard</p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
            Booking Requests
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage booking requests from your customers.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-[#F0E5E1] bg-white p-4">
            <p className="text-sm text-gray-500">Total Bookings</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {bookings.length}
            </p>
          </div>

          <div className="rounded-xl border border-[#F0E5E1] bg-white p-4">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="mt-2 text-2xl font-bold text-yellow-600">
              {bookings.filter((item) => item.status === "pending").length}
            </p>
          </div>

          <div className="rounded-xl border border-[#F0E5E1] bg-white p-4">
            <p className="text-sm text-gray-500">Accepted</p>
            <p className="mt-2 text-2xl font-bold text-green-600">
              {bookings.filter((item) => item.status === "accepted").length}
            </p>
          </div>

          <div className="rounded-xl border border-[#F0E5E1] bg-white p-4">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="mt-2 text-2xl font-bold text-blue-600">
              {bookings.filter((item) => item.status === "completed").length}
            </p>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E8D8D3] bg-white py-20 text-center">
            <ClipboardList size={42} className="mx-auto mb-4 text-[#D6A69D]" />
            <h2 className="text-lg font-semibold text-gray-800">
              No Booking Requests Yet
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Customer booking requests will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {bookings.map((item) => (
              <div
                key={item._id}
                className="rounded-2xl border border-[#F0E5E1] bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {item.serviceName}
                    </h2>

                    <div className="mt-2 space-y-1 text-sm text-gray-500">
                      <p>
                        Customer:{" "}
                        <span className="font-medium text-gray-700">
                          {item.customerName}
                        </span>
                      </p>
                      <p>Email: {item.customerEmail}</p>
                      <p>Phone: {item.customerPhone}</p>
                    </div>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${getStatusStyle(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 border-t border-[#F0E5E1] pt-5 sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CalendarDays size={17} className="text-[#A65D55]" />
                    {item.eventDate}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={17} className="text-[#A65D55]" />
                    {item.eventLocation}
                  </div>
                </div>

                {item.message && (
                  <div className="mt-5 rounded-xl bg-[#FCFAF9] p-4">
                    <p className="text-xs font-semibold text-gray-500">
                      Customer Message
                    </p>
                    <p className="mt-2 text-sm leading-6 text-gray-700">
                      {item.message}
                    </p>
                  </div>
                )}

                {item.status === "pending" && (
                  <div className="mt-5 flex flex-col gap-3 border-t border-[#F0E5E1] pt-5 sm:flex-row sm:justify-end">
                    <button
                      onClick={() => handleStatusChange(item._id, "rejected")}
                      disabled={updatingId === item._id}
                      className="flex items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      <X size={17} />
                      Reject
                    </button>

                    <button
                      onClick={() => handleStatusChange(item._id, "accepted")}
                      disabled={updatingId === item._id}
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#A65D55] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#884840] disabled:opacity-50"
                    >
                      <Check size={17} />
                      Accept Booking
                    </button>
                  </div>
                )}

                {item.status === "accepted" && (
                  <div className="mt-5 flex justify-end border-t border-[#F0E5E1] pt-5">
                    <button
                      onClick={() => handleStatusChange(item._id, "completed")}
                      disabled={updatingId === item._id}
                      className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                    >
                      <Check size={17} />
                      {updatingId === item._id
                        ? "Updating..."
                        : "Mark as Completed"}
                    </button>
                  </div>
                )}

                {item.status === "completed" && (
                  <div className="mt-5 rounded-xl bg-blue-50 p-4 text-center text-sm font-medium text-blue-700">
                    <Check size={17} className="mr-2 inline" />
                    This service has been completed successfully.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

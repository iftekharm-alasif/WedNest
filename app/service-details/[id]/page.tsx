"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, MapPin, BriefcaseBusiness } from "lucide-react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import {
  getServiceById,
  createBooking,
  getCustomerBooking,
} from "@/lib/actions/services"

type Service = {
  _id: string
  serviceName: string
  category: string
  description: string
  price: number
  location: string
  images: string[]
  vendorId?: string
  vendorName?: string
  isActive: boolean
  vendorEmail?: string
}
type Booking = {
  _id: string
  customerId: string
  serviceId: string
  eventDate: string
  eventLocation: string
  message: string
  status: string
  createdAt: string
}

export default function ServiceDetailsPage() {
  const params = useParams()
  const id = params.id as string

  const { data: session, isPending } = authClient.useSession()

  const [service, setService] = useState<Service | null>(null)
  const [selectedImage, setSelectedImage] = useState("")
  const [loading, setLoading] = useState(true)
  const [customerPhone, setCustomerPhone] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [eventLocation, setEventLocation] = useState("")
  const [message, setMessage] = useState("")
  const [bookingLoading, setBookingLoading] = useState(false)
  const [existingBooking, setExistingBooking] = useState<Booking | null>(null)
  const [bookingCheckLoading, setBookingCheckLoading] = useState(false)

  useEffect(() => {
    const loadService = async () => {
      try {
        const data = await getServiceById(id)
        setService(data)
        setSelectedImage(data.images?.[0] || "")
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }

    loadService()
  }, [id])
  useEffect(() => {
    const checkBooking = async () => {
      if (!session?.user?.id || !id || isPending) return

      try {
        setBookingCheckLoading(true)

        const data = await getCustomerBooking(id, session.user.id)
        setExistingBooking(data)
      } catch (error) {
        console.log(error)
      } finally {
        setBookingCheckLoading(false)
      }
    }

    checkBooking()
  }, [id, session?.user?.id, isPending])


const handleBooking = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (!session?.user) {
    toast.error("Please sign in to book this service");
    return;
  }

  if (session.user.role !== "customer") {
    toast.error("Only customers can book services");
    return;
  }

  if (!service?.isActive) {
    toast.error("This service is currently inactive and cannot be booked");
    return;
  }

  if (session.user.id === service.vendorId) {
    toast.error("You cannot book your own service");
    return;
  }

  if (!eventDate || !eventLocation.trim() || !customerPhone.trim()) {
    toast.error("Please fill in the required fields");
    return;
  }

  try {
    setBookingLoading(true);

    const result = await createBooking({
      serviceId: service._id,
      vendorId: service.vendorId || "",
      customerId: session.user.id,
      customerName: session.user.name,
      customerEmail: session.user.email,
      customerPhone,
      eventDate,
      eventLocation,
      message,
    });

    if (!result.success) {
      toast.error(result.message || "Booking request failed");
      setBookingLoading(false);
      return;
    }

    toast.success("Booking request sent successfully!");

    window.location.reload();
  } catch (error) {
    console.log(error);
    toast.error("Failed to send booking request");
    setBookingLoading(false);
  }
};


  if (loading || isPending) {
    return (
      <div className="mx-auto max-w-6xl animate-pulse px-6 py-16">
        <div className="h-96 rounded-2xl bg-[#F5EFEC]" />
      </div>
    )
  }

  if (!service) {
    return (
      <div className="py-24 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Service Not Found</h2>
        <Link
          href="/browse-services"
          className="mt-5 inline-block text-[#A65D55]"
        >
          Back to Browse Services
        </Link>
      </div>
    )
  }

  const isOwnService = session?.user?.id === service.vendorId
  const isCustomer = session?.user?.role === "customer"

  return (
    <section className="min-h-screen bg-[#FCFAF9] px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/browse-services"
          className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#A65D55]"
        >
          <ArrowLeft size={17} />
          Back to Services
        </Link>

        <div className="grid gap-10 md:grid-cols-2">
          {/* Image Gallery */}
          <div>
            <div className="h-80 overflow-hidden rounded-2xl bg-[#F5EFEC] sm:h-[450px]">
              {selectedImage ? (
                <a href={selectedImage} target="_blank" rel="noreferrer">
                  <img
                    src={selectedImage}
                    alt={service.serviceName}
                    className="h-full w-full cursor-zoom-in object-cover"
                  />
                </a>
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  No Image Available
                </div>
              )}
            </div>

            {service.images?.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
                {service.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(image)}
                    className={`h-20 overflow-hidden rounded-xl border-2 ${
                      selectedImage === image
                        ? "border-[#A65D55]"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${service.serviceName} ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {service.images?.length > 1 && (
              <p className="mt-2 text-xs text-gray-500">
                {service.images.length} images available. Select a thumbnail to
                view.
              </p>
            )}
          </div>

          {/* Service Information */}
          <div>
            <span className="rounded-full bg-[#F8EFED] px-4 py-2 text-xs font-semibold text-[#A65D55]">
              {service.category}
            </span>

            <h1 className="mt-5 text-3xl font-bold text-gray-900">
              {service.serviceName}
            </h1>

            <p className="mt-4 text-3xl font-bold text-[#A65D55]">
              ৳{Number(service.price).toLocaleString("en-BD")}
            </p>
            <span
              className={`mt-4 inline-block rounded-full px-4 py-2 text-xs font-semibold ${
                service.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {service.isActive ? "Active" : "Inactive"}
            </span>

            <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
              <MapPin size={18} className="text-[#A65D55]" />
              {service.location}
            </div>

            <div className="mt-8 border-t border-[#F0E5E1] pt-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Service Description
              </h2>
              <p className="mt-3 text-sm leading-7 whitespace-pre-line text-gray-600">
                {service.description}
              </p>
            </div>

            <div className="mt-8 rounded-xl border border-[#F0E5E1] bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-[#F8EFED] p-3 text-[#A65D55]">
                  <BriefcaseBusiness size={20} />
                </div>

                <div>
                  <p className="text-xs text-gray-400">Service Provider</p>
                  <p className="mt-1 font-semibold text-gray-800">
                    {service.vendorName || "WedNest Vendor"}
                  </p>

                  <p className="mt-2 text-sm text-gray-500">
                    Email: {service.vendorEmail || "Email not available"}
                  </p>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div className="mt-8 rounded-2xl border border-[#F0E5E1] bg-white p-6">
              <h2 className="text-xl font-bold text-gray-900">
                Book This Service
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Send a booking request to this service provider.
              </p>

              {!session ? (
                <div className="mt-5 rounded-xl bg-[#F8EFED] p-4 text-sm text-gray-600">
                  Please{" "}
                  <Link
                    href="/signin"
                    className="font-semibold text-[#A65D55] underline"
                  >
                    sign in
                  </Link>{" "}
                  to book this service.
                </div>
              ) : isOwnService ? (
                <p className="mt-5 rounded-xl bg-[#F8EFED] p-4 text-sm text-gray-600">
                  You cannot book your own service.
                </p>
              ) : !service.isActive ? (
                <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-600">
                  This service is currently inactive. Booking is unavailable.
                </p>
              ) : session.user.role !== "customer" ? (
                <p className="mt-5 rounded-xl bg-[#F8EFED] p-4 text-sm text-gray-600">
                  Only customers can book services. Vendors cannot book
                  services.
                </p>
              ) : bookingCheckLoading ? (
                <p className="mt-5 text-sm text-gray-500">
                  Checking your booking...
                </p>
              ) : existingBooking ? (
                <div className="mt-5 rounded-xl border border-[#F0E5E1] bg-[#FCFAF9] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-gray-800">
                      Your Booking Details
                    </h3>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                        existingBooking.status === "accepted"
                          ? "bg-green-100 text-green-700"
                          : existingBooking.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : existingBooking.status === "cancelled"
                              ? "bg-gray-100 text-gray-600"
                              : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {existingBooking.status}
                    </span>
                  </div>

                  <div className="mt-5 space-y-3 text-sm text-gray-600">
                    <p>
                      <span className="font-semibold text-gray-800">
                        Event Date:
                      </span>{" "}
                      {existingBooking.eventDate}
                    </p>

                    <p>
                      <span className="font-semibold text-gray-800">
                        Event Location:
                      </span>{" "}
                      {existingBooking.eventLocation}
                    </p>

                    <p>
                      <span className="font-semibold text-gray-800">
                        Message:
                      </span>{" "}
                      {existingBooking.message || "No message provided"}
                    </p>

                    <p>
                      <span className="font-semibold text-gray-800">
                        Booking ID:
                      </span>{" "}
                      {existingBooking._id}
                    </p>
                  </div>

                  <p className="mt-5 border-t border-[#F0E5E1] pt-4 text-sm text-gray-500">
                    You have already sent a booking request for this service.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBooking} className="mt-5 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Event Date *
                    </label>
                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      required
                      className="h-12 w-full rounded-xl border border-[#EDE3DF] px-4 text-sm outline-none focus:border-[#A65D55]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Event Location *
                    </label>
                    <input
                      type="text"
                      value={eventLocation}
                      onChange={(e) => setEventLocation(e.target.value)}
                      placeholder="Enter your event location"
                      required
                      className="h-12 w-full rounded-xl border border-[#EDE3DF] px-4 text-sm outline-none focus:border-[#A65D55]"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      required
                      className="h-12 w-full rounded-xl border border-[#EDE3DF] px-4 text-sm outline-none focus:border-[#A65D55]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Message (Optional)
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell the vendor about your requirements..."
                      rows={4}
                      className="w-full rounded-xl border border-[#EDE3DF] px-4 py-3 text-sm outline-none focus:border-[#A65D55]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="w-full rounded-xl bg-[#A65D55] py-3.5 text-sm font-semibold text-white transition hover:bg-[#884840] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {bookingLoading
                      ? "Sending Request..."
                      : "Send Booking Request"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

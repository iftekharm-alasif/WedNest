"use client"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Search,
  RefreshCw,
  Store,
  Clock3,
  CheckCircle2,
  XCircle,
  Trash2,
  MapPin,
  CalendarDays,
  LoaderCircle,
  PackageSearch,
  ShieldCheck,
} from "lucide-react"
import { toast } from "sonner"
import {
  getAdminServices,
  updateServiceStatus,
  deleteAdminService,
} from "@/lib/actions/admin-services-api"

type Service = {
  _id: string
  serviceName: string
  category: string
  price: number
  location: string
  description: string
  images: string[]
  status: string
  isActive: boolean
  vendorName: string
  vendorEmail: string
  createdAt: string | null
}

type FilterType = "all" | "pending" | "approved" | "rejected"

export default function AdminServicesPage() {
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<FilterType>("all")
  const [updatingId, setUpdatingId] = useState("")

  const loadServices = async () => {
    setLoading(true)

    const result = await getAdminServices()

    if (result.success) {
      setServices(result.services as Service[])
    } else {
      toast.error(result.message)
    }

    setLoading(false)
  }

  useEffect(() => {
    let active = true

    getAdminServices().then((result) => {
      if (!active) return

      if (result.success) {
        setServices(result.services as Service[])
      } else {
        toast.error(result.message)
      }

      setLoading(false)
    })

    return () => {
      active = false
    }
  }, [])

  const pendingCount = services.filter(
    (service) => service.status === "pending"
  ).length

  const approvedCount = services.filter(
    (service) => service.status === "approved"
  ).length

  const rejectedCount = services.filter(
    (service) => service.status === "rejected"
  ).length

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const searchText = search.toLowerCase()

      const matchesSearch =
        service.serviceName.toLowerCase().includes(searchText) ||
        service.category.toLowerCase().includes(searchText) ||
        service.vendorName.toLowerCase().includes(searchText) ||
        service.location.toLowerCase().includes(searchText)

      const matchesFilter = filter === "all" || service.status === filter

      return matchesSearch && matchesFilter
    })
  }, [services, search, filter])

  const handleStatusChange = async (
    serviceId: string,
    status: "approved" | "rejected"
  ) => {
    setUpdatingId(serviceId)

    const result = await updateServiceStatus(serviceId, status)

    if (result.success) {
      toast.success(result.message)
      await loadServices()
    } else {
      toast.error(result.message)
    }

    setUpdatingId("")
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    const service = deleteTarget
    setUpdatingId(service._id)

    try {
      const result = await deleteAdminService(service._id)

      if (result.success) {
        toast.success("Service deleted successfully!")
        setServices((prev) => prev.filter((item) => item._id !== service._id))
        setDeleteTarget(null)
      } else {
        toast.error(result.message || "Failed to delete service.")
      }
    } catch {
      toast.error("Something went wrong while deleting the service.")
    } finally {
      setUpdatingId("")
    }
  }

  const getStatusStyle = (status: string) => {
    if (status === "approved") {
      return "bg-green-50 text-green-700 border-green-100"
    }

    if (status === "rejected") {
      return "bg-red-50 text-red-700 border-red-100"
    }

    return "bg-amber-50 text-amber-700 border-amber-100"
  }

  const tabs: {
    label: string
    value: FilterType
    count: number
  }[] = [
    { label: "All Services", value: "all", count: services.length },
    { label: "Pending", value: "pending", count: pendingCount },
    { label: "Approved", value: "approved", count: approvedCount },
    { label: "Rejected", value: "rejected", count: rejectedCount },
  ]

  return (
    <div className="min-h-screen space-y-7 bg-[#FAF8F7] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#A65D55]">
            <ShieldCheck size={17} />
            Admin Management
          </div>

          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Service Management
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Review vendor services, manage approvals and monitor listings.
          </p>
        </div>

        <button
          onClick={loadServices}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl border border-[#F0E5E1] bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-[#FFF8F6] disabled:opacity-60"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-[#F0E5E1] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Services</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {services.length}
              </h2>
            </div>
            <div className="rounded-xl bg-[#FFF1ED] p-3 text-[#A65D55]">
              <Store size={23} />
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-400">All vendor listings</p>
        </div>

        <div className="rounded-2xl border border-[#F0E5E1] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Review</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {pendingCount}
              </h2>
            </div>
            <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
              <Clock3 size={23} />
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-400">Waiting for approval</p>
        </div>

        <div className="rounded-2xl border border-[#F0E5E1] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Approved</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {approvedCount}
              </h2>
            </div>
            <div className="rounded-xl bg-green-50 p-3 text-green-600">
              <CheckCircle2 size={23} />
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-400">Approved listings</p>
        </div>

        <div className="rounded-2xl border border-[#F0E5E1] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Rejected</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {rejectedCount}
              </h2>
            </div>
            <div className="rounded-xl bg-red-50 p-3 text-red-600">
              <XCircle size={23} />
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-400">Rejected listings</p>
        </div>
      </div>

      {/* Services Section */}
      <div className="overflow-hidden rounded-2xl border border-[#F0E5E1] bg-white shadow-sm">
        <div className="space-y-5 border-b border-[#F0E5E1] p-5 sm:p-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              All Vendor Services
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Review and manage services submitted by vendors.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    filter === tab.value
                      ? "bg-[#A65D55] text-white shadow-sm"
                      : "border border-[#F0E5E1] bg-white text-gray-600 hover:bg-[#FFF8F6]"
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 opacity-75">{tab.count}</span>
                </button>
              ))}
            </div>

            <div className="relative">
              <Search
                size={18}
                className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search services..."
                className="w-full rounded-xl border border-[#EAE2DF] py-3 pr-4 pl-10 text-sm transition outline-none focus:border-[#A65D55] sm:w-64"
              />
            </div>
          </div>
        </div>

        {/* Service Cards */}
        <div className="p-5 sm:p-6">
          {loading ? (
            <div className="py-20 text-center">
              <LoaderCircle
                size={30}
                className="mx-auto animate-spin text-[#A65D55]"
              />
              <p className="mt-3 text-sm text-gray-500">Loading services...</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="py-20 text-center">
              <PackageSearch size={38} className="mx-auto text-gray-300" />
              <h3 className="mt-4 font-bold text-gray-800">
                No services found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try changing your search or selected filter.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {filteredServices.map((service) => (
                <div
                  key={service._id}
                  className="overflow-hidden rounded-2xl border border-[#F0E5E1] bg-white transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-[#F8F2EF]">
                    {service.images?.[0] ? (
                      <img
                        src={service.images[0]}
                        alt={service.serviceName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-300">
                        <Store size={42} />
                      </div>
                    )}

                    <span
                      className={`absolute top-3 right-3 rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(service.status)}`}
                    >
                      {service.status}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="space-y-4 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold tracking-wide text-[#A65D55] uppercase">
                          {service.category}
                        </p>
                        <h3 className="mt-1 text-lg font-bold text-gray-900">
                          {service.serviceName}
                        </h3>
                      </div>

                      <p className="text-base font-bold whitespace-nowrap text-[#A65D55]">
                        ৳{service.price.toLocaleString("en-BD")}
                      </p>
                    </div>

                    <p className="line-clamp-2 min-h-10 text-sm leading-6 text-gray-500">
                      {service.description || "No description provided."}
                    </p>

                    <div className="space-y-2 border-t border-[#F3EEEC] pt-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Store size={15} className="text-[#A65D55]" />
                        <span className="font-medium">
                          {service.vendorName}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin size={15} />
                        <span>{service.location}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <CalendarDays size={14} />
                        <span>
                          {service.createdAt
                            ? new Date(service.createdAt).toLocaleDateString()
                            : "Date unavailable"}
                        </span>
                      </div>
                    </div>

                    {/* Vendor availability */}
                    <div className="flex items-center justify-between rounded-xl bg-[#FAF8F7] px-3 py-2.5">
                      <span className="text-xs font-medium text-gray-500">
                        Vendor Availability
                      </span>
                      <span
                        className={`text-xs font-semibold ${
                          service.isActive ? "text-green-700" : "text-gray-500"
                        }`}
                      >
                        {service.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2 pt-1">
                      <Link
                        href={`/service-details/${service._id}`}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#A65D55] bg-white px-3 py-2.5 text-sm font-semibold text-[#A65D55] transition hover:bg-[#FFF1ED]"
                      >
                        View Service Details
                      </Link>

                      <div className="flex flex-wrap gap-2">
                        {service.status !== "approved" && (
                          <button
                            onClick={() =>
                              handleStatusChange(service._id, "approved")
                            }
                            disabled={updatingId === service._id}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-green-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                          >
                            {updatingId === service._id ? (
                              <LoaderCircle
                                size={15}
                                className="animate-spin"
                              />
                            ) : (
                              <CheckCircle2 size={15} />
                            )}
                            Approve
                          </button>
                        )}

                        {service.status !== "rejected" && (
                          <button
                            onClick={() =>
                              handleStatusChange(service._id, "rejected")
                            }
                            disabled={updatingId === service._id}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                          >
                            <XCircle size={15} />
                            Reject
                          </button>
                        )}

                        <button
                          onClick={() => setDeleteTarget(service)}
                          disabled={updatingId === service._id}
                          title="Delete service"
                          className="flex items-center justify-center rounded-xl border border-[#F0E5E1] px-3 py-2.5 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                          {updatingId === service._id ? (
                            <LoaderCircle size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between gap-2 border-t border-[#F0E5E1] px-6 py-4 text-xs text-gray-500 sm:flex-row sm:items-center">
          <p>
            Showing {filteredServices.length} of {services.length} services
          </p>
          <p>WedNest Admin Panel</p>
        </div>
      </div>
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open && !updatingId) {
            setDeleteTarget(null)
          }
        }}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-gray-900">
              Delete Service?
            </AlertDialogTitle>

            <AlertDialogDescription className="text-sm text-gray-500">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-gray-900">
                {deleteTarget?.serviceName}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!updatingId} className="rounded-xl">
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={!!updatingId}
              className="rounded-xl bg-red-600 text-white hover:bg-red-700"
            >
              {updatingId === deleteTarget?._id
                ? "Deleting..."
                : "Delete Service"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

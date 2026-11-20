
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import {
  getServices,
  deleteService,
  updateServiceActive,
} from "@/lib/actions/services"
import { toast } from "sonner"
import {
  Plus,
  MapPin,
  Pencil,
  Trash2,
  BriefcaseBusiness,
} from "lucide-react"

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

type Service = {
  _id: string
  vendorId: string
  serviceName: string
  category: string
  price: number
  location: string
  images: string[]
  status: string
  isActive: boolean
  createdAt: string
}

export default function ServicesPage() {
  const { data: session, isPending } = authClient.useSession()

  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [deleting, setDeleting] = useState(false)

useEffect(() => {
  if (isPending) return

  const loadServices = async () => {
    if (!session?.user?.id) {
      setServices([])
      setLoading(false)
      return
    }

    try {
      const result = await getServices()

      const myServices = result.filter(
        (item: Service) => item.vendorId === session.user.id
      )

      const sortedServices = myServices.sort(
        (a: Service, b: Service) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )

      setServices(sortedServices)
    } catch {
      toast.error("Failed to load services")
    } finally {
      setLoading(false)
    }
  }

  loadServices()
}, [session?.user?.id, isPending])

  const handleDelete = async () => {
    if (!selectedService) return

    try {
      setDeleting(true)

      const result = await deleteService(selectedService._id)

      if (result.success) {
        setServices((prev) =>
          prev.filter((item) => item._id !== selectedService._id)
        )

        toast.success("Service deleted successfully")
        setSelectedService(null)
      } else {
        toast.error(result.message || "Failed to delete service")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setDeleting(false)
    }
  }

  const handleActiveChange = async (item: Service) => {
    const newActiveStatus = !item.isActive

    try {
      const result = await updateServiceActive(item._id, newActiveStatus)

      if (result.success) {
        setServices((prev) =>
          prev.map((service) =>
            service._id === item._id
              ? { ...service, isActive: newActiveStatus }
              : service
          )
        )

        toast.success(
          newActiveStatus
            ? "Service activated successfully"
            : "Service deactivated successfully"
        )
      } else {
        toast.error(result.message || "Failed to update service")
      }
    } catch {
      toast.error("Something went wrong")
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-sm font-medium text-[#A65D55]">
            Vendor Dashboard
          </p>
          <h1 className="text-2xl font-bold text-[#333] sm:text-3xl">
            My Services
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage and organize your wedding services.
          </p>
        </div>

        <Link
          href="/dashboard/vendor/add-service"
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#A65D55] px-5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#884840] hover:shadow-md"
        >
          <Plus size={18} />
          Add New Service
        </Link>
      </div>

      {!loading && (
        <div className="flex items-center gap-3 rounded-xl border border-[#F0E5E1] bg-white p-4">
          <div className="flex size-11 items-center justify-center rounded-xl bg-[#F8EFED] text-[#A65D55]">
            <BriefcaseBusiness size={21} />
          </div>

          <div>
            <p className="text-xl font-bold text-gray-800">
              {services.length}
            </p>
            <p className="text-xs text-gray-500">Total Services</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-[360px] animate-pulse rounded-2xl bg-[#F5EFEC]"
            />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E8D8D3] bg-white py-20 text-center">
          <BriefcaseBusiness
            className="mx-auto mb-4 text-[#A65D55]"
            size={42}
          />
          <h2 className="text-lg font-semibold text-gray-800">
            No services yet
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Start by adding your first wedding service.
          </p>

          <Link
            href="/dashboard/vendor/add-service"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#A65D55] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#884840]"
          >
            <Plus size={17} />
            Add Your First Service
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((item) => (
            <div
              key={item._id}
              className="group overflow-hidden rounded-2xl border border-[#F0E5E1] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#D6A69D] hover:shadow-xl"
            >
              <div className="relative h-52 overflow-hidden bg-[#F8F1EE]">
                {item.images?.[0] ? (
                  <img
                    src={item.images[0]}
                    alt={item.serviceName}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[#C5A49D]">
                    <BriefcaseBusiness size={45} />
                  </div>
                )}

                <span className="absolute top-4 left-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#A65D55] shadow-sm">
                  {item.category}
                </span>
              </div>

              <div className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                      item.status === "approved"
                        ? "border-green-200 bg-green-50 text-green-700"
                        : item.status === "pending"
                          ? "border-yellow-200 bg-yellow-50 text-yellow-700"
                          : "border-red-200 bg-red-50 text-red-700"
                    }`}
                  >
                    {item.status}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500">
                      {item.isActive ? "Active" : "Inactive"}
                    </span>

                    <button
                      type="button"
                      disabled={item.status !== "approved"}
                      onClick={() => handleActiveChange(item)}
                      className={`relative h-6 w-11 rounded-full transition ${
                        item.isActive ? "bg-green-500" : "bg-gray-300"
                      } disabled:cursor-not-allowed disabled:opacity-40`}
                    >
                      <span
                        className={`absolute top-1 size-4 rounded-full bg-white shadow transition-all ${
                          item.isActive ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div>
                  <h2 className="line-clamp-1 text-lg font-bold text-gray-800 transition group-hover:text-[#A65D55]">
                    {item.serviceName}
                  </h2>

                  <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
                    <MapPin size={15} className="text-[#A65D55]" />
                    <span className="line-clamp-1">{item.location}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[#F0E5E1] pt-4">
                  <div>
                    <p className="text-xs text-gray-400">Starting Price</p>
                    <p className="mt-1 text-xl font-bold text-[#A65D55]">
                      ৳{Number(item.price).toLocaleString("en-BD")}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/vendor/services/edit/${item._id}`}
                      title="Edit service"
                      className="flex size-10 items-center justify-center rounded-xl bg-[#F8EFED] text-[#A65D55] transition hover:bg-[#A65D55] hover:text-white"
                    >
                      <Pencil size={17} />
                    </Link>

                    <button
                      onClick={() => setSelectedService(item)}
                      title="Delete service"
                      className="flex size-10 items-center justify-center rounded-xl bg-red-50 text-red-500 transition hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog
        open={!!selectedService}
        onOpenChange={(open) => {
          if (!open && !deleting) setSelectedService(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-800">
                {selectedService?.serviceName}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={deleting}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {deleting ? "Deleting..." : "Yes, Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

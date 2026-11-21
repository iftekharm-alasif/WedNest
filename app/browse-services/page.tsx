"use client"

import { useEffect, useState } from "react"
import { getBrowseServices } from "@/lib/actions/services"
import {
  Search,
  MapPin,
  SlidersHorizontal,
  X,
  BriefcaseBusiness,
} from "lucide-react"
import Link from "next/link"

type Service = {
  _id: string
  serviceName: string
  category: string
  description: string
  price: number
  location: string
  images: string[]
  vendorName?: string
  isActive: boolean
}

export default function BrowseServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All Categories")
  const [sort, setSort] = useState("default")

  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await getBrowseServices()
        setServices(data)
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }

    loadServices()
  }, [])

  const categories = [
    "All Categories",
    ...Array.from(new Set(services.map((item) => item.category))),
  ]

  const filteredServices = services
    .filter((item) => {
      const searchText = search.toLowerCase()

      const matchesSearch =
        item.serviceName.toLowerCase().includes(searchText) ||
        item.category.toLowerCase().includes(searchText) ||
        item.location.toLowerCase().includes(searchText) ||
        (item.vendorName || "").toLowerCase().includes(searchText)

      const matchesCategory =
        category === "All Categories" || item.category === category

      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      if (sort === "low-to-high") return a.price - b.price
      if (sort === "high-to-low") return b.price - a.price
      return 0
    })

  const clearFilters = () => {
    setSearch("")
    setCategory("All Categories")
    setSort("default")
  }

  if (loading) {
    return (
      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-16 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-80 animate-pulse rounded-2xl bg-[#F5EFEC]"
          />
        ))}
      </div>
    )
  }

  return (
    <section className="min-h-screen bg-[#FCFAF9]">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#A65D55] to-[#884840] px-6 py-16 text-center text-white sm:py-20">
        <p className="mb-3 text-sm font-medium tracking-[3px] text-white/75 uppercase">
          Make Your Day Special
        </p>

        <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
          Explore Wedding Services
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
          Find the perfect vendors and services to make your dream wedding
          unforgettable.
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Search and Filters */}
        {/* Search */}
        <div className="relative -mt-20 rounded-2xl border border-[#F0E5E1] bg-white p-5 shadow-lg sm:p-6">
          <div className="relative">
            <Search
              size={19}
              className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services, vendors..."
              className="h-12 w-full rounded-xl border border-[#EDE3DF] bg-[#FCFAF9] pr-4 pl-11 text-sm transition outline-none focus:border-[#A65D55] focus:ring-2 focus:ring-[#A65D55]/10"
            />
          </div>

          {/* Filters */}
          <div className="mt-5 flex flex-col justify-between gap-4 border-t border-[#F0E5E1] pt-5 sm:flex-row sm:items-center">
            {/* Left Side */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <SlidersHorizontal size={17} />
                Filter:
              </div>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-11 min-w-44 rounded-xl border border-[#EDE3DF] bg-[#FCFAF9] px-4 text-sm text-gray-700 outline-none focus:border-[#A65D55]"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              {(search ||
                category !== "All Categories" ||
                sort !== "default") && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-sm font-semibold text-[#A65D55] hover:text-[#884840]"
                >
                  <X size={15} />
                  Clear
                </button>
              )}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              <span className="text-sm whitespace-nowrap text-gray-500">
                Sort by:
              </span>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-11 min-w-44 rounded-xl border border-[#EDE3DF] bg-[#FCFAF9] px-4 text-sm text-gray-700 outline-none focus:border-[#A65D55]"
              >
                <option value="default">Default</option>
                <option value="low-to-high">Price: Low to High</option>
                <option value="high-to-low">Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            Showing{" "}
            <span className="font-semibold text-[#A65D55]">
              {filteredServices.length}
            </span>{" "}
            of {services.length} services
          </div>
        </div>

        {/* Services */}
        <div className="mt-10">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Wedding Services
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Discover trusted services for your special day.
            </p>
          </div>

          {filteredServices.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#E8D8D3] bg-white py-20 text-center">
              <BriefcaseBusiness
                size={42}
                className="mx-auto mb-4 text-[#D6A69D]"
              />
              <h3 className="text-lg font-semibold text-gray-800">
                No services found
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Try another search or change your filters.
              </p>

              <button
                onClick={clearFilters}
                className="mt-5 rounded-xl bg-[#A65D55] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#884840]"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredServices.map((item) => (
                <div
                  key={item._id}
                  className="group overflow-hidden rounded-2xl border border-[#F0E5E1] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#D6A69D] hover:shadow-xl"
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden bg-[#F8EFED]">
                    <img
                      src={item.images?.[0] || "/placeholder.png"}
                      alt={item.serviceName}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    <span className="absolute top-4 left-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#A65D55] shadow-sm">
                      {item.category}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="space-y-4 p-5">
                    <div>
                      <h3 className="line-clamp-1 text-lg font-bold text-gray-800 transition group-hover:text-[#A65D55]">
                        {item.serviceName}
                      </h3>

                      <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-gray-500">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin size={16} className="shrink-0 text-[#A65D55]" />
                      <span className="line-clamp-1">{item.location}</span>
                    </div>

                    <div className="border-t border-[#F0E5E1] pt-4">
                      <p className="text-xs text-gray-400">Provided by</p>
                      <p className="mt-1 font-medium text-gray-700">
                        {item.vendorName || "WedNest Vendor"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#F0E5E1] pt-4">
                      <div>
                        <p className="text-xs text-gray-400">Starting Price</p>
                        <p className="mt-1 text-xl font-bold text-[#A65D55]">
                          ৳{Number(item.price).toLocaleString("en-BD")}
                        </p>
                      </div>

                      <span
                        className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                          item.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/service-details/${item._id}`}
                    className="block w-full rounded-xl bg-[#A65D55] py-3 text-center text-sm font-semibold text-white transition hover:bg-[#884840]"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

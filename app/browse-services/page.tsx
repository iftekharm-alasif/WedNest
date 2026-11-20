
"use client";

import { useEffect, useState } from "react";
import { getBrowseServices } from "@/lib/actions/services";

type Service = {
  _id: string;
  serviceName: string;
  category: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  vendorName?: string;
};

export default function BrowseServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await getBrowseServices();
        setServices(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  if (loading) {
    return <p className="py-20 text-center">Loading services...</p>;
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="mb-2 text-3xl font-bold text-[#A65D55]">
        Browse Services
      </h1>

      <p className="mb-8 text-gray-500">
        Explore wedding services from our vendors.
      </p>

      {services.length === 0 ? (
        <p className="py-16 text-center text-gray-500">
          No services available right now.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((item) => (
            <div
              key={item._id}
              className="overflow-hidden rounded-2xl border border-[#F0E5E1] bg-white"
            >
              <img
                src={item.images?.[0] || "/placeholder.png"}
                alt={item.serviceName}
                className="h-56 w-full object-cover"
              />

              <div className="space-y-3 p-5">
                <p className="text-sm text-[#A65D55]">
                  {item.category}
                </p>

                <h2 className="text-xl font-semibold">
                  {item.serviceName}
                </h2>

                <p className="text-sm text-gray-500">
                  {item.description}
                </p>

                <p className="text-sm text-gray-500">
                  📍 {item.location}
                </p>

                <p className="text-sm text-gray-500">
                  Vendor: {item.vendorName || "WedNest Vendor"}
                </p>

                <p className="text-lg font-bold text-[#A65D55]">
                  ৳{item.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

type ServiceData = {
  serviceName: string;
  category: string;
  description: string;
  price: string | number;
  location: string;
  images: string[];
};

export const createServices = async (data: ServiceData) => {
  const res = await fetch(`${BASE_URL}/services`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
};

// Get Services
export const getServices = async () => {
  const res = await fetch(`${BASE_URL}/services`);
  return res.json();
};

export const uploadServiceImages = async (files: File[]) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("images", file);
  });

  const res = await fetch(`${BASE_URL}/upload-images`, {
    method: "POST",
    body: formData,
  });

  return res.json();
};

// Delete Service
export const deleteService = async (id: string) => {
  const res = await fetch(`${BASE_URL}/services/${id}`, {
    method: "DELETE",
  });

  return res.json();
};

export const updateServiceActive = async (
  id: string,
  isActive: boolean
) => {
  const res = await fetch(`${BASE_URL}/services/${id}/active`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ isActive }),
  });

  return res.json();
};

export const getBrowseServices = async () => {
  const res = await fetch(`${BASE_URL}/browse-services`);

  if (!res.ok) {
    throw new Error("Failed to load services");
  }

  return res.json();
};

export const uploadImageFromUrl = async (imageUrl: string) => {
  const res = await fetch(`${BASE_URL}/upload-image-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageUrl }),
  });

  return res.json();
};

export const getServiceById = async (id: string) => {
  const res = await fetch(`${BASE_URL}/services/${id}`);

  if (!res.ok) {
    throw new Error("Failed to load service details");
  }

  return res.json();
};

// Create Booking
export const createBooking = async (data: {
  serviceId: string;
  vendorId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventDate: string;
  eventLocation: string;
  message: string;
}) => {
  const res = await fetch(`${BASE_URL}/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
};


// Get Vendor Bookings
export const getVendorBookings = async (vendorId: string) => {
  const res = await fetch(
    `${BASE_URL}/vendor-bookings?vendorId=${vendorId}`
  );

  if (!res.ok) {
    throw new Error("Failed to load bookings");
  }

  return res.json();
};

// Update Booking Status
export const updateBookingStatus = async (
  id: string,
  status: "accepted" | "rejected"
) => {
  const res = await fetch(`${BASE_URL}/bookings/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  return res.json();
};

// Get Customer Bookings
export const getCustomerBookings = async (customerId: string) => {
  const res = await fetch(
    `${BASE_URL}/customer-bookings?customerId=${customerId}`,
  );

  if (!res.ok) {
    throw new Error("Failed to load bookings");
  }

  return res.json();
};

// Cancel Customer Booking
export const cancelCustomerBooking = async (
  id: string,
  customerId: string,
) => {
  const res = await fetch(`${BASE_URL}/bookings/${id}/cancel`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ customerId }),
  });

  return res.json();
};

// Get Customer Booking
export const getCustomerBooking = async (
  serviceId: string,
  customerId: string
) => {
  const res = await fetch(
    `${BASE_URL}/customer-booking?serviceId=${serviceId}&customerId=${customerId}`
  );

  if (!res.ok) {
    throw new Error("Failed to load booking");
  }

  return res.json();
};


export const updateService = async (
  id: string,
  data: {
    serviceName: string;
    category: string;
    description: string;
    price: string | number;
    location: string;
    images: string[];
    vendorId: string;
  }
) => {
  try {
    const res = await fetch(`${BASE_URL}/services/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const responseText = await res.text();

    console.log("Update API Status:", res.status);
    console.log("Update API Response:", responseText);

    const result = JSON.parse(responseText);

    if (!res.ok) {
      throw new Error(result.message || "Service update failed");
    }

    return result;
  } catch (error) {
    console.error("Update Service Action Error:", error);
    throw error;
  }
};

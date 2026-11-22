import { authClient } from "@/lib/auth-client";

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

// Create Services
export const createServices = async (data: ServiceData) => {
  try {
    const { data: tokenData } = await authClient.token();

    if (!tokenData?.token) {
      throw new Error("Please login first");
    }

    const res = await fetch(`${BASE_URL}/services`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenData.token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.message || "Failed to create service");
    }

    return result;
  } catch (error) {
    console.error("Create Service Error:", error);
    throw error;
  }
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
  try {
    const { data } = await authClient.token();

    if (!data?.token) {
      throw new Error("Please login first");
    }

    const res = await fetch(`${BASE_URL}/services/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${data.token}`,
      },
    });

    const result = await res.json();

    console.log("Delete API Status:", res.status);
    console.log("Delete API Response:", result);

    if (!res.ok) {
      throw new Error(result.message || "Failed to delete service");
    }

    return result;
  } catch (error) {
    console.error("Delete Service Error:", error);
    throw error;
  }
};



export const updateServiceActive = async (
  id: string,
  isActive: boolean
) => {
  try {
    const { data } = await authClient.token();

    if (!data?.token) {
      throw new Error("Please login first");
    }

    const res = await fetch(`${BASE_URL}/services/${id}/active`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.token}`,
      },
      body: JSON.stringify({ isActive }),
    });

    const result = await res.json();

    console.log("Active Status API:", res.status, result);

    if (!res.ok) {
      throw new Error(result.message || "Failed to update active status");
    }

    return result;
  } catch (error) {
    console.error("Update Active Status Error:", error);
    throw error;
  }
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
  customerPhone: string;
  eventDate: string;
  eventLocation: string;
  message: string;
}) => {
  try {
    const { data: tokenData } = await authClient.token();

    if (!tokenData?.token) {
      throw new Error("Please login first");
    }

    const res = await fetch(`${BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenData.token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    console.log("Create Booking API:", res.status, result);

    if (!res.ok) {
      throw new Error(result.message || "Failed to create booking");
    }

    return result;
  } catch (error) {
    console.error("Create Booking Error:", error);
    throw error;
  }
};




// Get Vendor Bookings
export const getVendorBookings = async () => {
  try {
    const { data } = await authClient.token();

    if (!data?.token) {
      throw new Error("Please login first");
    }

    const res = await fetch(`${BASE_URL}/vendor-bookings`, {
      headers: {
        Authorization: `Bearer ${data.token}`,
      },
    });

    const result = await res.json();

    console.log("Vendor Bookings API:", res.status, result);

    if (!res.ok) {
      throw new Error(result.message || "Failed to load bookings");
    }

    return result;
  } catch (error) {
    console.error("Get Vendor Bookings Error:", error);
    throw error;
  }
};



// Update Booking Status
export const updateBookingStatus = async (
  id: string,
  status: "accepted" | "rejected" | "completed"
) => {
  try {
    const { data } = await authClient.token();

    if (!data?.token) {
      throw new Error("Please login first");
    }

    const res = await fetch(`${BASE_URL}/bookings/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.token}`,
      },
      body: JSON.stringify({ status }),
    });

    const result = await res.json();

    console.log("Update Booking Status API:", res.status, result);

    if (!res.ok) {
      throw new Error(result.message || "Failed to update booking");
    }

    return result;
  } catch (error) {
    console.error("Update Booking Status Error:", error);
    throw error;
  }
};



// Get Customer Bookings
export const getCustomerBookings = async () => {
  try {
    const { data } = await authClient.token();

    if (!data?.token) {
      throw new Error("Please login first");
    }

    const res = await fetch(`${BASE_URL}/customer-bookings`, {
      headers: {
        Authorization: `Bearer ${data.token}`,
      },
    });

    const result = await res.json();

    console.log("Customer Bookings API:", res.status, result);

    if (!res.ok) {
      throw new Error(result.message || "Failed to load bookings");
    }

    return result;
  } catch (error) {
    console.error("Get Customer Bookings Error:", error);
    throw error;
  }
};



// Cancel Customer Booking
export const cancelCustomerBooking = async (id: string) => {
  try {
    const { data } = await authClient.token();

    if (!data?.token) {
      throw new Error("Please login first");
    }

    const res = await fetch(`${BASE_URL}/bookings/${id}/cancel`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${data.token}`,
      },
    });

    const result = await res.json();

    console.log("Cancel Booking API:", res.status, result);

    if (!res.ok) {
      throw new Error(result.message || "Failed to cancel booking");
    }

    return result;
  } catch (error) {
    console.error("Cancel Customer Booking Error:", error);
    throw error;
  }
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
    // Get JWT token
    const { data: tokenData, error } = await authClient.token();

    if (!tokenData?.token) {
      throw new Error("Please login first");
    }

    // Send request with JWT
    const res = await fetch(`${BASE_URL}/services/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenData.token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    console.log("Update API Status:", res.status);
    console.log("Update API Response:", result);

    if (!res.ok) {
      throw new Error(result.message || "Service update failed");
    }

    return result;
  } catch (error) {
    console.error("Update Service Action Error:", error);
    throw error;
  }
};

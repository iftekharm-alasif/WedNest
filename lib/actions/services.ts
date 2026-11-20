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
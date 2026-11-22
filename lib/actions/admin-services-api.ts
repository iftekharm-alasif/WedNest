
import { authClient } from "@/lib/auth-client";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const getResponseData = async (res: Response) => {
  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch {
    console.error("Backend returned non-JSON response:", text);
    throw new Error(
      `Invalid backend response. HTTP Status: ${res.status}`
    );
  }
};

const getToken = async () => {
  const { data } = await authClient.token();

  if (!data?.token) {
    throw new Error("Please login first");
  }

  return data.token;
};

// Get Admin Services
export const getAdminServices = async () => {
  const token = await getToken();

  const res = await fetch(`${BASE_URL}/admin/services`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const result = await getResponseData(res);

  if (!res.ok) {
    throw new Error(result.message || "Failed to load services");
  }

  return result;
};

// Update Admin Service Status
export const updateServiceStatus = async (
  serviceId: string,
  status: "approved" | "rejected"
) => {
  const token = await getToken();

  const res = await fetch(
    `${BASE_URL}/admin/services/${serviceId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    }
  );

  const result = await getResponseData(res);

  if (!res.ok) {
    throw new Error(result.message || "Failed to update service status");
  }

  return result;
};

// Delete Admin Service
export const deleteAdminService = async (serviceId: string) => {
  const token = await getToken();

  const res = await fetch(`${BASE_URL}/admin/services/${serviceId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await getResponseData(res);

  if (!res.ok) {
    throw new Error(result.message || "Failed to delete service");
  }

  return result;
};

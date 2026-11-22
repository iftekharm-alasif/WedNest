
import { authClient } from "@/lib/auth-client";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export const getAdminServices = async () => {
  try {
    const { data } = await authClient.token();

    if (!data?.token) {
      throw new Error("Please login first");
    }

    const res = await fetch(`${BASE_URL}/admin/services`, {
      headers: {
        Authorization: `Bearer ${data.token}`,
      },
    });

    const result = await res.json();
    console.log("Admin Services Status:", res.status);
console.log("Admin Services Response:", result);

    if (!res.ok) {
      throw new Error(result.message || "Failed to load services");
    }

    return result;
  } catch (error) {
    console.error("Get Admin Services Error:", error);
    throw error;
  }
};



export const updateServiceStatus = async (
  serviceId: string,
  status: "approved" | "rejected"
) => {
  try {
    const { data } = await authClient.token();

    if (!data?.token) {
      throw new Error("Please login first");
    }

    const res = await fetch(
      `${BASE_URL}/admin/services/${serviceId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.token}`,
        },
        body: JSON.stringify({ status }),
      }
    );

    const result = await res.json();

    console.log("Update Admin Service Status:", res.status, result);

    if (!res.ok) {
      throw new Error(result.message || "Failed to update service status");
    }

    return result;
  } catch (error) {
    console.error("Update Admin Service Status Error:", error);
    throw error;
  }
};


export const deleteAdminService = async (serviceId: string) => {
  try {
    const { data } = await authClient.token();

    if (!data?.token) {
      throw new Error("Please login first");
    }

    const res = await fetch(`${BASE_URL}/admin/services/${serviceId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${data.token}`,
      },
    });

    const result = await res.json();

    console.log("Delete Admin Service:", res.status, result);

    if (!res.ok) {
      throw new Error(result.message || "Failed to delete service");
    }

    return result;
  } catch (error) {
    console.error("Delete Admin Service Error:", error);
    throw error;
  }
};

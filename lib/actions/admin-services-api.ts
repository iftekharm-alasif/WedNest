
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

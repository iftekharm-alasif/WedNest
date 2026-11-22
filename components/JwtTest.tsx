
"use client";

import { authClient } from "@/lib/auth-client";

export default function JwtTest() {
const testToken = async () => {
  const { data, error } = await authClient.token();

  if (!data?.token) {
    console.log("Token error:", error);
    return;
  }

  const response = await fetch("http://localhost:5000/api/protected", {
    headers: {
      Authorization: `Bearer ${data.token}`,
    },
  });

  const result = await response.json();

  console.log("Backend status:", response.status);
  console.log("Backend response:", JSON.stringify(result, null, 2));
};
  return (
    <button
      onClick={testToken}
      className="rounded bg-blue-600 px-4 py-2 text-white"
    >
      Test JWT
    </button>
  );
}

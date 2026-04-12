import { apiFetch } from "@/lib/api/client";

export type AuthUser = {
  id: number;
  fullName: string;
  email: string;
  role: "CLIENT" | "VENDOR" | "ADMIN" | "DELIVERY";
};

export async function loginUser(email: string, password: string) {
  // Login endpoint doesn't need role - server returns user with their actual role
  return apiFetch<AuthUser>("/api/auth/login", "CLIENT", {
    method: "POST",
    body: { email, password },
  });
}

// Internal helper for auth endpoints that work for any role
type AnyRole = "CLIENT" | "VENDOR" | "ADMIN" | "DELIVERY";

export async function registerUser(payload: {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  role: AnyRole;
}) {
  // Use the actual role from payload for registration
  return apiFetch<AuthUser>("/api/auth/register", payload.role, {
    method: "POST",
    body: payload,
  });
}

export async function logoutUser() {
  await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
}

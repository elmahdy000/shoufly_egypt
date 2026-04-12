import { apiFetch } from "@/lib/api/client";

export type AuthUser = {
  id: number;
  fullName: string;
  email: string;
  role: "CLIENT" | "VENDOR" | "ADMIN";
};

export async function loginUser(email: string, password: string) {
  return apiFetch<AuthUser>("/api/auth/login", "CLIENT", {
    method: "POST",
    body: { email, password },
  });
}

export async function registerUser(payload: {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  role: "CLIENT" | "VENDOR" | "ADMIN";
}) {
  return apiFetch<AuthUser>("/api/auth/register", "CLIENT", {
    method: "POST",
    body: payload,
  });
}

export async function logoutUser() {
  await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
}

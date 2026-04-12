import { apiFetch } from "@/lib/api/client";
import type { ApiUserSummary } from "@/lib/types/api";

export async function listAdminUsers() {
  return apiFetch<ApiUserSummary[]>("/api/admin/users", "ADMIN");
}

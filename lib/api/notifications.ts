import { apiFetch } from "@/lib/api/client";
import type { ApiNotification } from "@/lib/types/api";

export async function listNotifications(role: "CLIENT" | "VENDOR" | "ADMIN") {
  return apiFetch<ApiNotification[]>("/api/notifications", role);
}

export async function markNotificationRead(
  role: "CLIENT" | "VENDOR" | "ADMIN",
  notificationId: number
) {
  return apiFetch<ApiNotification>(`/api/notifications/${notificationId}/read`, role, { method: "PATCH" });
}

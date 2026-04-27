import { apiFetch } from "@/lib/api/client";
import type { ApiNotification } from "@/lib/types/api";

export async function listNotifications(
  role: "CLIENT" | "VENDOR" | "DELIVERY" | "ADMIN",
  limit = 20,
  offset = 0
) {
  return apiFetch<ApiNotification[]>(
    `/api/notifications?limit=${limit}&offset=${offset}`,
    role
  );
}

export async function listAllNotifications(
  role: "CLIENT" | "VENDOR" | "DELIVERY" | "ADMIN"
): Promise<ApiNotification[]> {
  const PAGE = 100;
  const result: ApiNotification[] = [];
  let offset = 0;
  while (true) {
    const page = await listNotifications(role, PAGE, offset);
    result.push(...page);
    if (page.length < PAGE) break;
    offset += PAGE;
  }
  return result;
}

export async function markNotificationRead(
  role: "CLIENT" | "VENDOR" | "DELIVERY" | "ADMIN",
  notificationId: number
) {
  return apiFetch<ApiNotification>(
    `/api/notifications/${notificationId}/read`,
    role,
    { method: "PATCH" }
  );
}

export async function markAllNotificationsRead(
  role: "CLIENT" | "VENDOR" | "DELIVERY" | "ADMIN"
) {
  return apiFetch<{ count: number }>(
    "/api/notifications/read-all",
    role,
    { method: "PATCH" }
  );
}

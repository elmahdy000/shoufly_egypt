import { apiFetch } from "@/lib/api/client";

export type DeliveryTask = {
  id: number;
  title: string;
  address: string;
  status: string;
  deliveryPhone: string;
  assignedDeliveryAgentId: number | null;
  category?: { name: string };
  deliveryTracking?: Array<{ status: string; createdAt: string }>;
};

export async function listDeliveryTasks() {
  return apiFetch<{ available: DeliveryTask[]; myTasks: DeliveryTask[] }>(
    "/api/delivery/tasks",
    "DELIVERY",
  );
}

export async function acceptDeliveryTask(requestId: number) {
  return apiFetch<{ id: number; status: string }>(
    `/api/delivery/tasks/${requestId}/accept`,
    "DELIVERY",
    { method: "POST" },
  );
}

export async function completeDeliveryTask(requestId: number, qrCode: string) {
  return apiFetch<{ requestId: number; status: string }>(
    `/api/delivery/tasks/${requestId}/complete`,
    "DELIVERY",
    { method: "PATCH", body: { qrCode } },
  );
}

export async function failDeliveryTask(requestId: number, reason?: string) {
  return apiFetch<{ id: number; status: string }>(
    `/api/delivery/tasks/${requestId}/fail`,
    "DELIVERY",
    { method: "POST", body: { reason } },
  );
}

export async function getDeliveryStats() {
  return apiFetch<{
    completed: number;
    active: number;
    failed: number;
    rating: number;
    walletBalance: number;
  }>("/api/delivery/stats", "DELIVERY");
}

import { apiFetch } from "@/lib/api/client";
import type { ApiDeliveryConfirmResult, ApiDeliveryEntry } from "@/lib/types/api";

export async function listClientDeliveryTimeline(requestId: number) {
  return apiFetch<ApiDeliveryEntry[]>(`/api/client/delivery/${requestId}`, "CLIENT");
}

export async function updateVendorDeliveryStatus(
  requestId: number,
  payload: { status: string; note?: string; locationText?: string }
) {
  return apiFetch<ApiDeliveryEntry>(`/api/vendor/delivery/${requestId}`, "VENDOR", { method: "PATCH", body: payload });
}

export async function markVendorDeliveryFailed(requestId: number, payload?: { note?: string; reason?: string }) {
  return apiFetch<ApiDeliveryEntry>(`/api/vendor/delivery/${requestId}/failed`, "VENDOR", { method: "POST", body: payload ?? {} });
}

export async function markVendorDeliveryReturned(requestId: number, payload?: { note?: string; reason?: string }) {
  return apiFetch<ApiDeliveryEntry>(`/api/vendor/delivery/${requestId}/returned`, "VENDOR", { method: "POST", body: payload ?? {} });
}

export async function confirmClientDelivery(requestId: number) {
  return apiFetch<ApiDeliveryConfirmResult>(`/api/client/qr/confirm/${requestId}`, "CLIENT", { method: "POST", body: {} });
}

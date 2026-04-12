import { apiFetch } from "@/lib/api/client";
import type { ApiRequestDetails, ApiRequestSummary } from "@/lib/types/api";

export type RequestCreatePayload = {
  title: string;
  description: string;
  categoryId: number;
  address: string;
  latitude: number;
  longitude: number;
  deliveryPhone: string;
  budget?: number;
  notes?: string;
  images?: Array<{
    filePath: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
  }>;
};

export async function listClientRequests() {
  return apiFetch<ApiRequestSummary[]>("/api/requests", "CLIENT");
}

export async function getRequestDetails(requestId: number) {
  return apiFetch<ApiRequestDetails>(`/api/requests/${requestId}`, "CLIENT");
}

export async function createClientRequest(payload: RequestCreatePayload) {
  return apiFetch<ApiRequestSummary>("/api/requests", "CLIENT", { method: "POST", body: payload });
}

export async function listVendorOpenRequests() {
  return apiFetch<ApiRequestSummary[]>("/api/vendor/requests/open", "VENDOR");
}

export async function listPendingAdminRequests() {
  return apiFetch<ApiRequestSummary[]>("/api/admin/requests/pending", "ADMIN");
}

export async function reviewAdminRequest(requestId: number, action: "approve" | "reject") {
  return apiFetch<ApiRequestSummary>(`/api/admin/requests/${requestId}/review`, "ADMIN", {
    method: "PATCH",
    body: { action },
  });
}

export async function dispatchAdminRequest(requestId: number) {
  return apiFetch<ApiRequestSummary>(`/api/admin/requests/${requestId}/dispatch`, "ADMIN", { method: "PATCH" });
}

export async function cancelClientRequest(requestId: number) {
  return apiFetch<{ success: true }>(`/api/requests/${requestId}`, "CLIENT", { method: "POST" });
}

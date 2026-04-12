import { apiFetch } from "@/lib/api/client";
import type { ApiBid } from "@/lib/types/api";

export async function createVendorBid(payload: {
  requestId: number;
  description: string;
  netPrice: number;
  images?: string[];
}) {
  return apiFetch<ApiBid>("/api/bids", "VENDOR", { method: "POST", body: payload });
}

export async function listVendorBids() {
  return apiFetch<ApiBid[]>("/api/vendor/bids", "VENDOR");
}

export async function listAdminRequestBids(requestId: number) {
  return apiFetch<ApiBid[]>(`/api/admin/requests/${requestId}/bids`, "ADMIN");
}

export async function forwardAdminBid(bidId: number) {
  return apiFetch<ApiBid>(`/api/admin/bids/${bidId}/forward`, "ADMIN", { method: "PATCH" });
}

export async function listClientForwardedOffers(requestId: number) {
  return apiFetch<ApiBid[]>(`/api/client/offers/request/${requestId}`, "CLIENT");
}

export async function acceptClientOffer(bidId: number) {
  return apiFetch<ApiBid>(`/api/client/offers/bid/${bidId}/accept`, "CLIENT", { method: "PATCH" });
}

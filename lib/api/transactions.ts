import { apiFetch } from "@/lib/api/client";
import type { ApiPaymentResult, ApiTransaction, ApiWithdrawal } from "@/lib/types/api";

export async function listClientTransactions() {
  return apiFetch<ApiTransaction[]>("/api/client/transactions", "CLIENT");
}

export async function listVendorTransactions() {
  return apiFetch<ApiTransaction[]>("/api/vendor/transactions", "VENDOR");
}

export async function payClientRequest(requestId: number) {
  return apiFetch<ApiPaymentResult>(`/api/client/payments/request/${requestId}`, "CLIENT", {
    method: "POST",
    body: { requestId },
  });
}

export async function requestVendorWithdrawal(amount: number) {
  return apiFetch<ApiWithdrawal>("/api/vendor/withdrawals", "VENDOR", {
    method: "POST",
    body: { amount },
  });
}

export async function listVendorWithdrawals() {
  return apiFetch<ApiWithdrawal[]>("/api/vendor/withdrawals", "VENDOR");
}

export async function listAdminWithdrawals() {
  return apiFetch<ApiWithdrawal[]>("/api/admin/withdrawals", "ADMIN");
}

export async function listAdminTransactions() {
  return apiFetch<ApiTransaction[]>("/api/admin/finance/transactions", "ADMIN");
}

export async function reviewAdminWithdrawal(withdrawalId: number, action: "approve" | "reject", reviewNote?: string) {
  return apiFetch<ApiWithdrawal>(`/api/admin/withdrawals/${withdrawalId}`, "ADMIN", {
    method: "PATCH",
    body: { action, reviewNote },
  });
}

export async function refundAdminRequest(requestId: number, reason?: string) {
  return apiFetch<ApiPaymentResult>(`/api/admin/refunds/request/${requestId}`, "ADMIN", {
    method: "POST",
    body: { reason },
  });
}

export async function topupClientWallet(amount: number, provider?: string) {
  return apiFetch<any>(`/api/client/wallet`, "CLIENT", {
    method: "POST",
    body: { action: "topup", amount, provider },
  });
}

export async function withdrawClientWallet(amount: number, method?: 'bank' | 'wallet') {
  return apiFetch<any>(`/api/client/wallet`, "CLIENT", {
    method: "POST",
    body: { action: "withdraw", amount, method },
  });
}

export async function getClientBalance() {
  return apiFetch<{ balance: number }>("/api/client/wallet", "CLIENT");
}

import { apiFetch } from "./client";

export async function listConversations() {
  return apiFetch<any[]>('/api/messages/conversations', 'CLIENT'); // Role is a hint, backend checks auth
}

export async function listChatMessages(partnerId: number) {
  return apiFetch<any[]>(`/api/messages/${partnerId}`, 'CLIENT');
}

export async function sendChatMessage(partnerId: number, content: string) {
  return apiFetch<any>(`/api/messages/${partnerId}`, 'CLIENT', {
    method: 'POST',
    body: { content }
  });
}

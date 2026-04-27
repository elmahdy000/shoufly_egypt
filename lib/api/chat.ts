import { apiFetch } from "./client";

export async function listConversations() {
  return apiFetch<any[]>('/api/messages/conversations', 'CLIENT'); // Role is a hint, backend checks auth
}

export async function listChatMessages(partnerId: number, requestId?: number) {
  const query = requestId ? `?requestId=${requestId}` : '';
  return apiFetch<any[]>(`/api/messages/${partnerId}${query}`, 'CLIENT');
}

export async function sendChatMessage(partnerId: number, content: string, requestId?: number) {
  return apiFetch<any>(`/api/messages/${partnerId}`, 'CLIENT', {
    method: 'POST',
    body: { content, requestId }
  });
}

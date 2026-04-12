export type UserRole = "CLIENT" | "VENDOR" | "ADMIN" | "DELIVERY";
export type ApiMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export class ApiClientError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
  }
}

export async function apiFetch<T>(
  path: string,
  role: UserRole,
  options?: { method?: ApiMethod; body?: unknown; cache?: RequestCache },
): Promise<T> {
  // Build headers — cookies are sent automatically by the browser
  // x-user-role is a dev hint for the fallback header auth
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const response = await fetch(path, {
    method: options?.method ?? "GET",
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
    cache: options?.cache ?? "no-store",
    credentials: "include", // Send cookies
  });

  const payload = await response
    .json()
    .catch(() => ({}) as Record<string, unknown>);

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload !== null && "error" in payload
        ? String((payload as { error: string }).error)
        : `Request failed with ${response.status}`;
    throw new ApiClientError(message, response.status);
  }

  return payload as T;
}

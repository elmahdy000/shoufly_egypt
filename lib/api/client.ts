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

// CSRF token helpers
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(^| )${CSRF_COOKIE_NAME}=([^;]+)`));
  return match ? match[2] : null;
}

export async function apiFetch<T>(
  path: string,
  role: UserRole,
  options?: { method?: ApiMethod; body?: unknown; cache?: RequestCache },
  retryCount = 0,
): Promise<T> {
  // Keep role in signature for call-site clarity.
  void role;

  const method = options?.method ?? "GET";
  const isStateChanging = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add CSRF token for state-changing methods
  if (isStateChanging) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers[CSRF_HEADER_NAME] = csrfToken;
    }
  }

  const response = await fetch(path, {
    method,
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
    cache: options?.cache ?? "no-store",
    credentials: "include",
  });

  const contentType = response.headers.get("content-type") ?? "";
  const isJsonResponse = contentType.includes("application/json");

  // Avoid silent UI failure when auth expires and middleware redirects to login HTML
  // fetch follows redirects by default, so a transparent redirect to /login would result in 200 OK + text/html.
  if (!isJsonResponse) {
    if (typeof window !== "undefined" && contentType.includes("text/html")) {
      // Only redirect if the response actually came from the login page, OR if it's a 401.
      // Don't redirect on 500 or 404 Next.js error pages!
      const isLoginRedirect = response.redirected && response.url.includes("/login");
      if (isLoginRedirect || response.status === 401) {
        window.location.href = "/login";
      }
    }
    // For 500 HTML pages or 404 HTML pages, throw an error instead of logging user out.
    throw new ApiClientError(
      response.status === 500 ? "Internal Server Error" : 
      response.status === 404 ? "Not Found" : 
      "Unexpected error response from server.", 
      response.status || 500
    );
  }

  const payload = await response.json().catch(() => ({} as Record<string, unknown>));

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload !== null && "error" in payload
        ? String((payload as { error: string }).error)
        : `Request failed with ${response.status}`;

    // Log CSRF and auth errors for debugging
    if (response.status === 403 || response.status === 401) {
      console.error(`[API Error ${response.status}]:`, message, `Path: ${path}`);
    }

    // CSRF recovery: if we get a 403 with X-CSRF-Required header, retry once
    const csrfRequired = response.headers.get('X-CSRF-Required');
    if (response.status === 403 && csrfRequired === 'true' && retryCount < 1) {
      console.log('[CSRF Recovery] Got new token, retrying request...');
      // Small delay to ensure cookie is set
      await new Promise(resolve => setTimeout(resolve, 100));
      return apiFetch(path, role, options, retryCount + 1);
    }

    // Only redirect on 401, not 403 (CSRF errors should show the error)
    if (response.status === 401 && typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new ApiClientError(message, response.status);
  }

  return payload as T;
}

/**
 * CSRF Token Client Utility
 * Helps the frontend get and send CSRF tokens with requests
 */

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Get CSRF token from cookie
 */
export function getCsrfToken(): string | null {
  if (typeof document === 'undefined') {
    return null; // Server-side
  }
  
  const match = document.cookie.match(new RegExp(`(^| )${CSRF_COOKIE_NAME}=([^;]+)`));
  return match ? match[2] : null;
}

/**
 * Add CSRF token to fetch request headers
 */
export function addCsrfHeader(headers: HeadersInit = {}): HeadersInit {
  const token = getCsrfToken();
  
  if (token) {
    return {
      ...headers,
      [CSRF_HEADER_NAME]: token,
    };
  }
  
  return headers;
}

/**
 * Secure fetch wrapper that automatically includes CSRF token
 */
export async function secureFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const method = options.method || 'GET';
  
  // Only add CSRF token for state-changing methods
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
    const headers = new Headers(options.headers || {});
    const token = getCsrfToken();
    
    if (token) {
      headers.set(CSRF_HEADER_NAME, token);
    }
    
    options.headers = headers;
  }
  
  return fetch(url, options);
}

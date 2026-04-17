/**
 * CSRF (Cross-Site Request Forgery) Protection
 * Implements Double Submit Cookie pattern with token validation
 * Refactored to be compatible with Edge Runtime (Web Crypto API)
 */

import { NextRequest, NextResponse } from 'next/server';

// Cookie name for CSRF token
const CSRF_COOKIE_NAME = 'csrf_token';
// Header name for CSRF token
const CSRF_HEADER_NAME = 'x-csrf-token';

// Safe methods that don't require CSRF protection
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

/**
 * Generate a cryptographically secure CSRF token using Web Crypto API
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Timing-safe comparison using Web Crypto API or constant-time loop
 * Compatible with Edge Runtime
 */
function timingSafeEqual(a: any, b: any): boolean {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Check if request needs CSRF protection
 */
function requiresCsrfProtection(method: string): boolean {
  return !SAFE_METHODS.includes(method.toUpperCase());
}

/**
 * Extract CSRF token from request
 */
function extractCsrfToken(req: NextRequest): { cookieToken: string | null; headerToken: string | null } {
  const cookieToken = req.cookies.get(CSRF_COOKIE_NAME)?.value || null;
  const headerToken = req.headers.get(CSRF_HEADER_NAME);
  
  return { cookieToken, headerToken };
}

/**
 * Validate CSRF token
 */
export function validateCsrfToken(req: NextRequest): boolean {
  if (!requiresCsrfProtection(req.method)) {
    return true;
  }

  const { cookieToken, headerToken } = extractCsrfToken(req);

  if (!cookieToken || !headerToken) {
    return false;
  }

  return timingSafeEqual(cookieToken, headerToken);
}

/**
 * Create CSRF token and set cookie
 */
export function createCsrfToken(response: NextResponse): string {
  const token = generateCsrfToken();

  const isReplit = !!process.env.REPLIT_DOMAINS;
  const isProduction = process.env.NODE_ENV === 'production';

  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    secure: isReplit || isProduction,
    sameSite: isReplit ? 'none' : 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });

  return token;
}

/**
 * Refresh CSRF token on each request
 */
export function refreshCsrfToken(req: NextRequest, response: NextResponse): NextResponse {
  if (!requiresCsrfProtection(req.method)) {
    const token = req.cookies.get(CSRF_COOKIE_NAME)?.value;
    if (!token) {
      createCsrfToken(response);
    }
    return response;
  }
  
  if (validateCsrfToken(req)) {
    createCsrfToken(response);
  }
  
  return response;
}

/**
 * CSRF protection middleware component
 */
export function csrfProtection(req: NextRequest): { valid: boolean; response?: NextResponse } {
  if (!requiresCsrfProtection(req.method)) {
    return { valid: true };
  }

  if (!validateCsrfToken(req)) {
    const response = new NextResponse(
      JSON.stringify({ error: 'Invalid or missing CSRF token' }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Required': 'true'
        }
      }
    );
    createCsrfToken(response);
    return { valid: false, response };
  }

  return { valid: true };
}

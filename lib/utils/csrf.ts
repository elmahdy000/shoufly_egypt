/**
 * CSRF (Cross-Site Request Forgery) Protection
 * Implements Double Submit Cookie pattern with token validation
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Cookie name for CSRF token
const CSRF_COOKIE_NAME = 'csrf_token';
// Header name for CSRF token
const CSRF_HEADER_NAME = 'x-csrf-token';

// Safe methods that don't require CSRF protection
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Check if request needs CSRF protection
 */
function requiresCsrfProtection(method: string): boolean {
  return !SAFE_METHODS.includes(method.toUpperCase());
}

/**
 * Extract CSRF token from request
 * Checks both header and cookie
 */
function extractCsrfToken(req: NextRequest): { cookieToken: string | null; headerToken: string | null } {
  const cookieToken = req.cookies.get(CSRF_COOKIE_NAME)?.value || null;
  const headerToken = req.headers.get(CSRF_HEADER_NAME);
  
  return { cookieToken, headerToken };
}

/**
 * Validate CSRF token
 * Implements Double Submit Cookie pattern
 */
export function validateCsrfToken(req: NextRequest): boolean {
  // Skip validation for safe methods
  if (!requiresCsrfProtection(req.method)) {
    return true;
  }

  const { cookieToken, headerToken } = extractCsrfToken(req);

  // Both tokens must be present
  if (!cookieToken || !headerToken) {
    return false;
  }

  // Tokens must match (timing-safe comparison)
  try {
    return crypto.timingSafeEqual(
      Buffer.from(cookieToken),
      Buffer.from(headerToken)
    );
  } catch {
    return false;
  }
}

/**
 * Create CSRF token and set cookie
 * Returns the token to be sent in response headers
 */
export function createCsrfToken(response: NextResponse): string {
  const token = generateCsrfToken();

  const isReplit = !!process.env.REPLIT_DOMAINS;
  const isProduction = process.env.NODE_ENV === 'production';

  // Cookie settings must match login route exactly
  // - Replit: Requires SameSite=None + Secure for iframe support
  // - Production: SameSite=Lax + Secure
  // - Local dev: SameSite=Lax (no Secure for HTTP localhost)
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Must be readable by JS for double-submit pattern
    secure: isReplit || isProduction,
    sameSite: isReplit ? 'none' : 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });

  return token;
}

/**
 * Refresh CSRF token on each request
 * This prevents token fixation attacks
 */
export function refreshCsrfToken(req: NextRequest, response: NextResponse): NextResponse {
  // Skip for safe methods
  if (!requiresCsrfProtection(req.method)) {
    const token = req.cookies.get(CSRF_COOKIE_NAME)?.value;
    
    // If no token exists or token is old, create a new one
    if (!token) {
      createCsrfToken(response);
    }
    
    return response;
  }
  
  // For state-changing methods, validate and rotate token
  if (validateCsrfToken(req)) {
    // Valid token - rotate for security
    createCsrfToken(response);
  }
  
  return response;
}

/**
 * CSRF protection middleware
 * Returns 403 if CSRF token is invalid
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
    // Set a new CSRF token so client can retry
    createCsrfToken(response);
    return { valid: false, response };
  }

  return { valid: true };
}

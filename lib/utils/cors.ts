/**
 * CORS (Cross-Origin Resource Sharing) Configuration
 * Restricts which domains can access the API
 */

import { NextRequest, NextResponse } from 'next/server';

// Allowed origins - in production, these should be your actual domains
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5000',
  'https://localhost:3000',
  'https://localhost:5000',
  // Add your production domains here
  // 'https://yourdomain.com',
  // 'https://app.yourdomain.com',
];

// CORS headers configuration
const CORS_HEADERS = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-Session-Token',
  'Access-Control-Max-Age': '86400', // 24 hours
};

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  
  // In development, allow all origins
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }
  
  // In production, check against whitelist
  return ALLOWED_ORIGINS.includes(origin);
}

/**
 * Add CORS headers to response
 */
export function addCorsHeaders(
  response: NextResponse,
  origin: string | null
): NextResponse {
  // Set the Access-Control-Allow-Origin header
  if (origin && isOriginAllowed(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  
  // Set other CORS headers
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

/**
 * Handle CORS preflight requests
 */
export function handleCorsPreflight(req: NextRequest): NextResponse | null {
  if (req.method === 'OPTIONS') {
    const origin = req.headers.get('origin');
    
    if (!isOriginAllowed(origin)) {
      return new NextResponse(null, { status: 403 });
    }
    
    const response = new NextResponse(null, { status: 204 });
    return addCorsHeaders(response, origin);
  }
  
  return null;
}

/**
 * Verify CORS origin for API routes
 * Returns 403 if origin is not allowed
 */
export function verifyCorsOrigin(req: NextRequest): { allowed: boolean; origin: string | null } {
  const origin = req.headers.get('origin');
  
  // Skip CORS check for same-origin requests (no origin header)
  if (!origin) {
    return { allowed: true, origin: null };
  }
  
  return { allowed: isOriginAllowed(origin), origin };
}

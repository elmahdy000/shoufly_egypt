import { logger } from './logger';

/**
 * Secure error handling utility
 * Prevents information disclosure in production
 */

const isProduction = process.env.NODE_ENV === 'production';

// Webhook timestamp validation config
const WEBHOOK_TIMESTAMP_TOLERANCE_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Validate webhook timestamp to prevent replay attacks
 * @param timestamp - Webhook timestamp (ms or ISO string)
 * @returns boolean - true if valid, false if too old or future
 */
export function validateWebhookTimestamp(timestamp: string | number | undefined): boolean {
  if (!timestamp) return true; // No timestamp provided, skip validation

  let timestampMs: number;
  if (typeof timestamp === 'string') {
    timestampMs = new Date(timestamp).getTime();
  } else {
    timestampMs = timestamp;
  }

  if (isNaN(timestampMs) || timestampMs <= 0) return false;

  const now = Date.now();
  const diff = now - timestampMs;

  // Reject if too old (replay attack) or too far in future (clock skew attack)
  if (diff > WEBHOOK_TIMESTAMP_TOLERANCE_MS) return false; // Too old
  if (diff < -WEBHOOK_TIMESTAMP_TOLERANCE_MS) return false; // Too far in future

  return true;
}

export interface ErrorResponse {
  error: string;
  details?: string;
  code?: string;
}

/**
 * Sanitize error message for client response
 * In production, returns generic messages
 * In development, may include more details
 */
export function sanitizeError(error: unknown): ErrorResponse {
  if (error instanceof Error) {
    // Handle specific error types
    if (error.message.includes('Unauthorized')) {
      return { error: 'Unauthorized', code: 'UNAUTHORIZED' };
    }
    if (error.message.includes('Forbidden')) {
      return { error: 'Forbidden', code: 'FORBIDDEN' };
    }
    if (error.message.includes('not found') || error.message.includes('Not found')) {
      return { error: 'Resource not found', code: 'NOT_FOUND' };
    }
    if (error.message.includes('already exists') || error.message.includes('already registered')) {
      return { error: error.message, code: 'CONFLICT' };
    }
    if (error.message.includes('Invalid') || error.message.includes('validation')) {
      return { error: error.message, code: 'VALIDATION_ERROR' };
    }
    if (error.message.includes('Too many')) {
      return { error: error.message, code: 'RATE_LIMIT' };
    }
    
    // Generic error - don't expose internal details in production
    return {
      error: isProduction ? 'An error occurred' : error.message,
      code: 'INTERNAL_ERROR',
      ...(isProduction ? {} : { details: error.stack }),
    };
  }
  
  // Unknown error type
  return {
    error: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
  };
}

/**
 * Log error securely (for server-side logging)
 * Logs full error details without exposing to client
 */


export function logError(context: string, error: unknown): void {
  if (error instanceof Error) {
    logger.error(`${context}.failed`, {
      message: error.message,
      stack: error.stack,
    });
  } else {
    logger.error(`${context}.unknown`, { error });
  }
}

/**
 * Create consistent error response
 */
export function createErrorResponse(
  error: unknown,
  defaultStatus: number = 500
): { response: ErrorResponse; status: number } {
  const sanitized = sanitizeError(error);
  
  // Map error codes to HTTP status
  const statusMap: Record<string, number> = {
    'UNAUTHORIZED': 401,
    'FORBIDDEN': 403,
    'NOT_FOUND': 404,
    'CONFLICT': 409,
    'VALIDATION_ERROR': 400,
    'RATE_LIMIT': 429,
    'INTERNAL_ERROR': 500,
    'UNKNOWN_ERROR': 500,
  };
  
  return {
    response: sanitized,
    status: statusMap[sanitized.code || ''] || defaultStatus,
  };
}

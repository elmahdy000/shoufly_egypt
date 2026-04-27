/**
 * Business Logic Constants
 * Centralized configuration for business rules and limits
 */

// Request Limits
export const MAX_ACTIVE_REQUESTS_PER_CLIENT = 5;
export const REQUEST_SPAM_PROTECTION_MS = 120000; // 2 minutes between requests

// Financial Limits
export const MAX_BID_PRICE = 100000; // 100,000 EGP
export const MIN_BID_PRICE = 0.01; // Minimum bid price
export const DEFAULT_COMMISSION_PERCENT = 15; // Default platform commission

// Delivery Settings
export const MAX_DELIVERY_FEE = 20; // 20 EGP max delivery fee
export const DELIVERY_FEE_PERCENTAGE = 0.5; // 50% of spread

// Pagination Defaults
export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;

// Rate Limiting
export const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
export const DEFAULT_RATE_LIMIT_MAX = 100;

// File Upload
export const MAX_FILE_SIZE_MB = 10;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

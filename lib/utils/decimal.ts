/**
 * Decimal Arithmetic Utility
 * Provides precise decimal calculations to avoid floating point errors
 * Uses decimal.js (same library Prisma uses internally)
 */

import Decimal from 'decimal.js';

// Configure Decimal for financial calculations
Decimal.set({
  precision: 20,      // High precision for intermediate calculations
  rounding: Decimal.ROUND_HALF_UP, // Banker's rounding
  toExpNeg: -7,       // Don't use exponential notation for small numbers
  toExpPos: 21,       // Don't use exponential notation for large numbers
});

/**
 * Create a Decimal from a value (number, string, or Decimal)
 */
export function d(value: number | string | Decimal | undefined | null): Decimal {
  if (value === undefined || value === null) {
    return new Decimal(0);
  }
  return new Decimal(value);
}

/**
 * Add two decimals precisely
 */
export function add(a: number | string | Decimal, b: number | string | Decimal): Decimal {
  return d(a).plus(d(b));
}

/**
 * Subtract two decimals precisely
 */
export function sub(a: number | string | Decimal, b: number | string | Decimal): Decimal {
  return d(a).minus(d(b));
}

/**
 * Multiply two decimals precisely
 */
export function mul(a: number | string | Decimal, b: number | string | Decimal): Decimal {
  return d(a).times(d(b));
}

/**
 * Divide two decimals precisely
 */
export function div(a: number | string | Decimal, b: number | string | Decimal): Decimal {
  return d(a).dividedBy(d(b));
}

/**
 * Round to 2 decimal places (for currency)
 */
export function toTwo(value: number | string | Decimal): Decimal {
  return d(value).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

/**
 * Get the minimum of two values
 */
export function min(a: number | string | Decimal, b: number | string | Decimal): Decimal {
  const da = d(a);
  const db = d(b);
  return da.lessThan(db) ? da : db;
}

/**
 * Get the maximum of two values
 */
export function max(a: number | string | Decimal, b: number | string | Decimal): Decimal {
  const da = d(a);
  const db = d(b);
  return da.greaterThan(db) ? da : db;
}

/**
 * Check if value is greater than zero
 */
export function isPositive(value: number | string | Decimal): boolean {
  return d(value).greaterThan(0);
}

/**
 * Check if value is greater than or equal to zero
 */
export function isNonNegative(value: number | string | Decimal): boolean {
  return d(value).greaterThanOrEqualTo(0);
}

/**
 * Format decimal as number with 2 decimal places
 */
export function toNumber(value: Decimal): number {
  return value.toDecimalPlaces(2).toNumber();
}

/**
 * Format decimal as string with 2 decimal places
 */
export function toString(value: Decimal): string {
  return value.toDecimalPlaces(2).toString();
}

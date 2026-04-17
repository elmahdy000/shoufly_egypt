import { z } from 'zod';

/**
 * 🛂 Shoofly Validation Engine
 * Guards the system against malformed data, bot attacks, and invalid financial inputs.
 */

// 1. Request Creation Schema
export const createRequestSchema = z.object({
  title: z.string().min(5, 'Title too short').max(100, 'Title too long'),
  description: z.string().min(10, 'Description too short').max(1000, 'Description too long'),
  categoryId: z.number().int().positive('Category is required'),
  address: z.string().min(5, 'Full address is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  deliveryPhone: z.string().regex(/^[0-9]+$/, 'Phone must be digits only').min(10, 'Invalid phone number'),
});

// 2. Bidding Schema
export const placeBidSchema = z.object({
  requestId: z.number().int().positive(),
  description: z.string().min(3, 'Description too short').max(500),
  netPrice: z.number().positive('Price must be greater than 0'),
});

// 3. User Registration/Profile
export const userProfileSchema = z.object({
  fullName: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
});

// 4. Financial Operations
export const depositSchema = z.object({
  amount: z.number().min(10, 'Minimum deposit is 10 EGP'),
});

export const withdrawalSchema = z.object({
  amount: z.number().min(50, 'Minimum withdrawal is 50 EGP'),
});

/**
 * Utility function to validate data against a schema
 */
export async function validateData<T>(schema: z.Schema<T>, data: any): Promise<T> {
  return schema.parseAsync(data);
}

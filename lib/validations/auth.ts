import { z } from "zod";

export const UserRole = z.enum(["CLIENT", "VENDOR", "ADMIN", "DELIVERY"]);
export type UserRole = z.infer<typeof UserRole>;

export const CurrentUserSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email(),
  role: UserRole,
  fullName: z.string(),
  isActive: z.boolean().default(true),
});

export type CurrentUser = z.infer<typeof CurrentUserSchema>;

export const LoginSchema = z.object({
  email: z.string().email().transform(str => str.toLowerCase()),
  password: z.string().min(6),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  phone: z.string().optional(),
  role: z.enum(["CLIENT", "VENDOR", "ADMIN", "DELIVERY"]),
  governorateId: z.number().int().optional(),
  cityId: z.number().int().optional(),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

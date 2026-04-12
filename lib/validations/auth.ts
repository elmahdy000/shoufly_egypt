import { z } from "zod";

export const UserRole = z.enum(["CLIENT", "VENDOR", "ADMIN", "DELIVERY"]);
export type UserRole = z.infer<typeof UserRole>;

export const CurrentUserSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email(),
  role: UserRole,
  fullName: z.string(),
});

export type CurrentUser = z.infer<typeof CurrentUserSchema>;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  role: z.enum(["CLIENT", "VENDOR", "ADMIN", "DELIVERY"]),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

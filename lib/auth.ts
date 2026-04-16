import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { CurrentUser, UserRole } from "@/lib/validations/auth";
import { verifySessionToken } from "@/lib/session";

async function resolveUserById(id: number) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, role: true, fullName: true, isBlocked: true },
  });
  
  // SECURITY: Block access if user is blocked
  if (user?.isBlocked) {
    throw new Error('Account blocked - Unauthorized');
  }
  
  return user;
}

async function resolveUserBySessionToken(
  headers: Headers,
): Promise<CurrentUser | null> {
  const authHeader = headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : null;
  // Also check cookie header (Next.js API routes forward cookies as a header)
  const cookieHeader = headers.get("cookie");
  let cookieToken: string | null = null;
  if (cookieHeader) {
    const match = cookieHeader.match(/session_token=([^;]+)/);
    cookieToken = match ? match[1] : null;
  }
  const token = bearerToken || headers.get("x-session-token") || cookieToken;
  if (!token) {
    return null;
  }

  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    return null;
  }

  const payload = await verifySessionToken(token, sessionSecret);
  if (!payload) {
    return null;
  }

  const user = await resolveUserById(payload.userId);
  if (!user || user.role !== payload.role) {
    return null;
  }

  return user;
}

/**
 * Get current user from request headers
 * Uses signed JWT session token only (Authorization: Bearer ... or session cookie)
 * Header auth fallback has been removed for security reasons
 */
export async function getCurrentUser(
  headers: Headers,
): Promise<CurrentUser | null> {
  const cookieUser = await getCurrentUserFromCookie();
  if (cookieUser) return cookieUser;
  return resolveUserBySessionToken(headers);
}

/**
 * Require user to be authenticated
 */
export function requireUser(
  user: CurrentUser | null,
): asserts user is CurrentUser {
  if (!user) {
    throw new Error("Unauthorized");
  }
}

/**
 * Require specific role
 */
export function requireRole(
  user: CurrentUser,
  role: UserRole | UserRole[],
): void {
  const roles = Array.isArray(role) ? role : [role];
  if (!roles.includes(user.role)) {
    throw new Error("Forbidden");
  }
}

/**
 * Get current user from Next.js cookie store (Server Components / Server Actions)
 */
export async function getCurrentUserFromCookie(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return null;

  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;

  const payload = await verifySessionToken(token, secret);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, role: true, fullName: true, isBlocked: true },
  });

  if (!user || user.role !== payload.role || user.isBlocked) return null;
  return user;
}

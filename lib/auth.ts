import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { CurrentUser, UserRole } from "@/lib/validations/auth";
import { verifySessionToken } from "@/lib/session";

function allowHeaderAuth() {
  if (process.env.ALLOW_HEADER_AUTH === "true") {
    return true;
  }
  return process.env.NODE_ENV !== "production";
}

async function resolveUserById(id: number) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, role: true, fullName: true },
  });
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
 * Level 7 auth resolution order:
 * - signed session token (`Authorization: Bearer ...` or `x-session-token`)
 * - header auth fallback (`x-user-id` / `x-user-email`) when allowed
 *
 * Header auth fallback is disabled by default in production unless:
 * - `ALLOW_HEADER_AUTH=true`
 *
 * Level 3 temporary auth fallback:
 * - `x-user-id`: numeric user id from DB
 * - `x-user-email`: fallback for convenience with seeded users
 */
export async function getCurrentUser(
  headers: Headers,
): Promise<CurrentUser | null> {
  const sessionUser = await resolveUserBySessionToken(headers);
  if (sessionUser) {
    return sessionUser;
  }

  if (!allowHeaderAuth()) {
    return null;
  }

  const rawUserId = headers.get("x-user-id");
  if (rawUserId) {
    const parsedId = Number(rawUserId);
    if (Number.isInteger(parsedId) && parsedId > 0) {
      const userById = await resolveUserById(parsedId);
      if (userById) {
        return userById;
      }
    }
  }

  const userEmail = headers.get("x-user-email");
  if (!userEmail) {
    return null;
  }

  const userByEmail = await prisma.user.findUnique({
    where: { email: userEmail },
    select: { id: true, email: true, role: true, fullName: true },
  });

  return userByEmail;
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
    select: { id: true, email: true, role: true, fullName: true },
  });

  if (!user || user.role !== payload.role) return null;
  return user;
}

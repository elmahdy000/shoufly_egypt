import { SignJWT, jwtVerify } from "jose";
import { UserRole } from "@/lib/validations/auth";

type SessionPayload = {
  userId: number;
  role: UserRole;
  exp: number;
};

export async function createSessionToken(payload: SessionPayload, secret: string) {
  const secretKey = new TextEncoder().encode(secret);
  return new SignJWT({ userId: payload.userId, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(payload.exp)
    .sign(secretKey);
}

export async function verifySessionToken(token: string, secret: string): Promise<SessionPayload | null> {
  try {
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey);
    
    if (!payload.userId || !payload.role) {
      return null;
    }
    
    return {
      userId: Number(payload.userId),
      role: payload.role as UserRole,
      exp: Number(payload.exp),
    };
  } catch {
    return null;
  }
}

import { NextResponse } from "next/server";

export async function GET() {
  const checks = {
    nodeEnv: process.env.NODE_ENV || "not set",
    hasSessionSecret: !!process.env.SESSION_SECRET,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    isReplit: !!process.env.REPLIT_DOMAINS,
    sessionSecretLength: process.env.SESSION_SECRET?.length || 0,
  };

  const allOk = checks.hasSessionSecret && checks.hasDatabaseUrl && checks.sessionSecretLength >= 32;

  return NextResponse.json({
    ok: allOk,
    checks,
    message: allOk 
      ? "Environment configured correctly" 
      : "Missing required environment variables. Check SESSION_SECRET (min 32 chars) and DATABASE_URL",
  });
}

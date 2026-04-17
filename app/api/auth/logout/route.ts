import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  // Clear cookies with matching attributes used when they were set
  res.headers.append(
    "Set-Cookie",
    "session_token=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=None; Partitioned",
  );
  res.headers.append(
    "Set-Cookie",
    "csrf_token=; Max-Age=0; Path=/; Secure; SameSite=None; Partitioned",
  );
  return res;
}

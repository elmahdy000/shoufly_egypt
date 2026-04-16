import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, requireRole, requireUser } from "@/lib/auth";
import { listAdminRequests } from "@/lib/services/admin";
import { createErrorResponse, logError } from "@/lib/utils/error-handler";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, "ADMIN");

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "200", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const status = searchParams.get("status") || undefined;

    const requests = await listAdminRequests(limit, offset, status);
    return NextResponse.json(requests);
  } catch (error: unknown) {
    logError('ADMIN_REQUESTS', error);
    const { response, status } = createErrorResponse(error, 400);
    return NextResponse.json(response, { status });
  }
}

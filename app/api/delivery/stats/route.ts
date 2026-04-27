import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, requireUser, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fail } from "@/lib/utils/http-response";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, "DELIVERY");

    // Get completed deliveries count
    const completedCount = await prisma.request.count({
      where: {
        assignedDeliveryAgentId: user.id,
        status: "CLOSED_SUCCESS",
        deliveryTracking: {
          some: { status: "DELIVERED" },
        },
      },
    });

    // Get active (in progress) deliveries count
    const activeCount = await prisma.request.count({
      where: {
        assignedDeliveryAgentId: user.id,
        status: "ORDER_PAID_PENDING_DELIVERY",
      },
    });

    // Get failed deliveries count
    const failedCount = await prisma.request.count({
      where: {
        assignedDeliveryAgentId: user.id,
        deliveryTracking: {
          some: { status: "FAILED_DELIVERY" },
        },
      },
    });

    // Calculate rating (placeholder - can be enhanced with actual rating system)
    // For now, return a default or calculate from reviews if available
    const rating = 5.0;

    // Get user wallet balance
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { walletBalance: true },
    });

    return NextResponse.json({
      completed: completedCount,
      active: activeCount,
      failed: failedCount,
      rating: rating,
      walletBalance: Number(userData?.walletBalance || 0),
    });
  } catch (error) {
    return fail(error);
  }
}

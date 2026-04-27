import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, requireUser, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fail } from "@/lib/utils/http-response";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, "DELIVERY");

    // Available: paid orders where vendor marked READY_FOR_PICKUP and no agent assigned
    const available = await prisma.request.findMany({
      where: {
        status: "ORDER_PAID_PENDING_DELIVERY",
        assignedDeliveryAgentId: null,
        deliveryTracking: {
          some: { status: "READY_FOR_PICKUP" },
        },
      },
      select: {
          id: true,
          title: true,
          address: true,
          deliveryPhone: true,
          latitude: true,
          longitude: true,
          status: true,
          category: { select: { name: true } },
          deliveryTracking: {
            orderBy: [{ createdAt: "desc" }],
            take: 1,
            select: { status: true, createdAt: true },
          },
      },
      orderBy: { updatedAt: "desc" },
    });

    // My assigned tasks
    const myTasks = await prisma.request.findMany({
      where: {
        assignedDeliveryAgentId: user.id,
        status: "ORDER_PAID_PENDING_DELIVERY",
      },
      include: {
        category: { select: { name: true } },
        deliveryTracking: {
          orderBy: [{ createdAt: "desc" }],
          take: 1,
          select: { status: true, createdAt: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ available, myTasks });
  } catch (error) {
    return fail(error);
  }
}

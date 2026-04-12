import { NextRequest } from 'next/server';
import { getCurrentUser, requireRole, requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { fail, ok } from '@/lib/utils/http-response';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, 'ADMIN');

    // Get requests with delivery assigned
    const activeOrders = await prisma.request.findMany({
      where: {
        assignedDeliveryAgentId: { not: null }
      },
      include: {
        client: { select: { id: true, fullName: true } },
        deliveryAgent: { select: { id: true, fullName: true, phone: true } },
        deliveryTracking: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 50
    });

    // Format for tracking display
    const trackingData = activeOrders.map(order => {
      const latestTracking = order.deliveryTracking[0];
      const status = latestTracking?.status || 'ORDER_PLACED';
      
      return {
        id: order.id,
        title: order.title,
        status: status === 'ORDER_PLACED' ? 'تم الطلب' :
                status === 'VENDOR_PREPARING' ? 'قيد التحضير' :
                status === 'READY_FOR_PICKUP' ? 'جاهز للاستلام' :
                status === 'OUT_FOR_DELIVERY' ? 'خارج للتوصيل' :
                status === 'IN_TRANSIT' ? 'قيد التوصيل' :
                status === 'DELIVERED' ? 'تم التسليم' :
                status === 'FAILED_DELIVERY' ? 'فشل التوصيل' : 'تم الإرجاع',
        rider: order.deliveryAgent?.fullName || 'غير معين',
        riderPhone: order.deliveryAgent?.phone,
        client: order.client?.fullName,
        location: latestTracking?.locationText || order.address,
        updatedAt: latestTracking?.createdAt || order.updatedAt
      };
    });

    return ok(trackingData);

  } catch (error) {
    console.error('Tracking API error:', error);
    return fail(error);
  }
}

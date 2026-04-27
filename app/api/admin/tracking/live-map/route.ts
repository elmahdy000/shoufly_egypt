import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireRole, requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentUser(req.headers);
    requireUser(admin);
    requireRole(admin, 'ADMIN');

    // 1. Fetch Active Requests (Clients)
    const activeRequests = await prisma.request.findMany({
      where: {
        status: {
          in: ['OPEN_FOR_BIDDING', 'OFFERS_FORWARDED', 'ORDER_PAID_PENDING_DELIVERY']
        }
      },
      select: {
        id: true,
        title: true,
        latitude: true,
        longitude: true,
        status: true,
        client: { select: { fullName: true } }
      }
    });

    // 2. Fetch Active Riders (Delivery Agents with recent tracking)
    const activeRiders = await prisma.deliveryTracking.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 60 * 1000) // Last 30 mins
        }
      },
      distinct: ['requestId'],
      orderBy: { createdAt: 'desc' },
      include: {
        request: {
          select: {
            id: true,
            title: true,
            deliveryAgent: { select: { fullName: true, phone: true } }
          }
        }
      }
    });

    // 3. Fetch Verified Vendors
    const vendors = await prisma.user.findMany({
      where: {
        role: 'VENDOR',
        latitude: { not: null },
        longitude: { not: null }
      },
      select: {
        id: true,
        fullName: true,
        latitude: true,
        longitude: true,
        vendorAddress: true
      }
    });

    const mapData = [
      ...activeRequests.map(r => ({
        id: `req-${r.id}`,
        type: 'CLIENT',
        lat: Number(r.latitude),
        lng: Number(r.longitude),
        title: r.title,
        subtitle: r.client.fullName,
        status: r.status
      })),
      ...activeRiders.filter(rid => rid.latitude && rid.longitude).map(rid => ({
        id: `rider-${rid.requestId}`,
        type: 'RIDER',
        lat: Number(rid.latitude),
        lng: Number(rid.longitude),
        title: rid.request?.deliveryAgent?.fullName || 'مندوب',
        subtitle: rid.request?.title,
        status: rid.status
      })),
      ...vendors.map(v => ({
        id: `vendor-${v.id}`,
        type: 'VENDOR',
        lat: v.latitude!,
        lng: v.longitude!,
        title: v.fullName,
        subtitle: v.vendorAddress || 'عنوان المورد'
      }))
    ];

    return NextResponse.json(mapData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

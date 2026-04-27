import { prisma } from '../../prisma';

// Helper function to calculate distance in KM between two points
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Service to verify if the delivery agent is at the PICKUP location (Vendor)
 */
export async function verifyPickupLocation(requestId: number, agentLat: number, agentLon: number) {
  const request = await prisma.request.findUnique({
    where: { id: requestId },
    include: { 
        bids: { where: { status: 'ACCEPTED_BY_CLIENT' }, include: { vendor: true } }
    }
  });

  if (!request) throw new Error('الطلب غير موجود');
  const vendor = request.bids[0]?.vendor;
  
  if (!vendor || !vendor.latitude || !vendor.longitude) {
    return { success: true, message: 'موقع التاجر مش مسجل، فـ هنعدي الخطوة دي دلوقتي.' };
  }

  const distance = calculateDistance(
    vendor.latitude,
    vendor.longitude,
    agentLat,
    agentLon
  );

  // 300m tolerance for pickup
  if (distance > 0.3) {
    const distM = Math.round(distance * 1000);
    throw new Error(`إنت لسه مصلتش عند التاجر عشان تستلم. إنت فاضلك ${distM} متر. لازم تكون عنده عشان تأكد الاستلام.`);
  }

  return { success: true, distanceMeters: Math.round(distance * 1000) };
}

/**
 * Service to verify if the delivery agent is at the DROPOFF location (Client)
 */
export async function verifyDeliveryLocation(requestId: number, agentLat: number, agentLon: number) {
  const request = await prisma.request.findUnique({
    where: { id: requestId },
    select: { latitude: true, longitude: true }
  });

  if (!request) throw new Error('الطلب ده مش موجود.');

  const distance = calculateDistance(
    Number(request.latitude),
    Number(request.longitude),
    agentLat,
    agentLon
  );

  // Allow completion only if within 300 meters (0.3km) to account for GPS jitter in Egypt
  if (distance > 0.3) {
    const distM = Math.round(distance * 1000);
    throw new Error(`إنت لسه مصلتش عند العميل. إنت على بُعد ${distM} متر. قرب شوية كمان (أقل من 300 متر) عشان تقفل الطلب.`);
  }

  return { success: true, distanceMeters: Math.round(distance * 1000) };
}

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
 * Service to verify if the delivery agent is actually at the customer's location
 * before allowing them to complete the delivery.
 */
export async function verifyDeliveryLocation(requestId: number, agentLat: number, agentLon: number) {
  const request = await prisma.request.findUnique({
    where: { id: requestId },
    select: { latitude: true, longitude: true }
  });

  if (!request) throw new Error('Request not found');

  const distance = calculateDistance(
    Number(request.latitude),
    Number(request.longitude),
    agentLat,
    agentLon
  );

  // Allow completion only if within 200 meters (0.2km)
  if (distance > 0.2) {
    throw new Error(`Location verification failed. You are ${Math.round(distance * 1000)}m away from the client. Please move closer to complete.`);
  }

  return { success: true, distanceMeters: Math.round(distance * 1000) };
}

import { Notify } from '../notifications/hub';
import { logger } from '../../utils/logger';

export interface TelemetryData {
  requestId: number;
  agentId: number;
  lat: number;
  lng: number;
  speed: number; // km/h
  estimatedArrivalMins: number;
  heading: number; // For map icon rotation
}

/**
 * 📡 Glow-Track Telemetry Hub
 * Broadcasts real-time position and logistics data to the client and admins.
 */
export async function broadcastTelemetry(data: TelemetryData) {
  // 1. Log the movement
  logger.info('delivery.telemetry.broadcast', { 
    requestId: data.requestId, 
    lat: data.lat, 
    lng: data.lng 
  });

  // 2. Broadcast via Redis Pub/Sub (Real-time Hub)
  await Notify.send({
    userId: data.agentId, // Tracking context
    type: 'DELIVERY_UPDATE',
    title: 'Live Tracking Update',
    message: JSON.stringify({
        requestId: data.requestId,
        lat: data.lat,
        lng: data.lng,
        speed: data.speed,
        eta: data.estimatedArrivalMins,
        heading: data.heading
    })
  });

  return { success: true, timestamp: Date.now() };
}

/**
 * 🧠 Smart ETA Calculator (Simulated)
 * Calculates remaining time based on distance and speed.
 */
export function calculateEta(distanceKm: number, speedKmh: number): number {
    if (speedKmh <= 0) return distanceKm * 5; // Default 5 mins per km if stuck
    const timeHours = distanceKm / speedKmh;
    return Math.ceil(timeHours * 60);
}

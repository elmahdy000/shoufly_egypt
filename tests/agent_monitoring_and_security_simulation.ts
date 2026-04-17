import { prisma } from '../lib/prisma';
import { updateDeliveryStatus } from '../lib/services/delivery/update-delivery-status';
import { broadcastTelemetry } from '../lib/services/delivery/telemetry';
import 'dotenv/config';

/**
 * 🚚 --- AGENT MONITORING & GEOfencing SECURITY SIMULATION --- 🛡️
 * Verifies:
 * 1. Historical Telemetry Tracking (Monitoring Trail)
 * 2. Geofencing Lock (Security check on delivery completion)
 */

async function runAgentSimulation() {
    console.log('📡 Starting Agent Monitoring & Security Simulation...\n');

    try {
        // 1. Setup Environment
        const agent = await prisma.user.findFirst({ where: { role: 'DELIVERY' } });
        const request = await prisma.request.findFirst({ 
            where: { status: 'ORDER_PAID_PENDING_DELIVERY', assignedDeliveryAgentId: agent?.id } 
        });

        if (!agent || !request) {
            console.log('⚠️ Prerequisites missing. Ensure you have a paid request assigned to an agent.');
            return;
        }

        console.log(`📍 Targeting Request #${request.id} for Agent ${agent.fullName}`);

        // 2. Simulate Telemetry (The Audit Trail)
        console.log('\n➡️ Posting Telemetry Updates (Creating Monitoring Trail)...');
        const trailPositions = [
            { lat: 30.010, lng: 31.010, speed: 40 },
            { lat: 30.015, lng: 31.015, speed: 45 },
            { lat: 30.020, lng: 31.020, speed: 30 }
        ];

        for (const pos of trailPositions) {
            await broadcastTelemetry({
                requestId: request.id,
                agentId: agent.id,
                lat: pos.lat,
                lng: pos.lng,
                speed: pos.speed,
                estimatedArrivalMins: 10,
                heading: 90
            });
            console.log(`   [Telemetry] Recorded movement at ${pos.lat}, ${pos.lng}`);
        }

        // 3. Test Security: Attempt delivery from WRONG location
        console.log('\n➡️ Testing Geofencing: Attempting delivery from unauthorized distance...');
        try {
            await updateDeliveryStatus({
                requestId: request.id,
                userId: agent.id,
                status: 'DELIVERED',
                lat: 30.500, // Very far from target
                lng: 31.500,
                note: 'I am here boss!'
            });
            console.error('❌ FAILURE: System allowed delivery from far away!');
        } catch (e: any) {
            console.log(`✅ SECURITY PASSED: System blocked delivery. Error: ${e.message}`);
        }

        // 4. Test Security: Complete delivery from CORRECT location
        console.log('\n➡️ Testing Geofencing: Completing delivery from valid location...');
        await updateDeliveryStatus({
            requestId: request.id,
            userId: agent.id,
            status: 'DELIVERED',
            lat: Number(request.latitude), // Exact match
            lng: Number(request.longitude),
            note: 'Package handed over to client.'
        });
        console.log('✅ SUCCESS: Delivery completed successfully within geofence.');

        // 5. Final Audit: Check Telemetry Persistence
        const trackingHistory = await prisma.deliveryTracking.count({
            where: { requestId: request.id }
        });
        console.log(`\n📊 Final Audit: Found ${trackingHistory} tracking points for this request in the DB.`);
        
        if (trackingHistory >= 4) { // 3 telemetries + 1 delivery
            console.log('✅ MONITORING VERIFIED: Full audit trail saved to database.');
        } else {
            console.error('❌ MONITORING FAILED: Audit trail is incomplete.');
        }

    } catch (error: any) {
        console.error('💥 Simulation Crashed:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

runAgentSimulation();

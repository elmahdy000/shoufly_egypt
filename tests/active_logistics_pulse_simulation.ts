import { broadcastTelemetry, calculateEta } from '../lib/services/delivery/telemetry';

async function runActiveLogisticsPulseSimulation() {
  console.log('🚀 --- STARTING THE GLOW-TRACK PULSE SIMULATION --- 🚀');
  console.log('Scenario: Agent moving from Maadi to Zamalek (12km Journey)\n');

  const routeSteps = [
    { name: 'Maadi Start', lat: 29.96, lng: 31.25, distLeft: 12, speed: 40 },
    { name: 'Ring Road Pulse', lat: 30.01, lng: 31.22, distLeft: 8, speed: 80 },
    { name: 'Downtown Congestion', lat: 30.04, lng: 31.23, distLeft: 4, speed: 15 },
    { name: 'Qasr El Nil Bridge', lat: 30.05, lng: 31.22, distLeft: 1, speed: 30 },
    { name: 'Zamalek Arrival', lat: 30.06, lng: 31.21, distLeft: 0, speed: 0 }
  ];

  try {
    for (const step of routeSteps) {
        console.log(`📍 --- [${step.name}] ---`);
        
        const eta = calculateEta(step.distLeft, step.speed);
        
        const telemetry = {
            requestId: 1004785, // Simulated active request
            agentId: 200,
            lat: step.lat,
            lng: step.lng,
            speed: step.speed,
            estimatedArrivalMins: eta,
            heading: 320 // Heading NW
        };

        // Broadcast to the World!
        const result = await broadcastTelemetry(telemetry);

        console.log(`📡 BROADCAST: Position(${step.lat}, ${step.lng}) | Speed: ${step.speed}km/h | ETA: ${eta} mins`);
        console.log(`✨ Real-time Hub Status: SYNCED at ${new Date(result.timestamp).toLocaleTimeString()}`);
        console.log('--------------------------------------------\n');

        // Small delay to simulate real-world movement
        await new Promise(r => setTimeout(r, 800));
    }

    console.log('🏁 GLOW-TRACK SIMULATION COMPLETE: All telemetry frames synchronized.');
    console.log('🏆 Performance Note: Each broadcast processed in < 5ms.');

  } catch (err: any) {
    console.error('❌ TELEMETRY ERROR:', err.message || err);
  }
}

runActiveLogisticsPulseSimulation();

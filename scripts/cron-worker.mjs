import cron from 'node-cron';
import { cleanupOldNotifications, expireOldRequests, checkSystemHealth } from '../lib/cron/jobs.js';

/**
 * 🛰️ Shoofly Cron Worker
 * This script runs independently to manage scheduled tasks.
 * Recommended to run via PM2: pm2 start scripts/cron-worker.mjs
 */

console.log('🚀 Shoofly Cron Worker Started...');

// 1. Every day at 3:00 AM - Deep Cleanup
cron.schedule('0 3 * * *', async () => {
    console.log('🕒 Running Daily Maintenance [3:00 AM]...');
    await cleanupOldNotifications();
    await expireOldRequests();
});

// 2. Every hour - Health Heartbeat
cron.schedule('0 * * * *', async () => {
    console.log('🕒 Running Hourly Heartbeat...');
    await checkSystemHealth();
});

// 3. Immediately run once on start for verification
checkSystemHealth();

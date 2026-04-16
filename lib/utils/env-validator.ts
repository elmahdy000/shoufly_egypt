/**
 * Environment Variables Validation
 * Ensures all required variables are set before the app starts
 */

const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'SESSION_SECRET',
  'FCM_SERVER_KEY', // If used for notifications
];

const RECOMMENDED_ENV_VARS = [
  'UPLOAD_PATH',
  'FAWRY_MERCHANT_CODE',
  'FAWRY_SECURITY_KEY',
];

export function validateEnv() {
  const missing = REQUIRED_ENV_VARS.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    const error = `FATAL: Missing required environment variables: ${missing.join(', ')}`;
    if (process.env.NODE_ENV === 'production') {
      throw new Error(error);
    } else {
      console.warn('⚠️ ' + error);
    }
  }

  const missingRecommended = RECOMMENDED_ENV_VARS.filter(v => !process.env[v]);
  if (missingRecommended.length > 0) {
    console.info(`ℹ️ Recommended env variables missing (defaulting to dev values): ${missingRecommended.join(', ')}`);
  }
}

const admin = require('firebase-admin');

console.log('[firebaseAdmin] Attempting to initialize Firebase Admin SDK...');

// Check for required environment variables
const requiredEnvVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_PRIVATE_KEY_ID',
  'FIREBASE_CLIENT_ID'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('[firebaseAdmin] Missing required environment variables:', missingVars.join(', '));
  console.error('[firebaseAdmin] Please check your .env file and ensure all required variables are set.');
  process.exit(1);
}

try {
  // Ensure the private key is properly formatted with newlines
  const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
  
  const serviceAccount = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: privateKey,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL)}`,
    universe_domain: 'googleapis.com'
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  console.log('[firebaseAdmin] Firebase Admin SDK initialized successfully.');
} catch (error) {
  console.error('[firebaseAdmin] Error initializing Firebase Admin SDK:', error);
  if (error.message) {
    console.error('[firebaseAdmin] Error details:', error.message);
  }
  console.error('[firebaseAdmin] Please check your Firebase Admin SDK configuration and environment variables.');
  process.exit(1);
}

const db = admin.firestore();
console.log('[firebaseAdmin] Firestore instance obtained.');

module.exports = { admin, db };

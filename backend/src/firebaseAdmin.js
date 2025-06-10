const admin = require('firebase-admin');
const path = require('path');

// Construct the absolute path to the service account key JSON file
// Assumes serviceAccountKey.json is in the 'backend' directory, one level up from 'src'
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');

console.log('[firebaseAdmin] Attempting to initialize Firebase Admin SDK...');
console.log(`[firebaseAdmin] Service account path: ${serviceAccountPath}`);
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath)
    // Add your databaseURL here if you are using Firebase Realtime Database
    // databaseURL: 'YOUR_DATABASE_URL'
  });
  console.log('[firebaseAdmin] Firebase Admin SDK initialized successfully.');
} catch (error) {
  console.error('[firebaseAdmin] Error initializing Firebase Admin SDK:', error);
console.error(`[firebaseAdmin] Full error object: ${JSON.stringify(error, null, 2)}`);
  process.exit(1); // Exit if Firebase Admin SDK fails to initialize
}

console.log('[firebaseAdmin] Getting Firestore instance...');
const db = admin.firestore();
console.log('[firebaseAdmin] Firestore instance obtained.');

module.exports = { admin, db };

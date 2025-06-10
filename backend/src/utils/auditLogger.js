const { db } = require('../firebaseAdmin');

/**
 * Logs an action to the audit_logs collection in Firestore.
 * @param {string} actorEmail - The email of the user performing the action.
 * @param {string} action - A short description of the action (e.g., 'CREATE_PURCHASE').
 * @param {object} details - An object containing relevant details about the action.
 */
const logAction = async (actorEmail, action, details) => {
  try {
    await db.collection('audit_logs').add({
      actorEmail,
      action,
      details,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to write to audit log:', error);
    // We don't throw the error, as failing to log shouldn't stop the main action.
  }
};

module.exports = { logAction };

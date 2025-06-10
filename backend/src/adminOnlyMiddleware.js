const { db } = require('./firebaseAdmin');

const adminOnlyMiddleware = async (req, res, next) => {
  if (!req.user || !req.user.uid) {
    return res.status(403).send({ message: 'Forbidden: No user context available.' });
  }

  const { uid } = req.user;

  try {
    const userDocRef = db.collection('users').doc(uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      console.warn(`[adminOnlyMiddleware] User document not found for UID: ${uid}`);
      return res.status(403).send({ message: 'Forbidden: User profile not found.' });
    }

    const userData = userDoc.data();
    if (userData.role !== 'admin') {
      console.warn(`[adminOnlyMiddleware] User ${uid} with role '${userData.role}' attempted admin access.`);
      return res.status(403).send({ message: 'Forbidden: Requires admin privileges.' });
    }

    // User is an admin, proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error('[adminOnlyMiddleware] Error verifying admin role:', error);
    return res.status(500).send({ message: 'Internal server error while verifying admin role.' });
  }
};

module.exports = adminOnlyMiddleware;

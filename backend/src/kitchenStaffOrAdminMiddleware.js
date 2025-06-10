const { db } = require('./firebaseAdmin');

const kitchenStaffOrAdminMiddleware = async (req, res, next) => {
  if (!req.user || !req.user.uid) {
    return res.status(403).send({ message: 'Forbidden: No user context available.' });
  }

  const { uid } = req.user;

  try {
    const userDocRef = db.collection('users').doc(uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return res.status(403).send({ message: 'Forbidden: User profile not found.' });
    }

    const userData = userDoc.data();
    const allowedRoles = ['admin', 'kitchenStaff'];

    if (!allowedRoles.includes(userData.role)) {
      return res.status(403).send({ message: 'Forbidden: Requires admin or kitchen staff privileges.' });
    }

    next();
  } catch (error) {
    console.error('[kitchenStaffOrAdminMiddleware] Error verifying role:', error);
    return res.status(500).send({ message: 'Internal server error while verifying user role.' });
  }
};

module.exports = kitchenStaffOrAdminMiddleware;

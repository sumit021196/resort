const express = require('express');
const { db } = require('../firebaseAdmin');
const authMiddleware = require('../authMiddleware');
const adminOnlyMiddleware = require('../adminOnlyMiddleware');

const router = express.Router();

// Middleware stack for admin-only access
const adminAuthMiddleware = [authMiddleware, adminOnlyMiddleware];

// GET all audit log records
router.get('/', adminAuthMiddleware, async (req, res) => {
  try {
    const snapshot = await db.collection('audit_logs').orderBy('timestamp', 'desc').limit(200).get(); // Limit to last 200 logs for performance
    if (snapshot.empty) {
      return res.status(200).json([]);
    }
    const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(logs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).send({ message: 'Failed to fetch audit logs.' });
  }
});

module.exports = router;

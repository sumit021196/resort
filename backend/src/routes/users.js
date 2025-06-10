const express = require('express');
const { db } = require('../firebaseAdmin');
const authMiddleware = require('../authMiddleware');
const adminOnlyMiddleware = require('../adminOnlyMiddleware');

const router = express.Router();

// GET all users (Admin only)
router.get('/', [authMiddleware, adminOnlyMiddleware], async (req, res) => {
  try {
    const usersSnapshot = await db.collection('users').get();
    const users = [];
    usersSnapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send({ message: 'Error fetching users list.', error: error.message });
  }
});

// PUT update user role (Admin only)
router.put('/:userId/role', [authMiddleware, adminOnlyMiddleware], async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!role) {
    return res.status(400).send({ message: 'Role is required in the request body.' });
  }

  // Basic role validation (can be expanded)
  const validRoles = ['admin', 'purchaseManager', 'kitchenStaff'];
  if (!validRoles.includes(role)) {
    return res.status(400).send({ message: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
  }

  try {
    const userDocRef = db.collection('users').doc(userId);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return res.status(404).send({ message: `User with ID ${userId} not found.` });
    }

    await userDocRef.update({
      role: role,
      updatedAt: new Date() 
    });

    res.status(200).send({ message: `User ${userId} role updated to ${role}.` });
  } catch (error) {
    console.error(`Error updating role for user ${userId}:`, error);
    res.status(500).send({ message: 'Error updating user role.', error: error.message });
  }
});

module.exports = router;

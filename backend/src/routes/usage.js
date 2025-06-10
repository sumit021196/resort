const express = require('express');
const { db } = require('../firebaseAdmin');
const { logAction } = require('../utils/auditLogger');
const authMiddleware = require('../authMiddleware');
const kitchenStaffOrAdminMiddleware = require('../kitchenStaffOrAdminMiddleware');

const router = express.Router();

// Middleware stack for routes that require kitchen staff or admin access
const usageAuthMiddleware = [authMiddleware, kitchenStaffOrAdminMiddleware];

// POST a new usage record
router.post('/', usageAuthMiddleware, async (req, res) => {
  // Align with frontend which sends 'department'
  const { itemName, quantity, unit, department, usageDate } = req.body;
  const { email } = req.user; // Get user email for logging

  // Basic validation
  if (!itemName || !quantity || !unit || !department || !usageDate) {
    return res.status(400).send({ message: 'Missing required fields: itemName, quantity, unit, department, usageDate.' });
  }
  if (typeof quantity !== 'number' || quantity <= 0) {
    return res.status(400).send({ message: 'Quantity must be a positive number.' });
  }

  try {
    const inventoryId = itemName.trim().toLowerCase().replace(/\s+/g, '_');
    const inventoryRef = db.collection('inventory').doc(inventoryId);
    const usageRef = db.collection('usage').doc();

    await db.runTransaction(async (transaction) => {
      const inventoryDoc = await transaction.get(inventoryRef);

      if (!inventoryDoc.exists) {
        throw new Error(`Item "${itemName}" not found in inventory.`);
      }

      const currentQuantity = inventoryDoc.data().quantity || 0;
      if (currentQuantity < quantity) {
        throw new Error(`Insufficient stock for "${itemName}". Available: ${currentQuantity}, Required: ${quantity}.`);
      }

      const newQuantity = currentQuantity - quantity;

      // 1. Update the inventory item
      transaction.update(inventoryRef, { quantity: newQuantity, lastUpdatedAt: new Date() });

      // 2. Create the usage record
      const newUsage = {
        itemName,
        quantity,
        unit,
        department,
        usageDate: new Date(usageDate),
        recordedByEmail: email,
        createdAt: new Date(),
      };
      transaction.set(usageRef, newUsage);
    });

    // After transaction succeeds, log the action.
    await logAction(email, 'CREATE_USAGE', {
      usageId: usageRef.id,
      itemName,
      quantity,
      unit,
      department
    });

    res.status(201).send({ message: 'Usage recorded and inventory updated successfully.', usageId: usageRef.id });

  } catch (error) {
    console.error('Error in usage transaction:', error);
    if (error.message.includes('Insufficient stock') || error.message.includes('not found')) {
      return res.status(400).send({ message: error.message });
    }
    res.status(500).send({ message: 'Failed to record usage and update inventory.', error: error.message });
  }
});

// GET all usage records
router.get('/history', usageAuthMiddleware, async (req, res) => {
  try {
    const snapshot = await db.collection('usage').orderBy('usageDate', 'desc').get();
    if (snapshot.empty) {
      return res.status(200).json([]);
    }
    const usage = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(usage);
  } catch (error) {
    console.error('Error fetching usage history:', error);
    res.status(500).send({ message: 'Failed to fetch usage history.' });
  }
});

module.exports = router;

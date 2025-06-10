const express = require('express');
const { db } = require('../firebaseAdmin');
const { logAction } = require('../utils/auditLogger');
const authMiddleware = require('../authMiddleware');
const purchaseManagerOrAdminMiddleware = require('../purchaseManagerOrAdminMiddleware');

const router = express.Router();

// Middleware stack for routes that require purchase manager or admin access
const purchaseAuthMiddleware = [authMiddleware, purchaseManagerOrAdminMiddleware];

// POST a new purchase record
router.post('/', purchaseAuthMiddleware, async (req, res) => {
  // Align with frontend which sends 'price' as total price.
  const { itemName, quantity, unit, price, supplier, purchaseDate, invoiceNumber } = req.body;
  const { email } = req.user; // Get user email for logging

  // Basic validation
  if (!itemName || !quantity || !unit || !price || !supplier || !purchaseDate) {
    return res.status(400).send({ message: 'Missing required fields: itemName, quantity, unit, price, supplier, purchaseDate.' });
  }
  if (typeof quantity !== 'number' || typeof price !== 'number' || quantity <= 0 || price <= 0) {
    return res.status(400).send({ message: 'Quantity and price must be positive numbers.' });
  }

  try {
    const inventoryId = itemName.trim().toLowerCase().replace(/\s+/g, '_');
    const inventoryRef = db.collection('inventory').doc(inventoryId);
    const purchaseRef = db.collection('purchases').doc();

    await db.runTransaction(async (transaction) => {
      const inventoryDoc = await transaction.get(inventoryRef);

      let newQuantity = quantity;
      if (inventoryDoc.exists) {
        const currentQuantity = inventoryDoc.data().quantity || 0;
        newQuantity = currentQuantity + quantity;
      }

      // 1. Set/Update the inventory item
      transaction.set(inventoryRef, {
        itemName: itemName.trim(),
        quantity: newQuantity,
        unit: unit,
        lastUpdatedAt: new Date(),
      }, { merge: true });

      // 2. Create the purchase record
      const rate = price / quantity;
      const newPurchase = {
        itemName,
        quantity,
        unit,
        rate: rate, // price per unit
        totalCost: price, // total price from frontend
        supplier,
        purchaseDate: new Date(purchaseDate),
        invoiceNumber: invoiceNumber || null,
        recordedByEmail: email,
        createdAt: new Date(),
      };
      transaction.set(purchaseRef, newPurchase);
    });

    // After transaction succeeds, log the action.
    await logAction(email, 'CREATE_PURCHASE', {
      purchaseId: purchaseRef.id,
      itemName,
      quantity,
      unit,
      totalCost: price
    });

    res.status(201).send({ message: 'Purchase recorded and inventory updated successfully.', purchaseId: purchaseRef.id });

  } catch (error) {
    console.error('Error in purchase transaction:', error);
    res.status(500).send({ message: 'Failed to record purchase and update inventory.', error: error.message });
  }
});

// GET all purchase records
router.get('/history', purchaseAuthMiddleware, async (req, res) => {
  try {
    const snapshot = await db.collection('purchases').orderBy('purchaseDate', 'desc').get();
    if (snapshot.empty) {
      return res.status(200).json([]);
    }
    const purchases = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(purchases);
  } catch (error) {
    console.error('Error fetching purchase history:', error);
    res.status(500).send({ message: 'Failed to fetch purchase history.' });
  }
});

module.exports = router;

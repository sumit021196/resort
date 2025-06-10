const express = require('express');
const { db } = require('../firebaseAdmin');
const authMiddleware = require('../authMiddleware');

const router = express.Router();

// GET all inventory items - accessible to all authenticated users
router.get('/', authMiddleware, async (req, res) => {
  try {
    const inventorySnapshot = await db.collection('inventory').orderBy('itemName').get();
    
    if (inventorySnapshot.empty) {
      return res.status(200).send([]);
    }

    const inventory = inventorySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(inventory);

  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).send({ message: 'Failed to fetch inventory data.', error: error.message });
  }
});

module.exports = router;

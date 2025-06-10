const express = require('express');
console.log('[server.js] Requiring firebaseAdmin.js...');
require('./firebaseAdmin'); // Initialize Firebase Admin SDK
console.log('[server.js] firebaseAdmin.js required.');
const authMiddleware = require('./authMiddleware');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON bodies
app.use(express.json());

// Enable CORS
const corsOptions = {
  origin: 'http://localhost:3000', // Allow only your frontend origin
  optionsSuccessStatus: 200 // For legacy browser support
};
app.use(cors(corsOptions));

// Public route
app.get('/', (req, res) => {
  res.send('Vegetable Inventory Management System Backend API is running!');
});

// Sample protected route
app.get('/api/protected-data', authMiddleware, (req, res) => {
  // If authMiddleware succeeds, req.user will contain the decoded token (user info)
  res.send({
    message: 'This is protected data! You are authenticated.',
    user: req.user // Send back the user info from the token
  });
});

// User management routes
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes); // Note: authMiddleware and adminOnlyMiddleware are applied within users.js

// Purchase management routes
const purchaseRoutes = require('./routes/purchases');
app.use('/api/purchases', purchaseRoutes);

// Usage management routes
const usageRoutes = require('./routes/usage');
app.use('/api/usage', usageRoutes);

// Inventory routes
const inventoryRoutes = require('./routes/inventory');
const auditRoutes = require('./routes/audit');
app.use('/api/inventory', inventoryRoutes);
app.use('/api/audit', auditRoutes);

// Placeholder for future API routes
// const vegetableRoutes = require('./routes/vegetables');
// app.use('/api/vegetables', authMiddleware, vegetableRoutes);

console.log('[server.js] Attempting to start server listening on port:', PORT);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

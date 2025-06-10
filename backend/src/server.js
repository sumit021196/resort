// Load environment variables first
require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

// Create logs directory if it doesn't exist
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(path.join(logDir, 'access.log'), { flags: 'a' });

const app = express();
const PORT = process.env.PORT || 5000;

// Setup logger
app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan('dev')); // Log to console as well

console.log('[server.js] Requiring firebaseAdmin.js...');
require('./firebaseAdmin'); // Initialize Firebase Admin SDK
console.log('[server.js] firebaseAdmin.js required.');

const authMiddleware = require('./authMiddleware');

// Middleware to parse JSON bodies
app.use(express.json());

// Enable CORS
const allowedOrigins = [
  'http://localhost:3000', // Local development
  'https://kitcheni.netlify.app' // Production frontend
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
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

// Authentication routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

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

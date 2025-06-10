const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user.uid,
      email: user.email,
      role: user.role || 'user' 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );
};

// User login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Sign in with email and password
    const userRecord = await admin.auth().getUserByEmail(email);
    
    // Verify password (you'll need to implement this or use Firebase Auth)
    // For now, we'll assume the user is authenticated
    
    // Get additional user data from Firestore
    const userDoc = await admin.firestore().collection('users').doc(userRecord.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userData = userDoc.data();
    const token = generateToken({ ...userRecord, role: userData.role });
    
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        role: userData.role,
        name: userData.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// User registration
exports.register = async (req, res) => {
  try {
    const { email, password, name, role = 'kitchenStaff' } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name are required' });
    }

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
      emailVerified: false,
      disabled: false
    });

    // Create user document in Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      name,
      role,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Generate JWT token
    const token = generateToken({ ...userRecord, role });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        uid: userRecord.uid,
        email,
        name,
        role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ 
      message: error.message.includes('already exists') 
        ? 'Email already in use' 
        : 'Registration failed' 
    });
  }
};

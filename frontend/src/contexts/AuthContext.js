import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase'; // Assuming firebase.js is in src

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null); // To store user data from Firestore
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch user data from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        try {
          console.log(`[AuthContext] Attempting to fetch user document: users/${user.uid}`);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserData(userDocSnap.data());
            console.log('[AuthContext] User data fetched successfully:', userDocSnap.data());
          } else {
            console.warn('[AuthContext] User data not found in Firestore for UID:', user.uid);
            setUserData(null);
          }
        } catch (error) {
          console.error('[AuthContext] Error fetching user document:', error);
          console.error(`[AuthContext] Firebase error code: ${error.code}, message: ${error.message}`);
          setUserData(null); // Ensure userData is cleared on error
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe; // Cleanup subscription on unmount
  }, []);

    const logout = () => {
    return signOut(auth);
  };

  const value = {
    currentUser,
    userData, // e.g., { uid, name, email, role, ... }
    loading,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

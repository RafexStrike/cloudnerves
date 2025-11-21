'use client';

import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

export const useGetCurrentUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);

  const userCheckRef = useRef(new Set());

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        // User logged out
        if (!firebaseUser) {
          setUser(null);
          setLoading(false);
          userCheckRef.current.clear();
          return;
        }

        console.log('👤 User logged in:', firebaseUser.uid);

        // Prevent duplicate checks
        if (userCheckRef.current.has(firebaseUser.uid)) {
          console.log('⏭️ Skipping duplicate check for:', firebaseUser.uid);
          return;
        }
        userCheckRef.current.add(firebaseUser.uid);

        // Check if user exists in MongoDB
        console.log('🔍 Checking MongoDB for user:', firebaseUser.uid);
        const checkResponse = await fetch(`/api/users/${firebaseUser.uid}`);

        if (checkResponse.status === 404) {
          // NEW USER - Save to MongoDB
          console.log('✨ New user detected, saving to MongoDB...');

          const createResponse = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || '',
              photoURL: firebaseUser.photoURL || '',
            }),
          });

          if (createResponse.ok) {
            const createdUser = await createResponse.json();
            console.log('✓ User saved to MongoDB:', createdUser);
            setUser(firebaseUser);
            setIsNewUser(true);
          } else {
            throw new Error('Failed to save user to MongoDB');
          }
        } else if (checkResponse.ok) {
          // RETURNING USER - Already in MongoDB
          console.log('✓ Returning user, already in MongoDB');
          setUser(firebaseUser);
          setIsNewUser(false);
        } else {
          throw new Error('Failed to check user in MongoDB');
        }

        setLoading(false);
      } catch (err) {
        console.error('❌ Error:', err);
        setError(err.message);
        setUser(firebaseUser);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  return {
    user,
    loading,
    error,
    isNewUser,
  };
};

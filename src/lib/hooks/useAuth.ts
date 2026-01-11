'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { AuthUser } from '@/lib/types';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const unsubUser = onSnapshot(
        doc(db, 'users', firebaseUser.uid),
        (userDoc) => {
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: userData.displayName,
              role: userData.role,
              centerId: userData.centerId,
            });
          } else {
            setUser(null);
            setError('User document not found');
          }
          setLoading(false);
        },
        (err) => {
          console.error('User snapshot error:', err);
          setError('Failed to load user data');
          setLoading(false);
        }
      );

      return () => unsubUser();
    });

    return () => unsubAuth();
  }, []);

  return { user, loading, error };
}
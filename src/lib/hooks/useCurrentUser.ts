'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { User } from '@/lib/types';
import { useAuth } from './useAuth';

export function useCurrentUser() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Real-time listener foydalanuvchi ma'lumotlari uchun
    const unsubscribe = onSnapshot(
      doc(db, 'users', authUser.uid),
      (doc) => {
        if (doc.exists()) {
          setUser({ id: doc.id, ...doc.data() } as User);
        } else {
          setUser(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('User listener error:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [authUser]);

  return { user, loading };
}
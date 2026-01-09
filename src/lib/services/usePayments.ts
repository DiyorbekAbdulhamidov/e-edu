'use client';

import { useState, useEffect } from 'react';
import { paymentService } from '@/lib/services/paymentService';
import { Payment } from '@/lib/types';

export function usePayments(centerId: string) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!centerId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = paymentService.subscribe(centerId, (data) => {
      setPayments(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [centerId]);

  return { payments, loading };
}
'use client';

import { useState, useEffect } from 'react';
import { centerService } from '@/lib/services/centerService';
import { Center } from '@/lib/types';

export function useCenters() {
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCenters();
  }, []);

  const loadCenters = async () => {
    try {
      setLoading(true);
      const data = await centerService.list();
      setCenters(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    loadCenters();
  };

  return { centers, loading, error, refresh };
}
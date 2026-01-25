'use client';

import { useCallback, useEffect, useState } from 'react';
import { centerService } from '@/lib/services/centerService';
import { Center } from '@/lib/types';

export function useCenters() {
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCenters = useCallback(async () => {
    try {
      setLoading(true);
      const data = await centerService.list();
      setCenters(data);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCenters();
  }, [loadCenters]);

  const refresh = () => {
    loadCenters();
  };

  return { centers, loading, error, refresh };
}

'use client';

import { useState, useEffect } from 'react';
import { groupService } from '@/lib/services/groupService';
import { Group, FilterParams } from '@/lib/types';

export function useGroups(centerId: string, filters?: FilterParams) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!centerId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = groupService.subscribe(
      centerId,
      (data) => {
        setGroups(data);
        setLoading(false);
        setError(null);
      },
      filters
    );

    return () => unsubscribe();
  }, [centerId, filters?.status, filters?.search]);

  return { groups, loading, error };
}
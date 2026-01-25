'use client';

import { useState, useEffect } from 'react';
import { groupService } from '@/lib/services/groupService';
import { Group, FilterParams } from '@/lib/types';

export function useGroups(centerId: string, filters?: FilterParams) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!centerId || centerId === 'pending') {
      setLoading(false);
      return;
    }

    let isSubscribed = true;
    setLoading(true);

    const unsubscribe = groupService.subscribe(
      centerId,
      (data) => {
        if (isSubscribed) {
          setGroups(data);
          setLoading(false);
          setError(null);
        }
      },
      filters
    );

    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, [centerId, filters]);

  return { groups, loading, error };
}

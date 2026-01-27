'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { groupService } from '@/lib/services/groupService';
import { Group, FilterParams } from '@/lib/types';

export function useGroups(centerId: string, filters?: FilterParams) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const filtersKey = useMemo(() => JSON.stringify(filters ?? {}), [filters]);
  const filtersRef = useRef<FilterParams | undefined>(filters);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filtersKey, filters]);

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
      filtersRef.current
    );

    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, [centerId, filtersKey]);

  return { groups, loading, error };
}

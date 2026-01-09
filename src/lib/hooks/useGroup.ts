'use client';

import { useState, useEffect } from 'react';
import { groupService } from '@/lib/services/groupService';
import { Group } from '@/lib/types';

export function useGroup(groupId: string, centerId: string) {
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId || !centerId) {
      setLoading(false);
      return;
    }

    const fetchGroup = async () => {
      try {
        setLoading(true);
        const data = await groupService.getById(groupId, centerId);
        setGroup(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setGroup(null);
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [groupId, centerId]);

  return { group, loading, error };
}
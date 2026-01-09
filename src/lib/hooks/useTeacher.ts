'use client';

import { useState, useEffect } from 'react';
import { teacherService } from '@/lib/services/teacherService';
import { Teacher } from '@/lib/types';

export function useTeacher(userId: string, centerId: string) {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !centerId) {
      setLoading(false);
      return;
    }

    const fetchTeacher = async () => {
      try {
        const data = await teacherService.getByUserId(userId, centerId);
        setTeacher(data);
      } catch (error) {
        console.error('Fetch teacher error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacher();
  }, [userId, centerId]);

  return { teacher, loading };
}
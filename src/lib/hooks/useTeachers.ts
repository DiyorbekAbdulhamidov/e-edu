'use client';

import { useState, useEffect, useCallback } from 'react';
import { teacherService } from '@/lib/services/teacherService';
import { TeacherWithUser } from '@/lib/types';

export function useTeachers(centerId: string) {
  const [teachers, setTeachers] = useState<TeacherWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeachers = useCallback(async () => {
    if (!centerId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await teacherService.list(centerId);
      setTeachers(data);
    } catch (err) {
      console.error('Fetch teachers error:', err);
      setError('O\'qituvchilarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  }, [centerId]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  return {
    teachers,
    loading,
    error,
    refresh: fetchTeachers,
  };
}
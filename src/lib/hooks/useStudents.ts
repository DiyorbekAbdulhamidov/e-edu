'use client';

import { useState, useEffect } from 'react';
import { studentService } from '@/lib/services/studentService';
import { Student, FilterParams } from '@/lib/types';

export function useStudents(centerId: string, filters?: FilterParams) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!centerId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = studentService.subscribe(
      centerId,
      (data) => {
        setStudents(data);
        setLoading(false);
        setError(null);
      },
      filters
    );

    return () => unsubscribe();
  }, [centerId, filters]);

  return { students, loading, error };
}

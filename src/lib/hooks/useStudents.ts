'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { studentService } from '@/lib/services/studentService';
import { Student, FilterParams } from '@/lib/types';

export function useStudents(centerId: string, filters?: FilterParams) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const filtersKey = useMemo(() => JSON.stringify(filters ?? {}), [filters]);
  const filtersRef = useRef<FilterParams | undefined>(filters);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filtersKey, filters]);

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
      filtersRef.current
    );

    return () => unsubscribe();
  }, [centerId, filters]);

  return { students, loading, error };
}

'use client';

import { useState, useEffect } from 'react';
import { studentService } from '@/lib/services/studentService';
import { Student } from '@/lib/types';

export function useStudent(studentId: string, centerId: string) {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId || !centerId) {
      setLoading(false);
      return;
    }

    const fetchStudent = async () => {
      try {
        setLoading(true);
        const data = await studentService.getById(studentId, centerId);
        setStudent(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setStudent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [studentId, centerId]);

  return { student, loading, error };
}
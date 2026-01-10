'use client';

import { useState, useEffect, useMemo } from 'react';
import { attendanceService } from '@/lib/services/attendanceService';
import { Attendance } from '@/lib/types';

export function useAttendance(
  groupId: string,
  date: Date,
  centerId: string
) {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  // Date obyektini string ga aylantiramiz, shunda dependency stable bo'ladi
  const dateKey = useMemo(() => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  }, [date]);

  useEffect(() => {
    if (!groupId || !centerId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // dateKey dan qayta Date yaratamiz
    const queryDate = new Date(dateKey);

    const unsubscribe = attendanceService.subscribeToGroup(
      groupId,
      queryDate,
      centerId,
      (data) => {
        setAttendance(data);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [groupId, dateKey, centerId]); // date o'rniga dateKey

  return { attendance, loading };
}
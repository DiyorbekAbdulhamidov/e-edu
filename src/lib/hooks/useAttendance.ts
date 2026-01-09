'use client';

import { useState, useEffect } from 'react';
import { attendanceService } from '@/lib/services/attendanceService';
import { Attendance } from '@/lib/types';

export function useAttendance(
  groupId: string,
  date: Date,
  centerId: string
) {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId || !centerId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = attendanceService.subscribeToGroup(
      groupId,
      date,
      centerId,
      (data) => {
        setAttendance(data);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [groupId, date, centerId]);

  return { attendance, loading };
}
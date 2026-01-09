'use client';

import { useState } from 'react';
import { attendanceService } from '@/lib/services/attendanceService';
import { useAuthContext } from '@/contexts/AuthContext';
import { Student, Attendance, AttendanceStatus } from '@/lib/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface AttendanceMarkerProps {
  groupId: string;
  students: Student[];
  date: Date;
  existingAttendance: Attendance[];
}

export default function AttendanceMarker({
  groupId,
  students,
  date,
  existingAttendance,
}: AttendanceMarkerProps) {
  const { user } = useAuthContext();
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>(
    () => {
      const initial: Record<string, AttendanceStatus> = {};
      existingAttendance.forEach((att) => {
        initial[att.studentId] = att.status;
      });
      return initial;
    }
  );
  const [saving, setSaving] = useState(false);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setStatuses({ ...statuses, [studentId]: status });
  };

  const handleSave = async () => {
    if (!user?.centerId) return;

    setSaving(true);
    try {
      const promises = students.map((student) => {
        const status = statuses[student.id] || 'absent';
        return attendanceService.mark(
          {
            groupId,
            studentId: student.id,
            date,
            status,
          },
          user.centerId!,
          user.uid
        );
      });

      await Promise.all(promises);
      alert('Davomat saqlandi!');
    } catch (error) {
      console.error('Save attendance error:', error);
      alert('Xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  const statusButtons = [
    { value: 'present' as const, label: '✓', color: 'bg-success-500' },
    { value: 'absent' as const, label: '✗', color: 'bg-danger-500' },
    { value: 'late' as const, label: 'K', color: 'bg-warning-500' },
    { value: 'excused' as const, label: 'S', color: 'bg-gray-400' },
  ];

  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Davomat belgilash</h2>
        <Button onClick={handleSave} loading={saving}>
          Saqlash
        </Button>
      </div>

      <div className="space-y-4">
        {students.map((student) => (
          <div
            key={student.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div>
              <p className="font-medium">
                {student.firstName} {student.lastName}
              </p>
              <p className="text-sm text-gray-600">{student.phone}</p>
            </div>

            <div className="flex gap-2">
              {statusButtons.map((btn) => (
                <button
                  key={btn.value}
                  onClick={() => handleStatusChange(student.id, btn.value)}
                  className={`w-10 h-10 rounded-lg font-semibold text-white transition-all ${statuses[student.id] === btn.value
                      ? btn.color
                      : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-primary-50 rounded-lg">
        <p className="text-sm text-primary-700">
          <strong>✓</strong> - Keldi | <strong>✗</strong> - Kelmadi |{' '}
          <strong>K</strong> - Kech qoldi | <strong>S</strong> - Sababli
        </p>
      </div>
    </Card>
  );
}
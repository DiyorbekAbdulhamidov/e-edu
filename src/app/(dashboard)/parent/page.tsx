'use client';

import { useEffect, useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { studentService } from '@/lib/services/studentService';
import { attendanceService } from '@/lib/services/attendanceService';
import { Student, AttendanceStats } from '@/lib/types';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';

export default function ParentDashboard() {
  const { user } = useAuthContext();
  const [children, setChildren] = useState<Student[]>([]);
  const [stats, setStats] = useState<Record<string, AttendanceStats>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid && user?.centerId) {
      loadChildren();
    }
  }, [user]);

  const loadChildren = async () => {
    try {
      // Ota-onaga tegishli talabalarni topish
      const allStudents = await studentService.list(user!.centerId!, {});
      const myChildren = allStudents.students.filter(
        (s) => s.parentId === user!.uid
      );
      setChildren(myChildren);

      // Har bir bola uchun statistika
      const statsData: Record<string, AttendanceStats> = {};
      for (const child of myChildren) {
        const childStats = await attendanceService.getStudentStats(
          child.id,
          user!.centerId!
        );
        statsData[child.id] = childStats;
      }
      setStats(statsData);
    } catch (error) {
      console.error('Load children error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Xush kelibsiz, {user?.displayName}!
        </h1>
        <p className="text-gray-600 mt-2">Farzandlaringiz haqida ma'lumot</p>
      </div>

      {children.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 py-12">
            Sizga tegishli talabalar topilmadi
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {children.map((child) => {
            const childStats = stats[child.id];

            return (
              <Card key={child.id}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {child.firstName} {child.lastName}
                    </h2>
                    <p className="text-gray-600">{child.phone}</p>
                  </div>

                  {child.totalDebt > 0 && (
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Qarz:</p>
                      <p className="text-lg font-bold text-danger-600">
                        {child.totalDebt.toLocaleString()} so'm
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-primary-50 rounded-lg">
                    <div className="text-2xl font-bold text-primary-600">
                      {child.groups.length}
                    </div>
                    <div className="text-sm text-gray-600">Guruhlar</div>
                  </div>

                  <div className="text-center p-4 bg-success-50 rounded-lg">
                    <div className="text-2xl font-bold text-success-600">
                      {childStats?.attendanceRate.toFixed(1) || 0}%
                    </div>
                    <div className="text-sm text-gray-600">Davomat</div>
                  </div>

                  <div className="text-center p-4 bg-warning-50 rounded-lg">
                    <div className="text-2xl font-bold text-warning-600">
                      {childStats?.presentDays || 0}
                    </div>
                    <div className="text-sm text-gray-600">Kelgan</div>
                  </div>

                  <div className="text-center p-4 bg-danger-50 rounded-lg">
                    <div className="text-2xl font-bold text-danger-600">
                      {childStats?.absentDays || 0}
                    </div>
                    <div className="text-sm text-gray-600">Kelmagan</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
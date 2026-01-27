'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { groupService } from '@/lib/services/groupService';
import { useStudents } from '@/lib/hooks/useStudents';
import { useAttendance } from '@/lib/hooks/useAttendance';
import { Group } from '@/lib/types';
import AttendanceMarker from '@/components/attendance/AttendanceMarker';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';

export default function TeacherAttendancePage() {
  const { user } = useAuthContext();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(true);

  const { students } = useStudents(user?.centerId || '');
  const { attendance, loading: attendanceLoading } = useAttendance(
    selectedGroupId,
    new Date(selectedDate),
    user?.centerId || ''
  );

  const loadGroups = useCallback(async () => {
    try {
      const data = await groupService.getByTeacherId(
        user!.uid,
        user!.centerId!
      );
      setGroups(data);
    } catch (error) {
      console.error('Load groups error:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.uid && user?.centerId) {
      loadGroups();
    }
  }, [loadGroups, user]);

  const groupStudents = students.filter((s) =>
    s.groups.includes(selectedGroupId)
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Davomat</h1>
        <p className="text-gray-600 mt-1">Guruh davomatini belgilang</p>
      </div>

      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Guruhni tanlang
            </label>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Guruh tanlang</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name} ({group.currentStudents} talaba)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sana
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </Card>

      {!selectedGroupId ? (
        <Card>
          <p className="text-center text-gray-500 py-12">
            Davomatni belgilash uchun guruh tanlang
          </p>
        </Card>
      ) : groupStudents.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 py-12">
            Bu guruhda talabalar yo'q
          </p>
        </Card>
      ) : attendanceLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : (
        <AttendanceMarker
          groupId={selectedGroupId}
          students={groupStudents}
          date={new Date(selectedDate)}
          existingAttendance={attendance}
        />
      )}
    </div>
  );
}

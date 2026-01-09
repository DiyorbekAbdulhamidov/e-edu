'use client';

import { useEffect, useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useTeacher } from '@/lib/hooks/useTeacher';
import { groupService } from '@/lib/services/groupService';
import { Group } from '@/lib/types';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import Link from 'next/link';

export default function TeacherDashboard() {
  const { user } = useAuthContext();
  const { teacher, loading: teacherLoading } = useTeacher(
    user?.uid || '',
    user?.centerId || ''
  );
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid && user?.centerId) {
      loadGroups();
    }
  }, [user]);

  const loadGroups = async () => {
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
  };

  if (teacherLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const totalStudents = groups.reduce(
    (sum, group) => sum + group.currentStudents,
    0
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Xush kelibsiz, {user?.displayName}!
        </h1>
        <p className="text-gray-600 mt-2">O'qituvchi paneli</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="text-4xl font-bold mb-2">{groups.length}</div>
          <div className="text-primary-100">Mening guruhlarim</div>
        </Card>

        <Card className="bg-gradient-to-br from-success-500 to-success-600 text-white">
          <div className="text-4xl font-bold mb-2">{totalStudents}</div>
          <div className="text-success-100">Jami talabalar</div>
        </Card>

        <Card className="bg-gradient-to-br from-warning-500 to-warning-600 text-white">
          <div className="text-4xl font-bold mb-2">
            {teacher?.salaryAmount.toLocaleString() || 0}
          </div>
          <div className="text-warning-100">
            Oylik maosh ({teacher?.salaryType === 'fixed' ? 'Qat\'iy' : 'Talaba'})
          </div>
        </Card>
      </div>

      {/* My Groups */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Mening guruhlarim</h2>

        {groups.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            Sizga hali guruhlar biriktirilmagan
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map((group) => (
              <Link
                key={group.id}
                href={`/teacher/groups/${group.id}`}
                className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <h3 className="font-semibold text-lg mb-2">{group.name}</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    Talabalar: {group.currentStudents} / {group.maxStudents}
                  </p>
                  <p>Xona: {group.room}</p>
                  <p className="text-success-600 font-medium">
                    {group.monthlyPrice.toLocaleString()} so'm/oy
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
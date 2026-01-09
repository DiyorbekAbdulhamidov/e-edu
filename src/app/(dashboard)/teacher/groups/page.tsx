'use client';

import { useEffect, useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { groupService } from '@/lib/services/groupService';
import { Group } from '@/lib/types';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import Link from 'next/link';

export default function TeacherGroupsPage() {
  const { user } = useAuthContext();
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
        <h1 className="text-2xl font-bold text-gray-900">Mening guruhlarim</h1>
        <p className="text-gray-600 mt-1">Sizga biriktirilgan guruhlar</p>
      </div>

      {groups.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 py-12">
            Sizga hali guruhlar biriktirilmagan
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groups.map((group) => (
            <Card key={group.id} hover>
              <h3 className="text-lg font-semibold mb-2">{group.name}</h3>
              <p className="text-gray-600 mb-4">
                {group.courseName} • {group.level}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Talabalar:</span>
                  <span className="font-medium">
                    {group.currentStudents} / {group.maxStudents}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Xona:</span>
                  <span className="font-medium">{group.room}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Oylik to'lov:</span>
                  <span className="font-medium text-success-600">
                    {group.monthlyPrice.toLocaleString()} so'm
                  </span>
                </div>
              </div>

              <Link
                href={`/teacher/groups/${group.id}`}
                className="block w-full text-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Batafsil
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
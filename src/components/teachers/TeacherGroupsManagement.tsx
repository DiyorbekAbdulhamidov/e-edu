// src/components/teachers/TeacherGroupsManagement.tsx
'use client';

import { useState, useEffect } from 'react';
import { useGroups } from '@/lib/hooks/useGroups';
import { teacherService } from '@/lib/services/teacherService';
import { groupService } from '@/lib/services/groupService';
import { Teacher, Group } from '@/lib/types';

interface TeacherGroupsManagementProps {
  teacher: Teacher;
  centerId: string;
  onUpdate: () => void;
}

export default function TeacherGroupsManagement({
  teacher,
  centerId,
  onUpdate,
}: TeacherGroupsManagementProps) {
  const { groups: allGroups } = useGroups(centerId);
  const [teacherGroups, setTeacherGroups] = useState<Group[]>([]);
  const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Teacher'ning guruhlarini ajratish
    const tGroups = allGroups.filter(g => teacher.groups.includes(g.id));
    const aGroups = allGroups.filter(
      g => !teacher.groups.includes(g.id) && g.status === 'active'
    );

    setTeacherGroups(tGroups);
    setAvailableGroups(aGroups);
  }, [allGroups, teacher.groups]);

  const handleAddGroup = async () => {
    if (!selectedGroupId) return;

    setLoading(true);
    try {
      // Guruhga teacher'ni biriktirish
      await groupService.update(
        selectedGroupId,
        { teacherId: teacher.id },
        centerId
      );

      // Teacher'ga guruhni qo'shish
      const updatedGroups = [...teacher.groups, selectedGroupId];
      await teacherService.update(
        teacher.id,
        { groups: updatedGroups } as any,
        centerId
      );

      setSelectedGroupId('');
      onUpdate();
      alert('Guruh biriktirildi!');
    } catch (error: any) {
      alert('Xatolik: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveGroup = async (groupId: string) => {
    if (!confirm('Guruhni olib tashlaysizmi?')) return;

    setLoading(true);
    try {
      const updatedGroups = teacher.groups.filter(id => id !== groupId);

      await teacherService.update(
        teacher.id,
        { groups: updatedGroups } as any,
        centerId
      );

      onUpdate();
      alert('Guruh olib tashlandi!');
    } catch (error: any) {
      alert('Xatolik: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Group Section */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-3">
          Yangi guruh biriktirish
        </h3>
        <div className="flex gap-3">
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Guruh tanlang</option>
            {availableGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name} - {group.courseName} ({group.currentStudents}/{group.maxStudents})
              </option>
            ))}
          </select>
          <button
            onClick={handleAddGroup}
            disabled={!selectedGroupId || loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {loading ? 'Qo\'shilmoqda...' : '+ Qo\'shish'}
          </button>
        </div>
      </div>

      {/* Teacher Groups List */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">
          Biriktirilgan guruhlar ({teacherGroups.length})
        </h3>

        {teacherGroups.length === 0 ? (
          <p className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg">
            Hali guruhlar biriktirilmagan
          </p>
        ) : (
          <div className="space-y-3">
            {teacherGroups.map((group) => (
              <div
                key={group.id}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {group.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {group.courseName} • {group.level} • Xona: {group.room}
                  </p>
                  <p className="text-sm text-green-600 font-medium mt-1">
                    {group.currentStudents}/{group.maxStudents} talaba • {group.monthlyPrice.toLocaleString()} so'm/oy
                  </p>
                </div>

                <button
                  onClick={() => handleRemoveGroup(group.id)}
                  disabled={loading}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50 font-medium"
                >
                  Olib tashlash
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-900">
            {teacherGroups.length}
          </p>
          <p className="text-xs text-gray-600">Guruhlar</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-900">
            {teacherGroups.reduce((sum, g) => sum + g.currentStudents, 0)}
          </p>
          <p className="text-xs text-gray-600">Jami talabalar</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-900">
            {teacherGroups.length > 0
              ? Math.round(
                teacherGroups.reduce((sum, g) => sum + g.currentStudents, 0) /
                teacherGroups.length
              )
              : 0}
          </p>
          <p className="text-xs text-gray-600">O'rtacha talaba</p>
        </div>
      </div>
    </div>
  );
}
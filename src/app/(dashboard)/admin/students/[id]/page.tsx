'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useStudent } from '@/lib/hooks/useStudent';
import { useGroups } from '@/lib/hooks/useGroups';
import { useAuthContext } from '@/contexts/AuthContext';
import { studentService } from '@/lib/services/studentService';
import { groupService } from '@/lib/services/groupService';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { PencilIcon } from '@/components/ui/Icons';

export default function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { user } = useAuthContext();
  const { student, loading } = useStudent(resolvedParams.id, user?.centerId || '');
  const { groups } = useGroups(user?.centerId || '');

  const [showAddGroup, setShowAddGroup] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Talaba guruhlarini olish
  const studentGroups = groups.filter(g => student?.groups.includes(g.id));
  const availableGroups = groups.filter(g =>
    !student?.groups.includes(g.id) && g.status === 'active'
  );

  const handleAddToGroup = async () => {
    if (!selectedGroupId || !student || !user?.centerId) return;

    setActionLoading(true);
    try {
      await studentService.addToGroup(student.id, selectedGroupId, user.centerId);
      await groupService.incrementStudentCount(selectedGroupId, user.centerId);

      alert('Talaba guruhga qo\'shildi!');
      setShowAddGroup(false);
      setSelectedGroupId('');
      window.location.reload(); // Refresh
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Xatolik yuz berdi';
      alert('Xatolik: ' + message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveFromGroup = async (groupId: string) => {
    if (!confirm('Talabani guruhdan olib tashlaysizmi?')) return;
    if (!student || !user?.centerId) return;

    setActionLoading(true);
    try {
      await studentService.removeFromGroup(student.id, groupId, user.centerId);
      await groupService.decrementStudentCount(groupId, user.centerId);

      alert('Talaba guruhdan olib tashlandi!');
      window.location.reload();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Xatolik yuz berdi';
      alert('Xatolik: ' + message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Talaba topilmadi</p>
      </div>
    );
  }

  const statusVariant = {
    active: 'success' as const,
    frozen: 'warning' as const,
    left: 'danger' as const,
  };

  const statusText = {
    active: 'Faol',
    frozen: 'Muzlatilgan',
    left: 'Ketgan',
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {student.firstName} {student.lastName}
          </h1>
          <Badge variant={statusVariant[student.status as keyof typeof statusVariant]} className="mt-2">
            {statusText[student.status]}
          </Badge>
        </div>

        <Link href={`/admin/students/${student.id}/edit`}>
          <Button>
            <PencilIcon className="h-5 w-5" />
            Tahrirlash
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Asosiy ma'lumotlar</h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Telefon</p>
              <p className="font-medium">{student.phone}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Ota-ona telefoni</p>
              <p className="font-medium">{student.parentPhone}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Tug'ilgan sana</p>
              <p className="font-medium">
                {new Date(student.dateOfBirth.seconds * 1000).toLocaleDateString('uz-UZ')}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Manzil</p>
              <p className="font-medium">{student.address}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Ro'yxatdan o'tgan sana</p>
              <p className="font-medium">
                {new Date(student.enrollmentDate.seconds * 1000).toLocaleDateString('uz-UZ')}
              </p>
            </div>

            {student.notes && (
              <div>
                <p className="text-sm text-gray-600">Izoh</p>
                <p className="font-medium">{student.notes}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Stats */}
        <div className="space-y-6">
          <Card>
            <h3 className="font-semibold mb-4">Statistika</h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Guruhlar</span>
                <span className="font-semibold">{student.groups.length}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Qarz</span>
                <span
                  className={`font-semibold ${student.totalDebt > 0 ? 'text-danger-600' : 'text-success-600'
                    }`}
                >
                  {student.totalDebt.toLocaleString()} so'm
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Groups Section */}
        <Card className="lg:col-span-3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Guruhlar</h2>
            <Button onClick={() => setShowAddGroup(!showAddGroup)}>
              {showAddGroup ? 'Bekor qilish' : '+ Guruhga qo\'shish'}
            </Button>
          </div>

          {showAddGroup && (
            <div className="mb-6 p-4 bg-primary-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Guruhni tanlang
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Guruh tanlang</option>
                  {availableGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name} ({group.currentStudents}/{group.maxStudents})
                    </option>
                  ))}
                </select>
                <Button
                  onClick={handleAddToGroup}
                  disabled={!selectedGroupId || actionLoading}
                  loading={actionLoading}
                >
                  Qo'shish
                </Button>
              </div>
            </div>
          )}

          {studentGroups.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Talaba hali guruhga qo'shilmagan
            </p>
          ) : (
            <div className="space-y-3">
              {studentGroups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold">{group.name}</h3>
                    <p className="text-sm text-gray-600">
                      {group.courseName} • {group.level}
                    </p>
                    <p className="text-sm text-success-600 font-medium mt-1">
                      {group.monthlyPrice.toLocaleString()} so'm/oy
                    </p>
                  </div>
                  <Button
                    variant="danger"
                    onClick={() => handleRemoveFromGroup(group.id)}
                    disabled={actionLoading}
                  >
                    Olib tashlash
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

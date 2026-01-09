'use client';

import { use } from 'react';
import Link from 'next/link';
import { useStudent } from '@/lib/hooks/useStudent';
import { useAuthContext } from '@/contexts/AuthContext';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { PencilIcon } from '@/components/ui/Icons';

export default function StudentDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params);
  const { user } = useAuthContext();
  const { student, loading } = useStudent(resolvedParams.id, user?.centerId || '');

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
          <Badge variant={statusVariant[student.status]} className="mt-2">
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
                <span className={`font-semibold ${student.totalDebt > 0 ? 'text-danger-600' : 'text-success-600'}`}>
                  {student.totalDebt.toLocaleString()} so'm
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
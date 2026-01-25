'use client';

import { use } from 'react';
import Link from 'next/link';
import { useGroup } from '@/lib/hooks/useGroup';
import { useAuthContext } from '@/contexts/AuthContext';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { PencilIcon } from '@/components/ui/Icons';

export default function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { user } = useAuthContext();
  const { group, loading } = useGroup(resolvedParams.id, user?.centerId || '');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Guruh topilmadi</p>
      </div>
    );
  }

  const statusVariant = {
    active: 'success' as const,
    completed: 'gray' as const,
    cancelled: 'danger' as const,
  };

  const statusText = {
    active: 'Faol',
    completed: 'Tugagan',
    cancelled: 'Bekor qilingan',
  };

  const daysMap: Record<string, string> = {
    monday: 'Dushanba',
    tuesday: 'Seshanba',
    wednesday: 'Chorshanba',
    thursday: 'Payshanba',
    friday: 'Juma',
    saturday: 'Shanba',
    sunday: 'Yakshanba',
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
          <p className="text-gray-600">
            {group.courseName} • {group.level}
          </p>
          <Badge variant={statusVariant[group.status]} className="mt-2">
            {statusText[group.status]}
          </Badge>
        </div>

        <Link href={`/admin/groups/${group.id}/edit`}>
          <Button>
            <PencilIcon className="h-5 w-5" />
            Tahrirlash
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Asosiy ma&apos;lumotlar</h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Xona</p>
              <p className="font-medium">{group.room}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Oylik to&apos;lov</p>
              <p className="font-medium text-success-600">
                {group.monthlyPrice.toLocaleString()} so&apos;m
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Talabalar</p>
              <p className="font-medium">
                {group.currentStudents} / {group.maxStudents}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Boshlanish sanasi</p>
              <p className="font-medium">
                {new Date(group.startDate.seconds * 1000).toLocaleDateString('uz-UZ')}
              </p>
            </div>

            {group.endDate && (
              <div>
                <p className="text-sm text-gray-600">Tugash sanasi</p>
                <p className="font-medium">
                  {new Date(group.endDate.seconds * 1000).toLocaleDateString('uz-UZ')}
                </p>
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <h3 className="font-semibold mb-4">Dars jadvali</h3>
            <div className="space-y-2">
              {Object.entries(group.schedule).map(([day, time]) => {
                if (!time) return null;
                return (
                  <div key={day} className="flex justify-between text-sm">
                    <span className="text-gray-600">{daysMap[day]}:</span>
                    <span className="font-medium">
                      {time.start} - {time.end}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

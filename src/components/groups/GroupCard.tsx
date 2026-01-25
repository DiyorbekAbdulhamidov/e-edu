import Link from 'next/link';
import { Group } from '@/lib/types';
import Badge from '@/components/ui/Badge';
import { PencilIcon, EyeIcon } from '@/components/ui/Icons';

interface GroupCardProps {
  group: Group;
}

export default function GroupCard({ group }: GroupCardProps) {
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

  const activeDays = Object.entries(group.schedule).filter(
    ([, value]) => value !== null
  );

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg text-gray-900">{group.name}</h3>
          <p className="text-sm text-gray-600">
            {group.courseName} • {group.level}
          </p>
        </div>

        <Badge variant={statusVariant[group.status]}>
          {statusText[group.status]}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Talabalar:</span>
          <span className="font-medium">
            {group.currentStudents} / {group.maxStudents}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Oylik to'lov:</span>
          <span className="font-medium text-success-600">
            {group.monthlyPrice.toLocaleString()} so'm
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Dars kunlari:</span>
          <span className="font-medium">{activeDays.length} kun</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Xona:</span>
          <span className="font-medium">{group.room}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Link
          href={`/admin/groups/${group.id}`}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
        >
          <EyeIcon className="h-4 w-4" />
          <span>Ko'rish</span>
        </Link>

        <Link
          href={`/admin/groups/${group.id}/edit`}
          className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <PencilIcon className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

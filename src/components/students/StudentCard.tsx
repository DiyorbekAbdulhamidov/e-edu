import Link from 'next/link';
import { Student } from '@/lib/types';
import Badge from '@/components/ui/Badge';
import { PencilIcon, EyeIcon } from '@/components/ui/Icons';

interface StudentCardProps {
  student: Student;
}

export default function StudentCard({ student }: StudentCardProps) {
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
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-700 font-semibold text-lg">
              {student.firstName.charAt(0)}
              {student.lastName.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {student.firstName} {student.lastName}
            </h3>
            <p className="text-sm text-gray-500">{student.phone}</p>
          </div>
        </div>

        <Badge variant={statusVariant[student.status]}>
          {statusText[student.status]}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Guruhlar:</span>
          <span className="font-medium">{student.groups.length}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Asosiy guruh:</span>
          <span className="font-medium">
            {student.assignedGroupName || 'Tanlanmagan'}
          </span>
        </div>

        {student.totalDebt > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Qarz:</span>
            <span className="font-medium text-danger-600">
              {student.totalDebt.toLocaleString()} so'm
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Link
          href={`/admin/students/${student.id}`}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
        >
          <EyeIcon className="h-4 w-4" />
          <span>Ko'rish</span>
        </Link>

        <Link
          href={`/admin/students/${student.id}/edit`}
          className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <PencilIcon className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

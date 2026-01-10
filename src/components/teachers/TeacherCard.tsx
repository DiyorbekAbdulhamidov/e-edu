'use client';

import { TeacherWithUser } from '@/lib/types';
import { format } from 'date-fns';

interface TeacherCardProps {
  teacher: TeacherWithUser;
  onEdit: (teacher: TeacherWithUser) => void;
}

export default function TeacherCard({ teacher, onEdit }: TeacherCardProps) {
  const isActive = teacher.status === 'active';

  const formatSalary = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-lg">
            {teacher.displayName.charAt(0).toUpperCase()}
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {teacher.displayName}
            </h3>
            <p className="text-sm text-gray-500">{teacher.email}</p>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${isActive
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700'
            }`}
        >
          {isActive ? 'Faol' : 'Nofaol'}
        </span>
      </div>

      {/* Phone */}
      {teacher.phone && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          {teacher.phone}
        </div>
      )}

      {/* Subjects */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-2">Fanlar:</p>
        <div className="flex flex-wrap gap-2">
          {teacher.subjects.map((subject, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md"
            >
              {subject}
            </span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-500 mb-1">Guruhlar</p>
          <p className="text-lg font-semibold text-gray-900">
            {teacher.groups.length}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Maosh</p>
          <p className="text-sm font-semibold text-gray-900">
            {formatSalary(teacher.salaryAmount)}
            <span className="text-xs text-gray-500 ml-1">
              {teacher.salaryType === 'fixed' ? '/oy' : '/talaba'}
            </span>
          </p>
        </div>
      </div>

      {/* Qualification */}
      {teacher.qualification && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1">Malaka:</p>
          <p className="text-sm text-gray-700">{teacher.qualification}</p>
        </div>
      )}

      {/* Hire Date */}
      <div className="text-xs text-gray-500 mb-4">
        Ishga qabul qilingan: {format(teacher.hireDate.toDate(), 'dd.MM.yyyy')}
      </div>

      {/* Actions */}
      <button
        onClick={() => onEdit(teacher)}
        className="w-full py-2 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors font-medium text-sm"
      >
        Tahrirlash
      </button>
    </div>
  );
}